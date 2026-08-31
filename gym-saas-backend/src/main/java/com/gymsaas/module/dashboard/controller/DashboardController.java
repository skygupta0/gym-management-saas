package com.gymsaas.module.dashboard.controller;

import com.gymsaas.common.response.ApiResponse;
import com.gymsaas.module.dashboard.dto.DashboardStatsResponse;
import com.gymsaas.module.dashboard.service.DashboardService;
import com.gymsaas.security.context.TenantContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard & Intelligence", description = "Endpoints for real-time KPI metrics, floor occupancy, and activity stream")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'GYM_ADMIN', 'STAFF', 'TRAINER')")
    @Operation(summary = "Get gym dashboard metrics", description = "Returns active members, daily check-ins, monthly revenue, expiring count, live floor occupancy, and activity stream")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getStats() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        DashboardStatsResponse stats = dashboardService.getDashboardStats(tenantId);
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }
}
