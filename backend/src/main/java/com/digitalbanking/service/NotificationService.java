package com.digitalbanking.service;

import com.digitalbanking.domain.dto.response.NotificationResponse;
import com.digitalbanking.domain.dto.response.PageResponse;
import com.digitalbanking.domain.entity.CustomerEntity;

import java.math.BigDecimal;
import java.util.UUID;

public interface NotificationService {

    PageResponse<NotificationResponse> getMyNotifications(UUID customerId, int page, int size);

    void markAsRead(UUID notificationId, UUID customerId);

    long getUnreadCount(UUID customerId);

    void markAllAsRead(UUID customerId);

    void sendBalanceNotification(
            CustomerEntity customer,
            String accountNumber,
            BigDecimal amount,
            String direction,
            String counterpartName,
            String transactionCode,
            String description,
            BigDecimal balanceAfter
    );
}
