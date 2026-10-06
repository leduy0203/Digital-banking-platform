package com.digitalbanking.domain.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BalanceChangeEvent {
    private String eventType;
    private String accountNumber;
    private BigDecimal amount;
    private String direction;
    private BigDecimal balanceAfter;
    private String counterpartName;
    private String transactionCode;
    private String description;
    private String message;
    private Instant timestamp;
}