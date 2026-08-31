package com.gymsaas.module.membership.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MembershipPurchaseRequest {

    @NotNull(message = "Member ID is required")
    private UUID memberId;

    @NotNull(message = "Plan ID is required")
    private UUID planId;

    private LocalDate startDate;
    private BigDecimal discountAmount;
    private String paymentMethod; // CASH, UPI, CREDIT_CARD, DEBIT_CARD, NET_BANKING
    private String transactionId;
    private String notes;
}
