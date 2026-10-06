package com.digitalbanking.security;

import com.digitalbanking.domain.entity.CustomerEntity;
import com.digitalbanking.domain.entity.UserEntity;
import com.digitalbanking.exception.BusinessException;
import com.digitalbanking.exception.ErrorCode;
import com.digitalbanking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;


@Component
@RequiredArgsConstructor
@Slf4j(topic = "SECURITY-UTILS")
public class SecurityUtils {

    private final UserRepository userRepository;

    public UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User is not authenticated");
        }

        return UUID.fromString(authentication.getName());
    }

    public UserEntity getCurrentUser() {
        log.info("Fetching current authenticated user");
        UUID userId = getCurrentUserId();

        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    public CustomerEntity getCurrentCustomer() {
        UserEntity user = getCurrentUser();
        if (user.getCustomer() == null) {
            throw new BusinessException(ErrorCode.CUSTOMER_NOT_FOUND);
        }
        return user.getCustomer();
    }

    public UUID getCurrentCustomerId() {
        return getCurrentCustomer().getId();
    }
}
