package com.digitalbanking.service.impl;

import com.digitalbanking.domain.dto.request.DepositCashRequest;
import com.digitalbanking.domain.dto.request.WithdrawCashRequest;
import com.digitalbanking.domain.dto.response.CashTransactionResponse;
import com.digitalbanking.domain.entity.*;
import com.digitalbanking.domain.enums.*;
import com.digitalbanking.exception.BusinessException;
import com.digitalbanking.exception.ErrorCode;
import com.digitalbanking.repository.*;
import com.digitalbanking.repository.dao.AccountJdbcRepository;
import com.digitalbanking.service.CashOperationService;
import com.digitalbanking.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "CASH-OPERATION-SERVICE")
public class CashOperationServiceImpl implements CashOperationService {

    private final AccountRepository accountRepository;
    private final EmployeeRepository employeeRepository;
    private final TransactionRepository transactionRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final CashTransactionRepository cashTransactionRepository;
    private final AccountJdbcRepository accountJdbcRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public CashTransactionResponse depositCash(DepositCashRequest request, UUID employeeUserId) {
        log.info("Processing cash deposit for account: {}", request.getAccountNumber());

        // Validate the target account
        AccountEntity account = getByAccountNumber(request.getAccountNumber());

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.ACCOUNT_LOCKED);
        }

        // Validate teller information
        EmployeeEntity teller = getEmployeeByUserId(employeeUserId);

        // Perform an atomic credit
        BigDecimal balanceAfter = accountJdbcRepository.credit(
                account.getAccountNumber(),
                request.getAmount()
        );

        Instant now = Instant.now();

        String transactionCode = "TXN-DEP-" +
                UUID.randomUUID().toString().substring(0, 12).toUpperCase();

        String referenceCode = "CASH-DEP-" +
                UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        String description = request.getDescription() != null
                ? request.getDescription()
                : "Cash deposit at counter";

        // Save the transaction history for customer
        TransactionEntity transaction = TransactionEntity.builder()
                .transactionCode(transactionCode)
                .targetAccount(account)
                .targetAccountNumber(account.getAccountNumber())
                .targetAccountName(account.getCustomer().getFullName())
                .amount(request.getAmount())
                .feeAmount(BigDecimal.ZERO)
                .description(description)
                .transactionType(TransactionType.CASH_DEPOSIT)
                .status(TransactionStatus.COMPLETED)
                .completedAt(now)
                .build();

        TransactionEntity savedTransaction = transactionRepository.save(transaction);

        // Save record for transaction
        LedgerEntryEntity ledgerEntry = LedgerEntryEntity.builder()
                .transaction(savedTransaction)
                .account(account)
                .entryType(LedgerEntryType.CREDIT)
                .amount(request.getAmount())
                .balanceAfter(balanceAfter)
                .description("Cash deposit: " + description)
                .entryTime(now)
                .build();

        ledgerEntryRepository.save(ledgerEntry);

        CashTransactionEntity cashTransaction = CashTransactionEntity.builder()
                .referenceCode(referenceCode)
                .account(account)
                .teller(teller)
                .operationType(CashOperationType.DEPOSIT)
                .amount(request.getAmount())
                .depositorName(request.getDepositorName())
                .depositorNationalId(request.getDepositorNationalId())
                .createdAt(now)
                .build();

        cashTransactionRepository.save(cashTransaction);

        log.info("Cash deposit completed successfully: {}", transactionCode);

        // Send notification to customer about balance change
        notificationService.sendBalanceNotification(
                account.getCustomer(),
                account.getAccountNumber(),
                request.getAmount(),
                "IN",
                "Quầy giao dịch (Teller)",
                transactionCode,
                description,
                balanceAfter
        );

        return CashTransactionResponse.builder()
                .referenceCode(referenceCode)
                .transactionCode(transactionCode)
                .accountNumber(account.getAccountNumber())
                .accountName(account.getCustomer().getFullName())
                .operationType(CashOperationType.DEPOSIT)
                .amount(request.getAmount())
                .balanceAfter(balanceAfter)
                .tellerCode(teller.getEmployeeCode())
                .tellerName(teller.getFullName())
                .depositorName(request.getDepositorName())
                .description(description)
                .createdAt(now)
                .build();
    }

    @Override
    public CashTransactionResponse withdrawCash(WithdrawCashRequest request, UUID employeeUserId) {
        log.info("Processing cash withdrawal for account: {}", request.getAccountNumber());

        // Validate the target account
        AccountEntity account = getByAccountNumber(request.getAccountNumber());

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.ACCOUNT_LOCKED);
        }

        // Validate teller information
        EmployeeEntity teller = getEmployeeByUserId(employeeUserId);

        BigDecimal balanceAfter = accountJdbcRepository.debit(
                account.getAccountNumber(),
                request.getAmount()
        );

        Instant now = Instant.now();
        String transactionCode = "TXN-WDR-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
        String referenceCode = "CASH-WDR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String description = request.getDescription() != null
                ? request.getDescription()
                : "Cash withdrawal at counter";

        // Save record for transaction history
        TransactionEntity transaction = TransactionEntity.builder()
                .transactionCode(transactionCode)
                .sourceAccount(account)
                .amount(request.getAmount())
                .feeAmount(BigDecimal.ZERO)
                .description(description)
                .transactionType(TransactionType.CASH_WITHDRAWAL)
                .status(TransactionStatus.COMPLETED)
                .completedAt(now)
                .build();
        TransactionEntity savedTransaction = transactionRepository.save(transaction);

        LedgerEntryEntity ledgerEntry = LedgerEntryEntity.builder()
                .transaction(savedTransaction)
                .account(account)
                .entryType(LedgerEntryType.DEBIT)
                .amount(request.getAmount())
                .balanceAfter(balanceAfter)
                .description("Cash withdrawal: " + description)
                .entryTime(now)
                .build();
        ledgerEntryRepository.save(ledgerEntry);

        CashTransactionEntity cashTransaction = CashTransactionEntity.builder()
                .referenceCode(referenceCode)
                .account(account)
                .teller(teller)
                .operationType(CashOperationType.WITHDRAWAL)
                .amount(request.getAmount())
                .depositorName(request.getWithdrawerName())
                .depositorNationalId(request.getWithdrawerNationalId())
                .createdAt(now)
                .build();
        cashTransactionRepository.save(cashTransaction);
        log.info("Cash withdrawal completed successfully: {}", transactionCode);

        // Send notification to customer about balance change
        notificationService.sendBalanceNotification(
                account.getCustomer(),
                account.getAccountNumber(),
                request.getAmount(),
                "OUT",
                "Quầy giao dịch (Teller)",
                transactionCode,
                description,
                balanceAfter
        );

        return CashTransactionResponse.builder()
                .referenceCode(referenceCode)
                .transactionCode(transactionCode)
                .accountNumber(account.getAccountNumber())
                .accountName(account.getCustomer().getFullName())
                .operationType(CashOperationType.WITHDRAWAL)
                .amount(request.getAmount())
                .balanceAfter(balanceAfter)
                .tellerCode(teller.getEmployeeCode())
                .tellerName(teller.getFullName())
                .depositorName(request.getWithdrawerName())
                .description(description)
                .createdAt(now)
                .build();
    }

    private AccountEntity getByAccountNumber(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND));
    }

    private EmployeeEntity getEmployeeByUserId(UUID userId) {
        return employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.EMPLOYEE_NOT_FOUND));
    }
}