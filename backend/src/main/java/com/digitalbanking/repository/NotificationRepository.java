package com.digitalbanking.repository;

import com.digitalbanking.domain.entity.NotificationEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, UUID> {

    Page<NotificationEntity> findByCustomerIdOrderByCreatedAtDesc(UUID customerId, Pageable pageable);

    long countByCustomerIdAndIsReadFalse(UUID customerId);

    @Modifying
    @Query("""
            UPDATE NotificationEntity n
            SET n.isRead = true
            WHERE n.id = :notificationId
              AND n.customer.id = :customerId
            """)
    int markAsRead(@Param("notificationId") UUID notificationId, @Param("customerId") UUID customerId);

    @Modifying
    @Query("""
            UPDATE NotificationEntity n
            SET n.isRead = true
            WHERE n.customer.id = :customerId
              AND n.isRead = false
            """)
    int markAllAsRead(@Param("customerId") UUID customerId);
}