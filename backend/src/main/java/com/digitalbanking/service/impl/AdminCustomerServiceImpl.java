package com.digitalbanking.service.impl;

import com.digitalbanking.domain.dto.request.filter.CustomerFilterRequest;
import com.digitalbanking.domain.dto.response.CustomerDetailResponse;
import com.digitalbanking.domain.dto.response.CustomerResponse;
import com.digitalbanking.domain.dto.response.PageResponse;
import com.digitalbanking.domain.entity.CustomerEntity;
import com.digitalbanking.domain.entity.KycDocumentEntity;
import com.digitalbanking.domain.entity.UserEntity;
import com.digitalbanking.domain.enums.KycStatus;
import com.digitalbanking.domain.enums.UserStatus;
import com.digitalbanking.exception.BusinessException;
import com.digitalbanking.exception.ErrorCode;
import com.digitalbanking.repository.CustomerRepository;
import com.digitalbanking.repository.KycDocumentRepository;
import com.digitalbanking.repository.UserRepository;
import com.digitalbanking.service.AdminCustomerService;
import com.digitalbanking.service.EmployeeCustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "ADMIN-CUSTOMER-SERVICE")
public class AdminCustomerServiceImpl implements AdminCustomerService {

    private final EmployeeCustomerService employeeCustomerService;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final KycDocumentRepository kycDocumentRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CustomerResponse> getCustomers(CustomerFilterRequest filterRequest) {
        log.info("Admin fetching customer list with filter: {}", filterRequest);
        return employeeCustomerService.getCustomers(filterRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerDetailResponse getCustomerByCif(String cif) {
        log.info("Admin fetching customer detail for CIF: {}", cif);
        return employeeCustomerService.getCustomerByCif(cif);
    }

    @Override
    @Transactional
    public CustomerResponse updateCustomerStatus(String cif, UserStatus status) {
        log.info("Admin updating status of customer CIF: {} to {}", cif, status);

        CustomerEntity customer = customerRepository.findByCustomerCode(cif)
                .orElseThrow(() -> new BusinessException(ErrorCode.CUSTOMER_NOT_FOUND));

        UserEntity user = customer.getUser();
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        user.setStatus(status);
        userRepository.save(user);

        log.info("Successfully updated status of customer CIF: {} to {}", cif, status);

        KycStatus kycStatus = kycDocumentRepository.findTopByCustomerIdOrderBySubmittedAtDesc(customer.getId())
                .map(KycDocumentEntity::getStatus)
                .orElse(KycStatus.NOT_SUBMITTED);

        return CustomerResponse.builder()
                .id(customer.getId())
                .customerCode(customer.getCustomerCode())
                .fullName(customer.getFullName())
                .nationalId(customer.getNationalId())
                .dateOfBirth(customer.getDateOfBirth())
                .address(customer.getAddress())
                .avatarUrl(customer.getAvatarUrl())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .userStatus(user.getStatus())
                .kycStatus(kycStatus)
                .hasTransactionPin(customer.getTransactionPinHash() != null)
                .createdAt(customer.getCreatedAt())
                .build();
    }
}
