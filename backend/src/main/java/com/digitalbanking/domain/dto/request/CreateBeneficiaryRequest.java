package com.digitalbanking.domain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBeneficiaryRequest {

    @NotBlank(message = "Account number is required")
    @Size(max = 30, message = "Account number must not exceed 30 characters")
    private String accountNumber;

    @NotBlank(message = "Beneficiary name is required")
    @Size(max = 150, message = "Beneficiary name must not exceed 150 characters")
    private String beneficiaryName;

    @Builder.Default
    private String bankCode = "INTERNAL";

    @Size(max = 100, message = "Alias name must not exceed 100 characters")
    private String aliasName;
}
