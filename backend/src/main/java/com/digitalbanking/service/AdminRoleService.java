package com.digitalbanking.service;

import com.digitalbanking.domain.dto.admin.RbacRoleResponse;
import com.digitalbanking.domain.dto.admin.UpdateRolePermissionsRequest;

import java.util.List;
import java.util.UUID;

public interface AdminRoleService {

    List<RbacRoleResponse> getAllRoles();

    RbacRoleResponse updateRolePermissions(UUID roleId, UpdateRolePermissionsRequest request);
}
