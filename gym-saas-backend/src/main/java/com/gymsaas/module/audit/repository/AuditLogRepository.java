package com.gymsaas.module.audit.repository;

import com.gymsaas.module.audit.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    Page<AuditLog> findAllByTenantId(UUID tenantId, Pageable pageable);

    Page<AuditLog> findAllByTenantIdAndEntityType(UUID tenantId, String entityType, Pageable pageable);
}
