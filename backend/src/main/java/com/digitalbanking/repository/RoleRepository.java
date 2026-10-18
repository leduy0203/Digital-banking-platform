package com.digitalbanking.repository;

import com.digitalbanking.domain.entity.RoleEntity;
import com.digitalbanking.domain.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<RoleEntity, UUID> {
    Optional<RoleEntity> findByRoleCode(UserRole roleCode);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(u) FROM UserEntity u JOIN u.roles r WHERE r.id = :roleId")
    long countUsersByRoleId(@org.springframework.data.repository.query.Param("roleId") UUID roleId);
}
