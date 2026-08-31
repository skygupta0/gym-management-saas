package com.gymsaas.module.dashboard.service;

import com.gymsaas.module.attendance.dto.OccupancyResponse;
import com.gymsaas.module.attendance.entity.Attendance;
import com.gymsaas.module.attendance.repository.AttendanceRepository;
import com.gymsaas.module.attendance.service.AttendanceService;
import com.gymsaas.module.dashboard.dto.ActivityStreamItem;
import com.gymsaas.module.dashboard.dto.DashboardStatsResponse;
import com.gymsaas.module.member.entity.Member;
import com.gymsaas.module.member.entity.MemberStatus;
import com.gymsaas.module.member.repository.MemberRepository;
import com.gymsaas.module.membership.repository.MembershipRepository;
import com.gymsaas.module.payment.entity.Payment;
import com.gymsaas.module.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final MemberRepository memberRepository;
    private final MembershipRepository membershipRepository;
    private final AttendanceRepository attendanceRepository;
    private final PaymentRepository paymentRepository;
    private final AttendanceService attendanceService;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(UUID tenantId) {
        LocalDate today = LocalDate.now();
        Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);

        long activeMembers = memberRepository.countByTenantIdAndStatus(tenantId, MemberStatus.ACTIVE);
        long todayCheckIns = attendanceRepository.countByTenantIdAndAttendanceDate(tenantId, today);
        BigDecimal monthlyRev = paymentRepository.sumRevenueSince(tenantId, thirtyDaysAgo);
        long expiringSoon = membershipRepository.countExpiringSoonMemberships(tenantId, today, today.plusDays(7));

        OccupancyResponse occ = attendanceService.getLiveOccupancy(tenantId);

        List<ActivityStreamItem> activities = buildRecentActivities(tenantId);

        return DashboardStatsResponse.builder()
                .activeMembers(activeMembers)
                .todayCheckIns(todayCheckIns)
                .monthlyRevenue(monthlyRev != null ? monthlyRev : BigDecimal.ZERO)
                .expiringSoon(expiringSoon)
                .liveFloorCount(occ.getCurrentCount())
                .liveFloorCapacity(occ.getTotalCapacity())
                .liveFloorPercentage(occ.getOccupancyPercentage())
                .recentActivity(activities)
                .build();
    }

    private List<ActivityStreamItem> buildRecentActivities(UUID tenantId) {
        List<ActivityStreamItem> items = new ArrayList<>();
        Instant now = Instant.now();

        // 1. Recent Check-ins
        List<Attendance> recentAttendances = attendanceRepository.findByTenantIdAndAttendanceDateOrderByCheckInTimeDesc(tenantId, LocalDate.now());
        for (Attendance att : recentAttendances.stream().limit(5).toList()) {
            Member member = memberRepository.findByIdAndTenantId(att.getMemberId(), tenantId).orElse(null);
            String name = member != null ? member.getFullName() : "Member";
            items.add(ActivityStreamItem.builder()
                    .id(att.getId().toString())
                    .type("CHECK_IN")
                    .icon("⚡")
                    .title(name)
                    .description("Checked in at Main Gate (" + att.getCheckInSource() + ")")
                    .timestamp(att.getCheckInTime())
                    .timeAgo(formatTimeAgo(att.getCheckInTime(), now))
                    .build());
        }

        // 2. Recent Payments
        var recentPayments = paymentRepository.findByTenantId(tenantId, PageRequest.of(0, 5));
        for (Payment p : recentPayments.getContent()) {
            Member member = memberRepository.findByIdAndTenantId(p.getMemberId(), tenantId).orElse(null);
            String name = member != null ? member.getFullName() : "Member";
            items.add(ActivityStreamItem.builder()
                    .id(p.getId().toString())
                    .type("PAYMENT")
                    .icon("💰")
                    .title(name)
                    .description("Paid ₹" + p.getAmount() + " via " + p.getPaymentMethod() + " (" + p.getInvoiceNumber() + ")")
                    .timestamp(p.getPaymentDate())
                    .timeAgo(formatTimeAgo(p.getPaymentDate(), now))
                    .build());
        }

        items.sort(Comparator.comparing(ActivityStreamItem::getTimestamp, Comparator.nullsLast(Comparator.reverseOrder())));
        return items.stream().limit(8).toList();
    }

    private String formatTimeAgo(Instant past, Instant now) {
        if (past == null) return "just now";
        Duration d = Duration.between(past, now);
        long minutes = d.toMinutes();
        if (minutes < 1) return "just now";
        if (minutes < 60) return minutes + " mins ago";
        long hours = d.toHours();
        if (hours < 24) return hours + " hrs ago";
        long days = d.toDays();
        return days + " days ago";
    }
}
