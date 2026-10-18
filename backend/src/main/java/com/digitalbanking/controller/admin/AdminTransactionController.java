package com.digitalbanking.controller.admin;

import com.digitalbanking.domain.dto.request.filter.AdminTransactionFilterRequest;
import com.digitalbanking.domain.dto.response.AdminTransactionDetailResponse;
import com.digitalbanking.domain.dto.response.ApiResponse;
import com.digitalbanking.domain.dto.response.PageResponse;
import com.digitalbanking.domain.dto.response.TransactionResponse;
import com.digitalbanking.service.AdminTransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/transactions")
@RequiredArgsConstructor
@Slf4j(topic = "ADMIN-TRANSACTION-CONTROLLER")
@PreAuthorize("hasRole('ADMIN')")
public class AdminTransactionController {

    private final AdminTransactionService adminTransactionService;

    @GetMapping
    public ApiResponse<PageResponse<TransactionResponse>> getTransactions(
            @Valid AdminTransactionFilterRequest filterRequest
    ) {
        log.info("Admin querying transactions with filter: {}", filterRequest);

        PageResponse<TransactionResponse> response = adminTransactionService.getTransactions(filterRequest);

        return ApiResponse.ok("Transactions retrieved successfully", response);
    }

    @GetMapping("/{code}")
    public ApiResponse<AdminTransactionDetailResponse> getTransactionDetail(
            @PathVariable String code
    ) {
        log.info("Admin requesting transaction details for code: {}", code);

        AdminTransactionDetailResponse response = adminTransactionService.getTransactionDetail(code);

        return ApiResponse.ok("Transaction details retrieved successfully", response);
    }
}
