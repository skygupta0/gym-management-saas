package com.gymsaas.module.member.controller;

import com.gymsaas.common.response.ApiResponse;
import com.gymsaas.common.response.PagedResponse;
import com.gymsaas.module.member.dto.MemberCreateRequest;
import com.gymsaas.module.member.dto.MemberResponse;
import com.gymsaas.module.member.dto.MemberUpdateRequest;
import com.gymsaas.module.member.entity.MemberStatus;
import com.gymsaas.module.member.service.MemberService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/members")
@RequiredArgsConstructor
@Tag(name = "Member Management", description = "Endpoints for athlete enrollment, member profiles, and search")
public class MemberController {

    private final MemberService memberService;

    @GetMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'GYM_ADMIN', 'STAFF', 'TRAINER')")
    @Operation(summary = "List gym members", description = "Returns a paginated list of members for the current gym")
    public ResponseEntity<ApiResponse<PagedResponse<MemberResponse>>> listMembers(
            @RequestParam(required = false) MemberStatus status,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        var page = memberService.listMembers(tenantId, status, pageable);
        return ResponseEntity.ok(ApiResponse.ok(PagedResponse.from(page)));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'GYM_ADMIN', 'STAFF', 'TRAINER')")
    @Operation(summary = "Search gym members", description = "Instant search by name, member code, or phone")
    public ResponseEntity<ApiResponse<List<MemberResponse>>> searchMembers(
            @RequestParam("q") String query
    ) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        List<MemberResponse> results = memberService.searchMembers(tenantId, query);
        return ResponseEntity.ok(ApiResponse.ok(results));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'GYM_ADMIN', 'STAFF', 'TRAINER')")
    @Operation(summary = "Get member profile", description = "Returns full profile details of a member")
    public ResponseEntity<ApiResponse<MemberResponse>> getMemberById(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        MemberResponse member = memberService.getMemberById(tenantId, id);
        return ResponseEntity.ok(ApiResponse.ok(member));
    }

    @GetMapping("/code/{memberCode}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'GYM_ADMIN', 'STAFF', 'TRAINER')")
    @Operation(summary = "Get member by code", description = "Finds member by unique gym code like MEM-1001")
    public ResponseEntity<ApiResponse<MemberResponse>> getMemberByCode(@PathVariable String memberCode) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        MemberResponse member = memberService.getMemberByCode(tenantId, memberCode);
        return ResponseEntity.ok(ApiResponse.ok(member));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'GYM_ADMIN', 'STAFF')")
    @Operation(summary = "Enroll new member", description = "Creates a new gym member record and generates a unique member code")
    public ResponseEntity<ApiResponse<MemberResponse>> createMember(
            @Valid @RequestBody MemberCreateRequest request
    ) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        MemberResponse member = memberService.createMember(tenantId, request);
        return new ResponseEntity<>(ApiResponse.ok(member, "Member enrolled successfully"), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'GYM_ADMIN', 'STAFF')")
    @Operation(summary = "Update member profile", description = "Updates member demographic and contact details")
    public ResponseEntity<ApiResponse<MemberResponse>> updateMember(
            @PathVariable UUID id,
            @Valid @RequestBody MemberUpdateRequest request
    ) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        MemberResponse member = memberService.updateMember(tenantId, id, request);
        return ResponseEntity.ok(ApiResponse.ok(member, "Member profile updated"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'GYM_ADMIN')")
    @Operation(summary = "Deactivate member", description = "Deactivates a gym member account")
    public ResponseEntity<ApiResponse<Void>> deleteMember(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        memberService.deleteMember(tenantId, id);
        return ResponseEntity.ok(ApiResponse.message("Member deactivated successfully"));
    }
}
