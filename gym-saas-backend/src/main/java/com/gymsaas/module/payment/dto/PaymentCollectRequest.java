package com.gymsaas.module.payment.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCollectRequest {

    @NotNull(message = "Member ID is required")
    private UUID memberId;

    private UUID membershipId;

    @NotNull(message = "Payment amount is required")
    @DecimalMin(value = "1.00", message = "Payment amount must be at least ₹1")
    private BigDecimal amount;

    @NotNull(message = "Payment method is required")
    private String paymentMethod; // CASH, UPI, CREDIT_CARD, DEBIT_CARD, NET_BANKING

    private String transactionId;
    private String notes;
}
