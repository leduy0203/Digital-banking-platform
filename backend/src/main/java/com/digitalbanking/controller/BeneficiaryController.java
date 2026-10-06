package com.digitalbanking.controller;

import com.digitalbanking.domain.dto.request.CreateBeneficiaryRequest;
import com.digitalbanking.domain.dto.response.ApiResponse;
import com.digitalbanking.domain.dto.response.BeneficiaryResponse;
import com.digitalbanking.security.SecurityUtils;
import com.digitalbanking.service.BeneficiaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/beneficiaries")
@RequiredArgsConstructor
@Slf4j(topic = "BENEFICIARY-CONTROLLER")
public class BeneficiaryController {

    private final BeneficiaryService beneficiaryService;
    private final SecurityUtils securityUtils;

    @GetMapping
    public ApiResponse<List<BeneficiaryResponse>> getMyBeneficiaries() {
        log.info("REST request to get my beneficiaries");

        UUID customerId = securityUtils.getCurrentCustomerId();

        List<BeneficiaryResponse> response = beneficiaryService.getMyBeneficiaries(customerId);
        return ApiResponse.ok("Beneficiaries retrieved successfully", response);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<BeneficiaryResponse> createBeneficiary(
            @Valid @RequestBody CreateBeneficiaryRequest request
    ) {
        log.info("REST request to add beneficiary: {}", request.getAccountNumber());

        UUID customerId = securityUtils.getCurrentCustomerId();

        BeneficiaryResponse response = beneficiaryService.createBeneficiary(customerId, request);
        return ApiResponse.ok("Beneficiary added successfully", response);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteBeneficiary(@PathVariable UUID id) {
        log.info("REST request to delete beneficiary: {}", id);

        UUID customerId = securityUtils.getCurrentCustomerId();

        beneficiaryService.deleteBeneficiary(id, customerId);
        return ApiResponse.ok("Beneficiary deleted successfully");
    }
}
