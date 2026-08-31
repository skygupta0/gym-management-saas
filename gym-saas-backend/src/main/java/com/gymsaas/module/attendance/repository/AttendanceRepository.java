package com.gymsaas.module.attendance.repository;

import com.gymsaas.module.attendance.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, UUID> {

    List<Attendance> findByTenantIdAndAttendanceDateOrderByCheckInTimeDesc(UUID tenantId, LocalDate date);

    Optional<Attendance> findByTenantIdAndMemberIdAndAttendanceDate(UUID tenantId, UUID memberId, LocalDate date);

    boolean existsByTenantIdAndMemberIdAndAttendanceDate(UUID tenantId, UUID memberId, LocalDate date);

    long countByTenantIdAndAttendanceDate(UUID tenantId, LocalDate date);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.tenantId = :tenantId AND a.attendanceDate = :date AND a.checkOutTime IS NULL")
    long countCurrentlyCheckedIn(@Param("tenantId") UUID tenantId, @Param("date") LocalDate date);
}
