package com.gymsaas.module.membership.repository;

import com.gymsaas.module.membership.entity.Membership;
import com.gymsaas.module.membership.entity.MembershipStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, UUID> {

    Page<Membership> findByTenantId(UUID tenantId, Pageable pageable);

    List<Membership> findByTenantIdAndMemberIdOrderByStartDateDesc(UUID tenantId, UUID memberId);

    Optional<Membership> findFirstByTenantIdAndMemberIdAndStatus(UUID tenantId, UUID memberId, MembershipStatus status);

    Optional<Membership> findByIdAndTenantId(UUID id, UUID tenantId);

    long countByTenantIdAndStatus(UUID tenantId, MembershipStatus status);

    @Query("SELECT COUNT(m) FROM Membership m WHERE m.tenantId = :tenantId AND m.status = 'ACTIVE' AND m.endDate BETWEEN :today AND :expiryThreshold")
    long countExpiringSoonMemberships(@Param("tenantId") UUID tenantId, @Param("today") LocalDate today, @Param("expiryThreshold") LocalDate expiryThreshold);

    @Query("SELECT m FROM Membership m WHERE m.tenantId = :tenantId AND m.status = 'ACTIVE' AND m.endDate < :today")
    List<Membership> findExpiredActiveMemberships(@Param("tenantId") UUID tenantId, @Param("today") LocalDate today);
}
