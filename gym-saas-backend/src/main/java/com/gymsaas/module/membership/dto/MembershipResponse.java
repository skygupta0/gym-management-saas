package com.gymsaas.module.membership.dto;

import com.gymsaas.module.membership.entity.Membership;
import com.gymsaas.module.membership.entity.MembershipStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MembershipResponse {

    private UUID id;
    private UUID tenantId;
    private UUID memberId;
    private UUID planId;
    private String planName;
    private Integer planDurationDays;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate originalEndDate;
    private BigDecimal price;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private MembershipStatus status;
    private Integer totalFrozenDays;
    private String notes;
    private Instant createdAt;

    public static MembershipResponse from(Membership membership) {
        if (membership == null) return null;
        return MembershipResponse.builder()
                .id(membership.getId())
                .tenantId(membership.getTenantId())
                .memberId(membership.getMemberId())
                .planId(membership.getPlanId())
                .planName(membership.getPlanName())
                .planDurationDays(membership.getPlanDurationDays())
                .startDate(membership.getStartDate())
                .endDate(membership.getEndDate())
                .originalEndDate(membership.getOriginalEndDate())
                .price(membership.getPrice())
                .discountAmount(membership.getDiscountAmount())
                .taxAmount(membership.getTaxAmount())
                .totalAmount(membership.getTotalAmount())
                .paidAmount(membership.getPaidAmount())
                .status(membership.getStatus())
                .totalFrozenDays(membership.getTotalFrozenDays())
                .notes(membership.getNotes())
                .createdAt(membership.getCreatedAt())
                .build();
    }
}
