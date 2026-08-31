package com.gymsaas.module.user.controller;

import com.gymsaas.common.response.ApiResponse;
import com.gymsaas.common.response.PagedResponse;
import com.gymsaas.module.user.dto.UserCreateRequest;
import com.gymsaas.module.user.dto.UserResponse;
import com.gymsaas.module.user.dto.UserUpdateRequest;
import com.gymsaas.module.user.service.UserService;
import com.gymsaas.security.context.TenantContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "Endpoints for managing gym staff, trainers, and admins")
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'GYM_ADMIN')")
    @Operation(summary = "List gym staff and users", description = "Returns a paginated list of users for the authenticated gym")
    public ResponseEntity<ApiResponse<PagedResponse<UserResponse>>> listUsers(
            @PageableDefault(size = 20) Pageable pageable
    ) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        var page = userService.listUsers(tenantId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(PagedResponse.from(page)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'GYM_ADMIN')")
    @Operation(summary = "Get user details", description = "Returns profile of a specific user within the authenticated gym")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UserResponse user = userService.getUserById(tenantId, id);
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    @PostMapping
    @PreAuthorize("hasRole('GYM_OWNER')")
    @Operation(summary = "Create staff/trainer/admin account", description = "Allows gym owner to add a new employee account")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody UserCreateRequest request
    ) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UserResponse user = userService.createUser(tenantId, request);
        return new ResponseEntity<>(ApiResponse.ok(user, "User created successfully"), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('GYM_OWNER')")
    @Operation(summary = "Update user details", description = "Updates profile or role for a gym employee")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UserUpdateRequest request
    ) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UserResponse user = userService.updateUser(tenantId, id, request);
        return ResponseEntity.ok(ApiResponse.ok(user, "User updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('GYM_OWNER')")
    @Operation(summary = "Delete gym staff account", description = "Removes a staff/trainer user account from the gym")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        userService.deleteUser(tenantId, id);
        return ResponseEntity.ok(ApiResponse.message("User deleted successfully"));
    }
}
