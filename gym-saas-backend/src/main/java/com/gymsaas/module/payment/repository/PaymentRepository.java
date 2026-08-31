package com.gymsaas.module.payment.repository;

import com.gymsaas.module.payment.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Page<Payment> findByTenantId(UUID tenantId, Pageable pageable);

    List<Payment> findByTenantIdAndMemberIdOrderByPaymentDateDesc(UUID tenantId, UUID memberId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.tenantId = :tenantId AND p.paymentStatus = 'COMPLETED' AND p.paymentDate >= :since")
    BigDecimal sumRevenueSince(@Param("tenantId") UUID tenantId, @Param("since") Instant since);

    @Query("SELECT MAX(CAST(SUBSTRING(p.invoiceNumber, 5) AS int)) FROM Payment p WHERE p.tenantId = :tenantId AND p.invoiceNumber LIKE 'INV-%'")
    Integer findMaxInvoiceNumber(@Param("tenantId") UUID tenantId);
}
