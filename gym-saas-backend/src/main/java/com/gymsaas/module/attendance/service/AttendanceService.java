package com.gymsaas.module.attendance.service;

import com.gymsaas.common.exception.DuplicateResourceException;
import com.gymsaas.common.exception.ResourceNotFoundException;
import com.gymsaas.module.attendance.dto.AttendanceResponse;
import com.gymsaas.module.attendance.dto.CheckInRequest;
import com.gymsaas.module.attendance.dto.OccupancyResponse;
import com.gymsaas.module.attendance.entity.Attendance;
import com.gymsaas.module.attendance.repository.AttendanceRepository;
import com.gymsaas.module.audit.service.AuditService;
import com.gymsaas.module.member.entity.Member;
import com.gymsaas.module.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final MemberRepository memberRepository;
    private final AuditService auditService;

    @Transactional
    public AttendanceResponse checkIn(UUID tenantId, CheckInRequest request) {
        Member member;
        if (request.getMemberId() != null) {
            member = memberRepository.findByIdAndTenantId(request.getMemberId(), tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Member", request.getMemberId()));
        } else if (request.getMemberCode() != null && !request.getMemberCode().isBlank()) {
            member = memberRepository.findByTenantIdAndMemberCode(tenantId, request.getMemberCode().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Member with code: " + request.getMemberCode()));
        } else {
            throw new IllegalArgumentException("Must provide memberId or memberCode for check-in");
        }

        LocalDate today = LocalDate.now();

        // Check unique daily checkin
        if (attendanceRepository.existsByTenantIdAndMemberIdAndAttendanceDate(tenantId, member.getId(), today)) {
            throw new DuplicateResourceException(member.getFullName() + " (" + member.getMemberCode() + ") has already checked in today.");
        }

        Attendance attendance = Attendance.builder()
                .memberId(member.getId())
                .attendanceDate(today)
                .checkInTime(Instant.now())
                .checkInSource(request.getSource() != null ? request.getSource() : "MANUAL_STAFF")
                .build();

        attendance.setTenantId(tenantId);
        Attendance saved = attendanceRepository.save(attendance);

        auditService.log(tenantId, null, "MEMBER_CHECKIN", "Attendance", saved.getId(),
                "Member " + member.getFullName() + " (" + member.getMemberCode() + ") checked in via " + attendance.getCheckInSource());

        log.info("Member {} ({}) checked in for tenant {}", member.getFullName(), member.getMemberCode(), tenantId);
        return AttendanceResponse.from(saved, member.getFullName(), member.getMemberCode());
    }

    @Transactional
    public AttendanceResponse checkOut(UUID tenantId, UUID memberId) {
        LocalDate today = LocalDate.now();
        Attendance attendance = attendanceRepository.findByTenantIdAndMemberIdAndAttendanceDate(tenantId, memberId, today)
                .orElseThrow(() -> new ResourceNotFoundException("No active check-in record found for today"));

        attendance.setCheckOutTime(Instant.now());
        Attendance saved = attendanceRepository.save(attendance);

        Member member = memberRepository.findByIdAndTenantId(memberId, tenantId).orElse(null);
        String name = member != null ? member.getFullName() : "Member";
        String code = member != null ? member.getMemberCode() : "";

        return AttendanceResponse.from(saved, name, code);
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getTodayAttendance(UUID tenantId) {
        LocalDate today = LocalDate.now();
        List<Attendance> list = attendanceRepository.findByTenantIdAndAttendanceDateOrderByCheckInTimeDesc(tenantId, today);

        return list.stream().map(att -> {
            Member member = memberRepository.findByIdAndTenantId(att.getMemberId(), tenantId).orElse(null);
            String name = member != null ? member.getFullName() : "Unknown";
            String code = member != null ? member.getMemberCode() : "";
            return AttendanceResponse.from(att, name, code);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OccupancyResponse getLiveOccupancy(UUID tenantId) {
        LocalDate today = LocalDate.now();
        long currentOnFloor = attendanceRepository.countCurrentlyCheckedIn(tenantId, today);
        long todayTotal = attendanceRepository.countByTenantIdAndAttendanceDate(tenantId, today);
        long capacity = 75; // standard gym floor capacity

        int percentage = capacity > 0 ? (int) Math.min(100, (currentOnFloor * 100) / capacity) : 0;

        return OccupancyResponse.builder()
                .currentCount(currentOnFloor)
                .totalCapacity(capacity)
                .occupancyPercentage(percentage)
                .todayTotalCheckIns(todayTotal)
                .build();
    }
}
