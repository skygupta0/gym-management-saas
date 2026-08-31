package com.gymsaas.module.payment.service;

import com.gymsaas.common.exception.ResourceNotFoundException;
import com.gymsaas.module.audit.service.AuditService;
import com.gymsaas.module.member.entity.Member;
import com.gymsaas.module.member.repository.MemberRepository;
import com.gymsaas.module.membership.entity.Membership;
import com.gymsaas.module.membership.repository.MembershipRepository;
import com.gymsaas.module.payment.dto.PaymentCollectRequest;
import com.gymsaas.module.payment.dto.PaymentResponse;
import com.gymsaas.module.payment.entity.Payment;
import com.gymsaas.module.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final MemberRepository memberRepository;
    private final MembershipRepository membershipRepository;
    private final AuditService auditService;

    @Transactional
    public PaymentResponse collectPayment(UUID tenantId, UUID createdByUserId, PaymentCollectRequest request) {
        Member member = memberRepository.findByIdAndTenantId(request.getMemberId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Member", request.getMemberId()));

        String invoiceNumber = generateInvoiceNumber(tenantId);

        Payment payment = Payment.builder()
                .memberId(member.getId())
                .membershipId(request.getMembershipId())
                .invoiceNumber(invoiceNumber)
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH")
                .paymentStatus("COMPLETED")
                .paymentDate(Instant.now())
                .transactionId(request.getTransactionId())
                .notes(request.getNotes())
                .createdBy(createdByUserId)
                .build();

        payment.setTenantId(tenantId);
        Payment saved = paymentRepository.save(payment);

        // If linked to membership, update paid amount
        if (request.getMembershipId() != null) {
            membershipRepository.findByIdAndTenantId(request.getMembershipId(), tenantId).ifPresent(m -> {
                m.setPaidAmount(m.getPaidAmount().add(request.getAmount()));
                membershipRepository.save(m);
            });
        }

        auditService.log(tenantId, createdByUserId, "PAYMENT_COLLECTED", "Payment", saved.getId(),
                "Collected ₹" + request.getAmount() + " (" + payment.getPaymentMethod() + ") from " + member.getFullName() + " [Invoice: " + invoiceNumber + "]");

        log.info("Collected payment {} from member {} for tenant {}", invoiceNumber, member.getFullName(), tenantId);
        return PaymentResponse.from(saved, member.getFullName(), member.getMemberCode());
    }

    @Transactional(readOnly = true)
    public Page<PaymentResponse> listPayments(UUID tenantId, Pageable pageable) {
        Page<Payment> page = paymentRepository.findByTenantId(tenantId, pageable);
        return page.map(p -> {
            Member m = memberRepository.findByIdAndTenantId(p.getMemberId(), tenantId).orElse(null);
            String name = m != null ? m.getFullName() : "Unknown";
            String code = m != null ? m.getMemberCode() : "";
            return PaymentResponse.from(p, name, code);
        });
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getMemberPayments(UUID tenantId, UUID memberId) {
        Member m = memberRepository.findByIdAndTenantId(memberId, tenantId).orElse(null);
        String name = m != null ? m.getFullName() : "Unknown";
        String code = m != null ? m.getMemberCode() : "";

        return paymentRepository.findByTenantIdAndMemberIdOrderByPaymentDateDesc(tenantId, memberId)
                .stream()
                .map(p -> PaymentResponse.from(p, name, code))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BigDecimal getMonthlyRevenue(UUID tenantId) {
        Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);
        return paymentRepository.sumRevenueSince(tenantId, thirtyDaysAgo);
    }

    private synchronized String generateInvoiceNumber(UUID tenantId) {
        Integer maxNum = paymentRepository.findMaxInvoiceNumber(tenantId);
        int next = (maxNum != null ? maxNum : 1000) + 1;
        return "INV-" + next;
    }
}
