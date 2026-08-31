package com.gymsaas.module.payment.dto;

import com.gymsaas.module.payment.entity.Payment;
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
public class PaymentResponse {

    private UUID id;
    private UUID tenantId;
    private UUID memberId;
    private String memberName;
    private String memberCode;
    private UUID membershipId;
    private String invoiceNumber;
    private BigDecimal amount;
    private String paymentMethod;
    private String paymentStatus;
    private Instant paymentDate;
    private String transactionId;
    private String notes;

    public static PaymentResponse from(Payment p, String memberName, String memberCode) {
        if (p == null) return null;
        return PaymentResponse.builder()
                .id(p.getId())
                .tenantId(p.getTenantId())
                .memberId(p.getMemberId())
                .memberName(memberName)
                .memberCode(memberCode)
                .membershipId(p.getMembershipId())
                .invoiceNumber(p.getInvoiceNumber())
                .amount(p.getAmount())
                .paymentMethod(p.getPaymentMethod())
                .paymentStatus(p.getPaymentStatus())
                .paymentDate(p.getPaymentDate())
                .transactionId(p.getTransactionId())
                .notes(p.getNotes())
                .build();
    }
}
