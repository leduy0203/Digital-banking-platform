package com.digitalbanking.service.impl;

import com.digitalbanking.domain.dto.response.BalanceChangeEvent;
import com.digitalbanking.domain.dto.response.NotificationResponse;
import com.digitalbanking.domain.dto.response.PageResponse;
import com.digitalbanking.domain.entity.CustomerEntity;
import com.digitalbanking.domain.entity.NotificationEntity;
import com.digitalbanking.domain.enums.NotificationType;
import com.digitalbanking.exception.BusinessException;
import com.digitalbanking.exception.ErrorCode;
import com.digitalbanking.repository.NotificationRepository;
import com.digitalbanking.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "NOTIFICATION-SERVICE")
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public void sendBalanceNotification(
            CustomerEntity customer,
            String accountNumber,
            BigDecimal amount,
            String direction,
            String counterpartName,
            String transactionCode,
            String description,
            BigDecimal balanceAfter
    ) {
        boolean incoming = "IN".equalsIgnoreCase(direction);
        String title = incoming ? "Biến động số dư: Nhận tiền" : "Biến động số dư: Chuyển tiền";
        String sign = incoming ? "+" : "-";
        String formattedAmount = sign + String.format("%,.0f VND", amount);
        String message = String.format(
                "TK %s: %s | %s | Số dư: %,.0f VND",
                accountNumber,
                formattedAmount,
                description != null ? description : "",
                balanceAfter
        );

        // Save db notification
        NotificationEntity notification = NotificationEntity.builder()
                .customer(customer)
                .title(title)
                .message(message)
                .notificationType(NotificationType.TRANSACTION)
                .referenceType("TRANSACTION")
                .referenceId(transactionCode)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
        log.info("Notification sent successfully");

        BalanceChangeEvent event = BalanceChangeEvent.builder()
                .eventType(incoming ? "TRANSFER_RECEIVED" : "TRANSFER_SENT")
                .accountNumber(accountNumber)
                .amount(amount)
                .direction(direction)
                .balanceAfter(balanceAfter)
                .counterpartName(counterpartName)
                .transactionCode(transactionCode)
                .description(description)
                .message(message)
                .timestamp(Instant.now())
                .build();

        // Send WebSocket notification after transaction commit
        sendAfterCommit(customer, event);
    }

    private void sendAfterCommit(CustomerEntity customer, BalanceChangeEvent event) {
        String userId = customer.getUser().getId().toString();
        Runnable pushTask = createPushTask(userId, event);

        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    CompletableFuture.runAsync(pushTask);
                }
            });
        } else {
            CompletableFuture.runAsync(pushTask);
        }
    }

    private Runnable createPushTask(String userId, BalanceChangeEvent event) {
        return () -> {
            try {
                String destination = "/queue/notifications";
                messagingTemplate.convertAndSendToUser(
                        userId,
                        destination,
                        event
                );
                log.info("WebSocket notification pushed to userId={}, destination={}", userId, destination);
            } catch (Exception e) {
                log.error("Failed to push WebSocket notification to userId={}: {}", userId, e.getMessage());
            }
        };
    }

    @Override
    public PageResponse<NotificationResponse> getMyNotifications(UUID customerId, int page, int size) {
        log.info("Fetching notifications for customerId: {}, page: {}, size: {}", customerId, page, size);

        Page<NotificationEntity> result = notificationRepository
                .findByCustomerIdOrderByCreatedAtDesc(customerId, PageRequest.of(page, size));

        return PageResponse.<NotificationResponse>builder()
                .items(result.getContent().stream().map(this::mapToResponse).toList())
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .isLast(result.isLast())
                .build();
    }

    @Override
    public void markAsRead(UUID notificationId, UUID customerId) {
        int updated = notificationRepository.markAsRead(notificationId, customerId);
        if (updated == 0) {
            throw new BusinessException(ErrorCode.NOTIFICATION_NOT_FOUND);
        }
    }

    @Override
    public long getUnreadCount(UUID customerId) {
        return notificationRepository.countByCustomerIdAndIsReadFalse(customerId);
    }

    @Override
    public void markAllAsRead(UUID customerId) {
        notificationRepository.markAllAsRead(customerId);
    }

    private NotificationResponse mapToResponse(NotificationEntity entity) {
        return NotificationResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .message(entity.getMessage())
                .notificationType(entity.getNotificationType())
                .referenceType(entity.getReferenceType())
                .referenceId(entity.getReferenceId())
                .isRead(entity.isRead())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
