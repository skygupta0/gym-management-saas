package com.gymsaas.module.membership.dto;

import com.gymsaas.module.membership.entity.MembershipPlan;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MembershipPlanResponse {

    private UUID id;
    private UUID tenantId;
    private String name;
    private String description;
    private Integer durationDays;
    private BigDecimal price;
    private BigDecimal registrationFee;
    private BigDecimal taxPercentage;
    private Integer maxFreezeDays;
    private Boolean isActive;
    private Integer sortOrder;
    private Instant createdAt;

    public static MembershipPlanResponse from(MembershipPlan plan) {
        if (plan == null) return null;
        return MembershipPlanResponse.builder()
                .id(plan.getId())
                .tenantId(plan.getTenantId())
                .name(plan.getName())
                .description(plan.getDescription())
                .durationDays(plan.getDurationDays())
                .price(plan.getPrice())
                .registrationFee(plan.getRegistrationFee())
                .taxPercentage(plan.getTaxPercentage())
                .maxFreezeDays(plan.getMaxFreezeDays())
                .isActive(plan.getIsActive())
                .sortOrder(plan.getSortOrder())
                .createdAt(plan.getCreatedAt())
                .build();
    }
}
