package com.gymsaas.module.membership.service;

import com.gymsaas.common.exception.DuplicateResourceException;
import com.gymsaas.common.exception.ResourceNotFoundException;
import com.gymsaas.module.audit.service.AuditService;
import com.gymsaas.module.member.entity.Member;
import com.gymsaas.module.member.entity.MemberStatus;
import com.gymsaas.module.member.repository.MemberRepository;
import com.gymsaas.module.membership.dto.MembershipPlanCreateRequest;
import com.gymsaas.module.membership.dto.MembershipPlanResponse;
import com.gymsaas.module.membership.dto.MembershipPurchaseRequest;
import com.gymsaas.module.membership.dto.MembershipResponse;
import com.gymsaas.module.membership.entity.Membership;
import com.gymsaas.module.membership.entity.MembershipPlan;
import com.gymsaas.module.membership.entity.MembershipStatus;
import com.gymsaas.module.membership.repository.MembershipPlanRepository;
import com.gymsaas.module.membership.repository.MembershipRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MembershipService {

    private final MembershipPlanRepository planRepository;
    private final MembershipRepository membershipRepository;
    private final MemberRepository memberRepository;
    private final AuditService auditService;

    // Plans
    @Transactional(readOnly = true)
    public List<MembershipPlanResponse> listPlans(UUID tenantId, boolean activeOnly) {
        List<MembershipPlan> plans = activeOnly
                ? planRepository.findByTenantIdAndIsActiveTrueOrderBySortOrderAsc(tenantId)
                : planRepository.findByTenantIdOrderBySortOrderAsc(tenantId);
        return plans.stream().map(MembershipPlanResponse::from).collect(Collectors.toList());
    }

    @Transactional
    public MembershipPlanResponse createPlan(UUID tenantId, MembershipPlanCreateRequest request) {
        if (planRepository.existsByTenantIdAndName(tenantId, request.getName())) {
            throw new DuplicateResourceException("Membership plan with name '" + request.getName() + "' already exists.");
        }

        MembershipPlan plan = MembershipPlan.builder()
                .name(request.getName())
                .description(request.getDescription())
                .durationDays(request.getDurationDays())
                .price(request.getPrice())
                .registrationFee(request.getRegistrationFee() != null ? request.getRegistrationFee() : BigDecimal.ZERO)
                .taxPercentage(request.getTaxPercentage() != null ? request.getTaxPercentage() : BigDecimal.ZERO)
                .maxFreezeDays(request.getMaxFreezeDays() != null ? request.getMaxFreezeDays() : 0)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .build();

        plan.setTenantId(tenantId);
        MembershipPlan saved = planRepository.save(plan);

        auditService.log(tenantId, null, "PLAN_CREATED", "MembershipPlan", saved.getId(), "Created plan " + saved.getName());
        return MembershipPlanResponse.from(saved);
    }

    // Memberships
    @Transactional(readOnly = true)
    public List<MembershipResponse> getMemberMemberships(UUID tenantId, UUID memberId) {
        return membershipRepository.findByTenantIdAndMemberIdOrderByStartDateDesc(tenantId, memberId)
                .stream()
                .map(MembershipResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public MembershipResponse purchaseMembership(UUID tenantId, MembershipPurchaseRequest request) {
        Member member = memberRepository.findByIdAndTenantId(request.getMemberId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Member", request.getMemberId()));

        MembershipPlan plan = planRepository.findByIdAndTenantId(request.getPlanId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("MembershipPlan", request.getPlanId()));

        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : LocalDate.now();
        LocalDate endDate = startDate.plusDays(plan.getDurationDays());

        BigDecimal price = plan.getPrice();
        BigDecimal discount = request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal taxPercent = plan.getTaxPercentage() != null ? plan.getTaxPercentage() : BigDecimal.ZERO;
        BigDecimal netBeforeTax = price.subtract(discount).max(BigDecimal.ZERO);
        BigDecimal taxAmount = netBeforeTax.multiply(taxPercent).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal totalAmount = netBeforeTax.add(taxAmount);

        Membership membership = Membership.builder()
                .memberId(member.getId())
                .planId(plan.getId())
                .planName(plan.getName())
                .planDurationDays(plan.getDurationDays())
                .startDate(startDate)
                .endDate(endDate)
                .originalEndDate(endDate)
                .price(price)
                .discountAmount(discount)
                .taxAmount(taxAmount)
                .totalAmount(totalAmount)
                .paidAmount(totalAmount)
                .status(MembershipStatus.ACTIVE)
                .totalFrozenDays(0)
                .notes(request.getNotes())
                .build();

        membership.setTenantId(tenantId);
        Membership saved = membershipRepository.save(membership);

        // Ensure member status is active
        member.setStatus(MemberStatus.ACTIVE);
        memberRepository.save(member);

        auditService.log(tenantId, null, "MEMBERSHIP_PURCHASED", "Membership", saved.getId(),
                "Member " + member.getFullName() + " purchased " + plan.getName() + " for ₹" + totalAmount);

        log.info("Enrolled member {} into plan {} ending {}", member.getFullName(), plan.getName(), endDate);
        return MembershipResponse.from(saved);
    }
}
