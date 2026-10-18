package com.digitalbanking.repository.specification;

import com.digitalbanking.domain.dto.request.filter.AdminTransactionFilterRequest;
import com.digitalbanking.domain.dto.request.filter.TransactionHistoryFilterRequest;
import com.digitalbanking.domain.entity.TransactionEntity;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class TransactionSpecification {

    public static Specification<TransactionEntity> filterHistory(
            UUID customerId,
            TransactionHistoryFilterRequest filter
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // filter with customerId
            Predicate isSource = cb.equal(root.get("sourceAccount").get("customer").get("id"), customerId);
            Predicate isTarget = cb.equal(root.get("targetAccount").get("customer").get("id"), customerId);
            predicates.add(cb.or(isSource, isTarget));

            // filter with accountNumber
            if (StringUtils.hasText(filter.getAccountNumber())) {
                Predicate matchSource = cb.equal(root.get("sourceAccount").get("accountNumber"), filter.getAccountNumber());
                Predicate matchTarget = cb.equal(root.get("targetAccountNumber"), filter.getAccountNumber());
                predicates.add(cb.or(matchSource, matchTarget));
            }

            if (filter.getType() != null) {
                predicates.add(cb.equal(root.get("transactionType"), filter.getType()));
            }

            if (filter.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), filter.getStatus()));
            }

            if (filter.getFromDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), filter.getFromDate()));
            }

            if (filter.getToDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), filter.getToDate()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<TransactionEntity> filterAdmin(
            AdminTransactionFilterRequest filter
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter == null) {
                return cb.conjunction();
            }

            if (StringUtils.hasText(filter.getTransactionCode())) {
                predicates.add(cb.like(cb.lower(root.get("transactionCode")), "%" + filter.getTransactionCode().trim().toLowerCase() + "%"));
            }

            if (StringUtils.hasText(filter.getAccountNumber())) {
                Predicate matchSource = cb.equal(root.get("sourceAccount").get("accountNumber"), filter.getAccountNumber().trim());
                Predicate matchTarget = cb.equal(root.get("targetAccountNumber"), filter.getAccountNumber().trim());
                predicates.add(cb.or(matchSource, matchTarget));
            }

            if (filter.getType() != null) {
                predicates.add(cb.equal(root.get("transactionType"), filter.getType()));
            }

            if (filter.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), filter.getStatus()));
            }

            if (filter.getFromDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), filter.getFromDate()));
            }

            if (filter.getToDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), filter.getToDate()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}