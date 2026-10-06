package com.digitalbanking.service.impl;

import com.digitalbanking.domain.dto.request.CreateBeneficiaryRequest;
import com.digitalbanking.domain.dto.response.BeneficiaryResponse;
import com.digitalbanking.domain.entity.BeneficiaryEntity;
import com.digitalbanking.domain.entity.CustomerEntity;
import com.digitalbanking.exception.BusinessException;
import com.digitalbanking.exception.ErrorCode;
import com.digitalbanking.repository.AccountRepository;
import com.digitalbanking.repository.BeneficiaryRepository;
import com.digitalbanking.repository.CustomerRepository;
import com.digitalbanking.service.BeneficiaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "BENEFICIARY-SERVICE")
public class BeneficiaryServiceImpl implements BeneficiaryService {

    private static final String DEFAULT_BANK_CODE = "INTERNAL";

    private final BeneficiaryRepository beneficiaryRepository;
    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;


    @Override
    public List<BeneficiaryResponse> getMyBeneficiaries(UUID customerId) {
        log.info("Fetching beneficiaries for customer: {}", customerId);
        return beneficiaryRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public BeneficiaryResponse createBeneficiary(UUID customerId, CreateBeneficiaryRequest request) {
        String accountNumber = request.getAccountNumber().trim();
        log.info("Adding beneficiary {} for customer: {}", accountNumber, customerId);

        CustomerEntity customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CUSTOMER_NOT_FOUND));

        // Check if the account number exists in the system
        boolean accountExists = accountRepository.existsByAccountNumber(accountNumber);
        if (!accountExists) {
            throw new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND);
        }
        // if beneficiary already exists for this customer, throw exception
        boolean alreadySaved = beneficiaryRepository
                .existsByCustomerIdAndAccountNumberAndBankCode(customerId, accountNumber, DEFAULT_BANK_CODE);
        if (alreadySaved) {
            throw new BusinessException(ErrorCode.BENEFICIARY_ALREADY_EXISTS);
        }

        // Save beneficiary
        BeneficiaryEntity entity = BeneficiaryEntity.builder()
                .customer(customer)
                .accountNumber(accountNumber)
                .beneficiaryName(request.getBeneficiaryName().trim())
                .bankCode(DEFAULT_BANK_CODE)
                .aliasName(request.getAliasName() != null ? request.getAliasName().trim() : null)
                .build();

        entity = beneficiaryRepository.save(entity);
        log.info("Beneficiary saved successfully with id: {}", entity.getId());

        return mapToResponse(entity);
    }

    @Override
    public void deleteBeneficiary(UUID id, UUID customerId) {
        log.info("Deleting beneficiary id: {} for customer: {}", id, customerId);

        BeneficiaryEntity entity = beneficiaryRepository.findByIdAndCustomerId(id, customerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BENEFICIARY_NOT_FOUND));

        beneficiaryRepository.delete(entity);
        log.info("Beneficiary id: {} deleted successfully", id);
    }

    private BeneficiaryResponse mapToResponse(BeneficiaryEntity entity) {
        return BeneficiaryResponse.builder()
                .id(entity.getId())
                .accountNumber(entity.getAccountNumber())
                .beneficiaryName(entity.getBeneficiaryName())
                .bankCode(entity.getBankCode())
                .aliasName(entity.getAliasName())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
