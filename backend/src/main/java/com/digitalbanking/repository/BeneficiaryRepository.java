package com.digitalbanking.repository;

import com.digitalbanking.domain.entity.BeneficiaryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BeneficiaryRepository extends JpaRepository<BeneficiaryEntity, UUID> {

    List<BeneficiaryEntity> findByCustomerIdOrderByCreatedAtDesc(UUID customerId);

    boolean existsByCustomerIdAndAccountNumberAndBankCode(UUID customerId, String accountNumber, String bankCode);

    Optional<BeneficiaryEntity> findByIdAndCustomerId(UUID id, UUID customerId);
}