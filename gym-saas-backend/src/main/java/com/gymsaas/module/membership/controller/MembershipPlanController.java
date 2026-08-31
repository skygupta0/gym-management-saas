package com.gymsaas.module.membership.controller;

import com.gymsaas.common.response.ApiResponse;
import com.gymsaas.module.membership.dto.MembershipPlanCreateRequest;
import com.gymsaas.module.membership.dto.MembershipPlanResponse;
import com.gymsaas.module.membership.service.MembershipService;
import com.gymsaas.security.context.TenantContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/plans")
@RequiredArgsConstructor
@Tag(name = "Membership Plans", description = "Endpoints for configuring gym membership plans and pricing")
public class MembershipPlanController {

    private final MembershipService membershipService;

    @GetMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'GYM_ADMIN', 'STAFF', 'TRAINER')")
    @Operation(summary = "List membership plans", description = "Returns active pricing plans for the authenticated gym")
    public ResponseEntity<ApiResponse<List<MembershipPlanResponse>>> listPlans(
            @RequestParam(defaultValue = "true") boolean activeOnly
    ) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        List<MembershipPlanResponse> plans = membershipService.listPlans(tenantId, activeOnly);
        return ResponseEntity.ok(ApiResponse.ok(plans));
    }

    @PostMapping
    @PreAuthorize("hasRole('GYM_OWNER')")
    @Operation(summary = "Create membership plan", description = "Configures a new pricing plan with duration, price, and freeze allowances")
    public ResponseEntity<ApiResponse<MembershipPlanResponse>> createPlan(
            @Valid @RequestBody MembershipPlanCreateRequest request
    ) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        MembershipPlanResponse plan = membershipService.createPlan(tenantId, request);
        return new ResponseEntity<>(ApiResponse.ok(plan, "Membership plan created"), HttpStatus.CREATED);
    }
}
