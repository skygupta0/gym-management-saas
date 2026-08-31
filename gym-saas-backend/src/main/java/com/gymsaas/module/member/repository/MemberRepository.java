package com.gymsaas.module.member.repository;

import com.gymsaas.module.member.entity.Member;
import com.gymsaas.module.member.entity.MemberStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MemberRepository extends JpaRepository<Member, UUID> {

    Page<Member> findByTenantId(UUID tenantId, Pageable pageable);

    Page<Member> findByTenantIdAndStatus(UUID tenantId, MemberStatus status, Pageable pageable);

    Optional<Member> findByIdAndTenantId(UUID id, UUID tenantId);

    Optional<Member> findByTenantIdAndMemberCode(UUID tenantId, String memberCode);

    boolean existsByTenantIdAndMemberCode(UUID tenantId, String memberCode);

    boolean existsByTenantIdAndMobile(UUID tenantId, String mobile);

    long countByTenantId(UUID tenantId);

    long countByTenantIdAndStatus(UUID tenantId, MemberStatus status);

    @Query("SELECT m FROM Member m WHERE m.tenantId = :tenantId AND (" +
           "LOWER(m.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.memberCode) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "m.mobile LIKE CONCAT('%', :query, '%'))")
    List<Member> searchMembers(@Param("tenantId") UUID tenantId, @Param("query") String query);

    @Query("SELECT MAX(CAST(SUBSTRING(m.memberCode, 5) AS int)) FROM Member m WHERE m.tenantId = :tenantId AND m.memberCode LIKE 'MEM-%'")
    Integer findMaxMemberCodeNumber(@Param("tenantId") UUID tenantId);
}
