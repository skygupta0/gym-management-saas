package com.gymsaas.module.membership.controller;

import com.gymsaas.common.response.ApiResponse;
import com.gymsaas.module.membership.dto.MembershipPurchaseRequest;
import com.gymsaas.module.membership.dto.MembershipResponse;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/memberships")
@RequiredArgsConstructor
@Tag(name = "Memberships", description = "Endpoints for purchasing, renewing, and tracking athlete memberships")
public class MembershipController {

    private final MembershipService membershipService;

    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'GYM_ADMIN', 'STAFF', 'TRAINER')")
    @Operation(summary = "Get member's memberships", description = "Returns all membership subscriptions history for a member")
    public ResponseEntity<ApiResponse<List<MembershipResponse>>> getMemberMemberships(@PathVariable UUID memberId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        List<MembershipResponse> list = membershipService.getMemberMemberships(tenantId, memberId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/purchase")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'GYM_ADMIN', 'STAFF')")
    @Operation(summary = "Enroll member into a plan", description = "Purchases an active membership subscription for a member")
    public ResponseEntity<ApiResponse<MembershipResponse>> purchaseMembership(
            @Valid @RequestBody MembershipPurchaseRequest request
    ) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        MembershipResponse response = membershipService.purchaseMembership(tenantId, request);
        return new ResponseEntity<>(ApiResponse.ok(response, "Membership activated successfully"), HttpStatus.CREATED);
    }
}
