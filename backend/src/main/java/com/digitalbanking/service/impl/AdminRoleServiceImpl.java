package com.digitalbanking.service.impl;

import com.digitalbanking.domain.dto.admin.RbacRoleResponse;
import com.digitalbanking.domain.dto.admin.UpdateRolePermissionsRequest;
import com.digitalbanking.domain.entity.PermissionEntity;
import com.digitalbanking.domain.entity.RoleEntity;
import com.digitalbanking.exception.BusinessException;
import com.digitalbanking.exception.ErrorCode;
import com.digitalbanking.repository.PermissionRepository;
import com.digitalbanking.repository.RoleRepository;
import com.digitalbanking.service.AdminRoleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "ADMIN-ROLE-SERVICE")
public class AdminRoleServiceImpl implements AdminRoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    @Override
    public List<RbacRoleResponse> getAllRoles() {
        log.info("Fetching all system roles with permissions");

        return roleRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RbacRoleResponse updateRolePermissions(UUID roleId, UpdateRolePermissionsRequest request) {
        log.info("Updating permissions for roleId={}", roleId);

        RoleEntity role = roleRepository.findById(roleId)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.ROLE_NOT_FOUND_BY_ID, "Role not found with id: " + roleId
                ));

        Set<PermissionEntity> permissions = getValidatedPermissions(request.getPermissions());
        role.setPermissions(permissions);

        RoleEntity savedRole = roleRepository.save(role);

        log.info(
                "Role permissions updated successfully: roleCode={}, permissionCount={}",
                savedRole.getRoleCode(),
                permissions.size()
        );

        return mapToResponse(savedRole);
    }

    private Set<PermissionEntity> getValidatedPermissions(
            List<String> requestedPermissionCodes
    ) {
        if (requestedPermissionCodes == null
                || requestedPermissionCodes.isEmpty()) {
            return new HashSet<>();
        }

        Set<String> requestedCodes = new HashSet<>(requestedPermissionCodes);

        Set<PermissionEntity> permissions = permissionRepository.findByPermissionCodeIn(requestedCodes);

        Set<String> foundCodes = permissions.stream()
                .map(PermissionEntity::getPermissionCode)
                .collect(Collectors.toSet());

        Set<String> invalidCodes = new HashSet<>(requestedCodes);
        invalidCodes.removeAll(foundCodes);

        if (!invalidCodes.isEmpty()) {
            throw new BusinessException(
                    ErrorCode.VALIDATION_ERROR,
                    "Invalid permission codes: " + invalidCodes
            );
        }

        return permissions;
    }

    private RbacRoleResponse mapToResponse(RoleEntity role) {
        long userCount = roleRepository.countUsersByRoleId(role.getId());
        List<String> permissionCodes = role.getPermissions().stream()
                .map(PermissionEntity::getPermissionCode)
                .sorted()
                .collect(Collectors.toList());

        return RbacRoleResponse.builder()
                .id(role.getId())
                .code(role.getRoleCode() != null ? role.getRoleCode().name() : "")
                .name(role.getRoleName())
                .description(role.getRoleName())
                .userCount(userCount)
                .permissions(permissionCodes)
                .isSystemRole(true)
                .build();
    }
}
