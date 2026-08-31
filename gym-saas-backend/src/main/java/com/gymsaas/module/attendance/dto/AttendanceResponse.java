package com.gymsaas.module.attendance.dto;

import com.gymsaas.module.attendance.entity.Attendance;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceResponse {

    private UUID id;
    private UUID tenantId;
    private UUID memberId;
    private String memberName;
    private String memberCode;
    private LocalDate attendanceDate;
    private Instant checkInTime;
    private Instant checkOutTime;
    private String checkInSource;

    public static AttendanceResponse from(Attendance att, String memberName, String memberCode) {
        if (att == null) return null;
        return AttendanceResponse.builder()
                .id(att.getId())
                .tenantId(att.getTenantId())
                .memberId(att.getMemberId())
                .memberName(memberName)
                .memberCode(memberCode)
                .attendanceDate(att.getAttendanceDate())
                .checkInTime(att.getCheckInTime())
                .checkOutTime(att.getCheckOutTime())
                .checkInSource(att.getCheckInSource())
                .build();
    }
}
