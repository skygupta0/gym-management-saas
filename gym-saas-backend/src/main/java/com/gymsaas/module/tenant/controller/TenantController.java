package com.gymsaas.module.tenant.controller;

import com.gymsaas.common.response.ApiResponse;
import com.gymsaas.module.auth.dto.AuthResponse;
import com.gymsaas.module.tenant.dto.TenantOnboardRequest;
import com.gymsaas.module.tenant.dto.TenantResponse;
import com.gymsaas.module.tenant.dto.TenantUpdateRequest;
import com.gymsaas.module.tenant.service.TenantService;
import com.gymsaas.security.context.TenantContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/gyms")
@RequiredArgsConstructor
@Tag(name = "Gym Management", description = "Endpoints for gym onboarding, profile management, and settings")
public class TenantController {

    private final TenantService tenantService;

    @PostMapping("/onboard")
    @Operation(summary = "Onboard a new gym", description = "Public endpoint: registers gym tenant and creates primary GYM_OWNER account")
    public ResponseEntity<ApiResponse<AuthResponse>> onboardGym(
            @Valid @RequestBody TenantOnboardRequest request,
            HttpServletRequest servletRequest
    ) {
        String ipAddress = servletRequest.getRemoteAddr();
        String userAgent = servletRequest.getHeader("User-Agent");
        AuthResponse response = tenantService.onboardGym(request, ipAddress, userAgent);
        return new ResponseEntity<>(ApiResponse.ok(response, "Gym registered successfully"), HttpStatus.CREATED);
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'GYM_ADMIN', 'STAFF')")
    @Operation(summary = "Get current gym details", description = "Returns profile and configuration for the authenticated tenant")
    public ResponseEntity<ApiResponse<TenantResponse>> getCurrentGym() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        TenantResponse response = tenantService.getTenantById(tenantId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('GYM_OWNER')")
    @Operation(summary = "Update gym settings", description = "Updates profile and contact information for the authenticated gym")
    public ResponseEntity<ApiResponse<TenantResponse>> updateCurrentGym(
            @Valid @RequestBody TenantUpdateRequest request
    ) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        TenantResponse response = tenantService.updateTenant(tenantId, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Gym settings updated successfully"));
    }
}
