package com.digitalbanking.domain.dto.response;

import com.digitalbanking.domain.enums.TransactionStatus;
import com.digitalbanking.domain.enums.TransactionType;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminTransactionDetailResponse {

    private UUID id;

    private String transactionCode;

    private String sourceAccountNumber;

    private String sourceAccountName;

    private String targetAccountNumber;

    private String targetAccountName;

    private String targetBankCode;

    private String targetBankName;

    private BigDecimal amount;

    private BigDecimal feeAmount;

    private String description;

    private TransactionType transactionType;

    private TransactionStatus status;

    private String idempotencyKey;

    private Instant completedAt;

    private Instant createdAt;

    private List<LedgerEntryResponse> ledgerEntries;
}
