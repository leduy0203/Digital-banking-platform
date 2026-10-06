package com.digitalbanking.controller;

import com.digitalbanking.domain.dto.response.ApiResponse;
import com.digitalbanking.domain.dto.response.NotificationResponse;
import com.digitalbanking.domain.dto.response.PageResponse;
import com.digitalbanking.security.SecurityUtils;
import com.digitalbanking.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Slf4j(topic = "NOTIFICATION-CONTROLLER")
public class NotificationController {

    private final NotificationService notificationService;
    private final SecurityUtils securityUtils;

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping
    public ApiResponse<PageResponse<NotificationResponse>> getMyNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("getMyNotifications");

        UUID customerId = securityUtils.getCurrentCustomerId();
        PageResponse<NotificationResponse> response =
                notificationService.getMyNotifications(customerId, page, size);

        return ApiResponse.ok("Notifications retrieved successfully", response);
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/unread-count")
    public ApiResponse<Long> getUnreadCount() {
        log.info("getUnreadCount");

        UUID customerId = securityUtils.getCurrentCustomerId();
        long count = notificationService.getUnreadCount(customerId);

        return ApiResponse.ok("Unread count retrieved successfully", count);
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @PutMapping("/{id}/read")
    public ApiResponse<Void> markAsRead(@PathVariable UUID id) {
        log.info("markAsRead");

        UUID customerId = securityUtils.getCurrentCustomerId();
        notificationService.markAsRead(id, customerId);

        return ApiResponse.ok("Notification marked as read successfully");
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @PutMapping("/read-all")
    public ApiResponse<Void> markAllAsRead() {
        log.info("markAllAsRead");

        UUID customerId = securityUtils.getCurrentCustomerId();
        notificationService.markAllAsRead(customerId);

        return ApiResponse.ok("All notifications marked as read successfully");
    }
}