package com.digitalbanking.domain.dto.response;

import com.digitalbanking.domain.enums.LedgerEntryType;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LedgerEntryResponse {

    private UUID id;

    private String accountNumber;

    private String accountOwnerName;

    private LedgerEntryType entryType;

    private BigDecimal amount;

    private BigDecimal balanceAfter;

    private String description;

    private Long sequenceNumber;

    private Instant entryTime;
}
