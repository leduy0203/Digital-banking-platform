package com.digitalbanking.domain.dto.admin;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class RbacRoleResponse {

    private UUID id;

    private String code;

    private String name;

    private String description;

    private long userCount;

    private List<String> permissions;

    @JsonProperty("isSystemRole")
    private boolean isSystemRole;
}
