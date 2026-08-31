package com.gymsaas.module.payment.controller;

import com.gymsaas.common.response.ApiResponse;
import com.gymsaas.common.response.PagedResponse;
import com.gymsaas.module.payment.dto.PaymentCollectRequest;
import com.gymsaas.module.payment.dto.PaymentResponse;
import com.gymsaas.module.payment.service.PaymentService;
import com.gymsaas.security.context.TenantContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payments & Invoicing", description = "Endpoints for collecting member payments, receipts, and invoice records")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/collect")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'GYM_ADMIN', 'STAFF')")
    @Operation(summary = "Collect payment", description = "Records a payment transaction via UPI, Cash, Card, or Net Banking and creates an invoice")
    public ResponseEntity<ApiResponse<PaymentResponse>> collectPayment(
            @Valid @RequestBody PaymentCollectRequest request
    ) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        PaymentResponse payment = paymentService.collectPayment(tenantId, null, request);
        return new ResponseEntity<>(ApiResponse.ok(payment, "Payment collected: Invoice " + payment.getInvoiceNumber()), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'GYM_ADMIN')")
    @Operation(summary = "List payments", description = "Returns paginated list of all gym payment transactions")
    public ResponseEntity<ApiResponse<PagedResponse<PaymentResponse>>> listPayments(
            @PageableDefault(size = 20) Pageable pageable
    ) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        var page = paymentService.listPayments(tenantId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(PagedResponse.from(page)));
    }

    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'GYM_ADMIN', 'STAFF', 'TRAINER')")
    @Operation(summary = "Get member payments", description = "Returns payment receipts history for a member")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getMemberPayments(@PathVariable UUID memberId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        List<PaymentResponse> list = paymentService.getMemberPayments(tenantId, memberId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }
}
