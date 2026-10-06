package com.digitalbanking.service;

import com.digitalbanking.domain.dto.request.CreateBeneficiaryRequest;
import com.digitalbanking.domain.dto.response.BeneficiaryResponse;

import java.util.List;
import java.util.UUID;

public interface BeneficiaryService {

    List<BeneficiaryResponse> getMyBeneficiaries(UUID customerId);

    BeneficiaryResponse createBeneficiary(UUID customerId, CreateBeneficiaryRequest request);

    void deleteBeneficiary(UUID id, UUID customerId);
}
