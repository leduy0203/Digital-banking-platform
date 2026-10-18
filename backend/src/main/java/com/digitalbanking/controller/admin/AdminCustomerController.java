package com.digitalbanking.controller.admin;

import com.digitalbanking.domain.dto.request.filter.CustomerFilterRequest;
import com.digitalbanking.domain.dto.response.ApiResponse;
import com.digitalbanking.domain.dto.response.CustomerDetailResponse;
import com.digitalbanking.domain.dto.response.CustomerResponse;
import com.digitalbanking.domain.dto.response.PageResponse;
import com.digitalbanking.domain.enums.UserStatus;
import com.digitalbanking.service.AdminCustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/customers")
@RequiredArgsConstructor
@Slf4j(topic = "ADMIN-CUSTOMER-CONTROLLER")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCustomerController {

    private final AdminCustomerService adminCustomerService;

    @GetMapping
    public ApiResponse<PageResponse<CustomerResponse>> getCustomers(
            @Valid CustomerFilterRequest filterRequest
    ) {
        log.info("Admin querying customers with filter: {}", filterRequest);

        PageResponse<CustomerResponse> response = adminCustomerService.getCustomers(filterRequest);

        return ApiResponse.ok("Customer list retrieved successfully", response);
    }

    @GetMapping("/{cif}")
    public ApiResponse<CustomerDetailResponse> getCustomerDetail(
            @PathVariable String cif
    ) {
        log.info("Admin requesting customer detail for CIF: {}", cif);

        CustomerDetailResponse response = adminCustomerService.getCustomerByCif(cif);

        return ApiResponse.ok("Customer details retrieved successfully", response);
    }

    @PatchMapping("/{cif}/status")
    public ApiResponse<CustomerResponse> updateCustomerStatus(
            @PathVariable String cif,
            @RequestParam UserStatus status
    ) {
        log.info("Admin updating status of customer CIF: {} to {}", cif, status);

        CustomerResponse response = adminCustomerService.updateCustomerStatus(cif, status);

        return ApiResponse.ok("Customer status updated successfully", response);
    }
}
