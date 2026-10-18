package com.digitalbanking.service.impl;

import com.digitalbanking.domain.dto.response.TransactionResponse;
import com.digitalbanking.domain.entity.LedgerEntryEntity;
import com.digitalbanking.domain.entity.TransactionEntity;
import com.digitalbanking.domain.enums.LedgerEntryType;
import com.digitalbanking.domain.enums.TransactionStatus;
import com.digitalbanking.exception.BusinessException;
import com.digitalbanking.exception.ErrorCode;
import com.digitalbanking.repository.LedgerEntryRepository;
import com.digitalbanking.repository.TransactionRepository;
import com.digitalbanking.repository.dao.AccountJdbcRepository;
import com.digitalbanking.repository.dao.TransactionJdbcRepository;
import com.digitalbanking.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j(topic = "TRANSFER-TX-EXECUTOR")
public class TransferTxExecutor {

    private static final long TRANSACTION_EXPIRATION_SECONDS = 300; // five minutes

    private final TransactionRepository transactionRepository;
    private final TransactionJdbcRepository transactionJdbcRepository;
    private final AccountJdbcRepository accountJdbcRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final NotificationService notificationService;

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public TransactionResponse executeTransfer(String transactionCode, UUID currentCustomerId) {
        log.info("Executing transfer transaction: {} for customer: {}", transactionCode, currentCustomerId);

        TransactionEntity txn = transactionRepository.findByTransactionCode(transactionCode)
                .orElseThrow(() -> {
                    log.info("Transaction not found: {}", transactionCode);
                    return new BusinessException(ErrorCode.TRANSACTION_FAILED);
                });

        if (!txn.getSourceAccount().getCustomer().getId().equals(currentCustomerId)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        // claim transaction PENDING -> PROCESSING
        if (!transactionJdbcRepository.markProcessing(transactionCode)) {
            throw new BusinessException(ErrorCode.TRANSACTION_FAILED);
        }

        //expires after 5 minutes
        if (isExpired(txn.getCreatedAt())) {
            transactionJdbcRepository.markFailed(transactionCode, Instant.now());
            throw new BusinessException(ErrorCode.TRANSACTION_FAILED);
        }

        String sourceAccountNumber = txn.getSourceAccount().getAccountNumber();
        String targetAccountNumber = txn.getTargetAccount().getAccountNumber();
        BigDecimal amount = txn.getAmount();

        // locking
        accountJdbcRepository.lockAccountsForTransfer(sourceAccountNumber, targetAccountNumber);

        BigDecimal sourceBalanceAfter = accountJdbcRepository.debit(sourceAccountNumber, amount);
        BigDecimal targetBalanceAfter = accountJdbcRepository.credit(targetAccountNumber, amount);

        LedgerEntryEntity debitLedger = LedgerEntryEntity.builder()
                .transaction(txn)
                .account(txn.getSourceAccount())
                .entryType(LedgerEntryType.DEBIT)
                .amount(amount)
                .balanceAfter(sourceBalanceAfter)
                .description("Transfer money to " + targetAccountNumber)
                .build();

        LedgerEntryEntity creditLedger = LedgerEntryEntity.builder()
                .transaction(txn)
                .account(txn.getTargetAccount())
                .entryType(LedgerEntryType.CREDIT)
                .amount(amount)
                .balanceAfter(targetBalanceAfter)
                .description("Receive money from " + sourceAccountNumber)
                .build();

        ledgerEntryRepository.saveAll(List.of(debitLedger, creditLedger));
        log.info("Ledger entries created for transaction: {}", transactionCode);

        // claim transaction PROCESSING -> COMPLETED
        Instant completedAt = Instant.now();
        if (!transactionJdbcRepository.markCompleted(transactionCode, completedAt)) {
            throw new BusinessException(ErrorCode.TRANSACTION_FAILED);
        }

        txn.setStatus(TransactionStatus.COMPLETED);
        txn.setCompletedAt(completedAt);
        log.info("Transfer executed successfully: txnCode={}, amount={}", transactionCode, amount);

        sendTransferNotifications(txn, sourceBalanceAfter, targetBalanceAfter);

        return TransactionResponse.builder()
                .id(txn.getId())
                .transactionCode(txn.getTransactionCode())
                .sourceAccountNumber(sourceAccountNumber)
                .sourceAccountName(txn.getSourceAccount().getCustomer().getFullName())
                .targetAccountNumber(targetAccountNumber)
                .targetAccountName(txn.getTargetAccountName())
                .amount(txn.getAmount())
                .feeAmount(txn.getFeeAmount())
                .description(txn.getDescription())
                .transactionType(txn.getTransactionType())
                .status(TransactionStatus.COMPLETED)
                .completedAt(completedAt)
                .createdAt(txn.getCreatedAt())
                .build();


    }

    private boolean isExpired(Instant createdAt) {
        return createdAt.plusSeconds(TRANSACTION_EXPIRATION_SECONDS).isBefore(Instant.now());
    }

    private void sendTransferNotifications(
            TransactionEntity txn,
            BigDecimal sourceBalanceAfter,
            BigDecimal targetBalanceAfter
    ) {
        String transactionCode = txn.getTransactionCode();
        BigDecimal amount = txn.getAmount();
        String description = txn.getDescription();

        // Send notification for Sender (A) - OUT (-)
        notificationService.sendBalanceNotification(
                txn.getSourceAccount().getCustomer(),
                txn.getSourceAccount().getAccountNumber(),
                amount,
                "OUT",
                txn.getTargetAccountName(),
                transactionCode,
                description,
                sourceBalanceAfter
        );

        // 2. Send notification for Receiver (B) - IN (+)
        notificationService.sendBalanceNotification(
                txn.getTargetAccount().getCustomer(),
                txn.getTargetAccount().getAccountNumber(),
                amount,
                "IN",
                txn.getSourceAccount().getCustomer().getFullName(),
                transactionCode,
                description,
                targetBalanceAfter
        );
    }
}
