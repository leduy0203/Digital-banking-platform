package com.digitalbanking.controller.admin;

import com.digitalbanking.domain.dto.admin.RbacRoleResponse;
import com.digitalbanking.domain.dto.admin.UpdateRolePermissionsRequest;
import com.digitalbanking.domain.dto.response.ApiResponse;
import com.digitalbanking.service.AdminRoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/roles")
@RequiredArgsConstructor
@Slf4j(topic = "ADMIN-ROLE-CONTROLLER")
public class AdminRoleController {

    private final AdminRoleService adminRoleService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<RbacRoleResponse>> getAllRoles() {
        log.info("getAllRoles");

        List<RbacRoleResponse> roles = adminRoleService.getAllRoles();

        return ApiResponse.ok("Roles retrieved successfully", roles);
    }

    @PutMapping("/{id}/permissions")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<RbacRoleResponse> updatePermissions(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateRolePermissionsRequest request) {

        log.info("updateRolePermissions: roleId={}", id);

        RbacRoleResponse updatedRole = adminRoleService.updateRolePermissions(id, request);

        return ApiResponse.ok("Role permissions updated successfully", updatedRole);
    }
}
