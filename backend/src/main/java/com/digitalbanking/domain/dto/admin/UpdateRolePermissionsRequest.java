package com.digitalbanking.domain.dto.admin;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UpdateRolePermissionsRequest {

    @NotNull(message = "Permissions must not be null")
    private List<String> permissions;
}
