package com.gymsaas.module.attendance.controller;

import com.gymsaas.common.response.ApiResponse;
import com.gymsaas.module.attendance.dto.AttendanceResponse;
import com.gymsaas.module.attendance.dto.CheckInRequest;
import com.gymsaas.module.attendance.dto.OccupancyResponse;
import com.gymsaas.module.attendance.service.AttendanceService;
import com.gymsaas.security.context.TenantContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
@Tag(name = "Attendance Management", description = "Endpoints for member check-in, check-out, and live floor occupancy")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/check-in")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'GYM_ADMIN', 'STAFF', 'TRAINER')")
    @Operation(summary = "Fast Check-In Member", description = "Registers member arrival via Member Code (barcode/QR) or ID with daily uniqueness constraint")
    public ResponseEntity<ApiResponse<AttendanceResponse>> checkIn(@RequestBody CheckInRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        AttendanceResponse response = attendanceService.checkIn(tenantId, request);
        return new ResponseEntity<>(ApiResponse.ok(response, "Checked in: " + response.getMemberName()), HttpStatus.CREATED);
    }

    @PostMapping("/check-out")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'GYM_ADMIN', 'STAFF', 'TRAINER')")
    @Operation(summary = "Check-Out Member", description = "Records member departure time")
    public ResponseEntity<ApiResponse<AttendanceResponse>> checkOut(@RequestParam UUID memberId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        AttendanceResponse response = attendanceService.checkOut(tenantId, memberId);
        return ResponseEntity.ok(ApiResponse.ok(response, "Checked out successfully"));
    }

    @GetMapping("/today")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'GYM_ADMIN', 'STAFF', 'TRAINER')")
    @Operation(summary = "List today's check-ins", description = "Returns all check-ins for the current date")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getTodayAttendance() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        List<AttendanceResponse> list = attendanceService.getTodayAttendance(tenantId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/occupancy")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'GYM_ADMIN', 'STAFF', 'TRAINER')")
    @Operation(summary = "Get live floor occupancy", description = "Returns active count on floor, total capacity, and percentage")
    public ResponseEntity<ApiResponse<OccupancyResponse>> getLiveOccupancy() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        OccupancyResponse occupancy = attendanceService.getLiveOccupancy(tenantId);
        return ResponseEntity.ok(ApiResponse.ok(occupancy));
    }
}
