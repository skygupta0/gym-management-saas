package com.gymsaas.module.membership.repository;

import com.gymsaas.module.membership.entity.MembershipPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MembershipPlanRepository extends JpaRepository<MembershipPlan, UUID> {

    List<MembershipPlan> findByTenantIdOrderBySortOrderAsc(UUID tenantId);

    List<MembershipPlan> findByTenantIdAndIsActiveTrueOrderBySortOrderAsc(UUID tenantId);

    Optional<MembershipPlan> findByIdAndTenantId(UUID id, UUID tenantId);

    boolean existsByTenantIdAndName(UUID tenantId, String name);
}
