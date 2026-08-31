package com.gymsaas.module.attendance.entity;

import com.gymsaas.common.entity.TenantScopedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "attendance")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Attendance extends TenantScopedEntity {

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(name = "attendance_date", nullable = false)
    @Builder.Default
    private LocalDate attendanceDate = LocalDate.now();

    @Column(name = "check_in_time", nullable = false)
    @Builder.Default
    private Instant checkInTime = Instant.now();

    @Column(name = "check_out_time")
    private Instant checkOutTime;

    @Column(name = "check_in_source", nullable = false, length = 50)
    @Builder.Default
    private String checkInSource = "MANUAL_STAFF";
}
