package com.digitalbanking.domain.dto.response;

import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BeneficiaryResponse {
    private UUID id;
    private String accountNumber;
    private String beneficiaryName;
    private String bankCode;
    private String aliasName;
    private Instant createdAt;
}