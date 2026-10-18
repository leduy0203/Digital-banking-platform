package com.digitalbanking.service.impl;

import com.digitalbanking.domain.dto.request.filter.AdminTransactionFilterRequest;
import com.digitalbanking.domain.dto.response.AdminTransactionDetailResponse;
import com.digitalbanking.domain.dto.response.LedgerEntryResponse;
import com.digitalbanking.domain.dto.response.PageResponse;
import com.digitalbanking.domain.dto.response.TransactionResponse;
import com.digitalbanking.domain.entity.LedgerEntryEntity;
import com.digitalbanking.domain.entity.TransactionEntity;
import com.digitalbanking.exception.BusinessException;
import com.digitalbanking.exception.ErrorCode;
import com.digitalbanking.repository.LedgerEntryRepository;
import com.digitalbanking.repository.TransactionRepository;
import com.digitalbanking.repository.specification.TransactionSpecification;
import com.digitalbanking.service.AdminTransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "ADMIN-TRANSACTION-SERVICE")
public class AdminTransactionServiceImpl implements AdminTransactionService {

    private final TransactionRepository transactionRepository;
    private final LedgerEntryRepository ledgerEntryRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TransactionResponse> getTransactions(AdminTransactionFilterRequest filterRequest) {
        log.info("Admin querying transactions with filter: {}", filterRequest);

        Specification<TransactionEntity> spec = TransactionSpecification.filterAdmin(filterRequest);
        Pageable pageable = filterRequest.toPageable("createdAt");

        Page<TransactionEntity> pageResult = transactionRepository.findAll(spec, pageable);
        Page<TransactionResponse> responsePage = pageResult.map(this::mapToResponse);

        return PageResponse.from(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminTransactionDetailResponse getTransactionDetail(String transactionCode) {
        log.info("Admin fetching transaction detail with ledger audit for code: {}", transactionCode);

        TransactionEntity txn = transactionRepository.findByTransactionCode(transactionCode)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.TRANSACTION_NOT_FOUND,
                        "Transaction not found with code: " + transactionCode
                ));

        List<LedgerEntryEntity> ledgers = ledgerEntryRepository.findByTransactionId(txn.getId());

        List<LedgerEntryResponse> ledgerResponses = ledgers.stream()
                .map(this::mapToLedgerResponse)
                .collect(Collectors.toList());

        String sourceAccNum = txn.getSourceAccount() != null ? txn.getSourceAccount().getAccountNumber() : null;

        String sourceAccName = (txn.getSourceAccount() != null && txn.getSourceAccount().getCustomer() != null)
                ? txn.getSourceAccount().getCustomer().getFullName() : null;

        String targetAccNum = txn.getTargetAccount() != null
                ? txn.getTargetAccount().getAccountNumber()
                : txn.getTargetAccountNumber();

        String targetAccName = (txn.getTargetAccount() != null && txn.getTargetAccount().getCustomer() != null)
                ? txn.getTargetAccount().getCustomer().getFullName()
                : txn.getTargetAccountName();

        return AdminTransactionDetailResponse.builder()
                .id(txn.getId())
                .transactionCode(txn.getTransactionCode())
                .sourceAccountNumber(sourceAccNum)
                .sourceAccountName(sourceAccName)
                .targetAccountNumber(targetAccNum)
                .targetAccountName(targetAccName)
                .targetBankCode(txn.getTargetBankCode())
                .targetBankName(txn.getTargetBankName())
                .amount(txn.getAmount())
                .feeAmount(txn.getFeeAmount())
                .description(txn.getDescription())
                .transactionType(txn.getTransactionType())
                .status(txn.getStatus())
                .idempotencyKey(txn.getIdempotencyKey())
                .completedAt(txn.getCompletedAt())
                .createdAt(txn.getCreatedAt())
                .ledgerEntries(ledgerResponses)
                .build();
    }

    private LedgerEntryResponse mapToLedgerResponse(LedgerEntryEntity entry) {
        String accNum = entry.getAccount() != null ? entry.getAccount().getAccountNumber() : null;
        String ownerName = (entry.getAccount() != null && entry.getAccount().getCustomer() != null)
                ? entry.getAccount().getCustomer().getFullName() : null;

        return LedgerEntryResponse.builder()
                .id(entry.getId())
                .accountNumber(accNum)
                .accountOwnerName(ownerName)
                .entryType(entry.getEntryType())
                .amount(entry.getAmount())
                .balanceAfter(entry.getBalanceAfter())
                .description(entry.getDescription())
                .sequenceNumber(entry.getSequenceNumber())
                .entryTime(entry.getEntryTime())
                .build();
    }

    private TransactionResponse mapToResponse(TransactionEntity txn) {
        String sourceAccNum = txn.getSourceAccount() != null ? txn.getSourceAccount().getAccountNumber() : null;
        String sourceAccName = (txn.getSourceAccount() != null && txn.getSourceAccount().getCustomer() != null)
                ? txn.getSourceAccount().getCustomer().getFullName() : null;

        String targetAccNum = txn.getTargetAccount() != null
                ? txn.getTargetAccount().getAccountNumber()
                : txn.getTargetAccountNumber();

        String targetAccName = (txn.getTargetAccount() != null && txn.getTargetAccount().getCustomer() != null)
                ? txn.getTargetAccount().getCustomer().getFullName()
                : txn.getTargetAccountName();

        return TransactionResponse.builder()
                .id(txn.getId())
                .transactionCode(txn.getTransactionCode())
                .sourceAccountNumber(sourceAccNum)
                .sourceAccountName(sourceAccName)
                .targetAccountNumber(targetAccNum)
                .targetAccountName(targetAccName)
                .targetBankCode(txn.getTargetBankCode())
                .targetBankName(txn.getTargetBankName())
                .amount(txn.getAmount())
                .feeAmount(txn.getFeeAmount())
                .description(txn.getDescription())
                .transactionType(txn.getTransactionType())
                .status(txn.getStatus())
                .completedAt(txn.getCompletedAt())
                .createdAt(txn.getCreatedAt())
                .build();
    }
}
