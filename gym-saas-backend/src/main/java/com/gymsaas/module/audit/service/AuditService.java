package com.gymsaas.module.audit.service;

import com.gymsaas.module.audit.entity.AuditLog;
import com.gymsaas.module.audit.repository.AuditLogRepository;
import com.gymsaas.module.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void log(UUID tenantId, User actor, String action, String entityType, String entityId,
                    Map<String, Object> oldValues, Map<String, Object> newValues, String ipAddress, String userAgent) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .tenantId(tenantId)
                    .userId(actor != null ? actor.getId() : null)
                    .userEmail(actor != null ? actor.getEmail() : "SYSTEM")
                    .userRole(actor != null ? actor.getRole().name() : "SYSTEM")
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .oldValues(oldValues)
                    .newValues(newValues)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .build();

            auditLogRepository.save(auditLog);
            log.debug("Recorded audit log: action={}, entityType={}, entityId={}", action, entityType, entityId);
        } catch (Exception e) {
            log.error("Failed to write audit log: {}", e.getMessage(), e);
        }
    }
}
