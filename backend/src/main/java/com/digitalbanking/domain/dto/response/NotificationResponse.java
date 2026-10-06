package com.digitalbanking.domain.dto.response;

import com.digitalbanking.domain.enums.NotificationType;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

    private UUID id;
    private String title;
    private String message;
    private NotificationType notificationType;
    private String referenceType;
    private String referenceId;
    private boolean isRead;
    private Instant createdAt;
}