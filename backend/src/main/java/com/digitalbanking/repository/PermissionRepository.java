package com.digitalbanking.repository;

import com.digitalbanking.domain.entity.PermissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface PermissionRepository extends JpaRepository<PermissionEntity, UUID> {

    Optional<PermissionEntity> findByPermissionCode(String permissionCode);

    Set<PermissionEntity> findByPermissionCodeIn(Collection<String> permissionCode);
}
