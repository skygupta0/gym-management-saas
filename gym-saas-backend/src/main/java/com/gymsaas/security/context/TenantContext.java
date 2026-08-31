package com.gymsaas.security.context;

import com.gymsaas.common.exception.TenantAccessDeniedException;
import lombok.extern.slf4j.Slf4j;

import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.Callable;

@Slf4j
public final class TenantContext {

    private static final ThreadLocal<UUID> CURRENT_TENANT = new ThreadLocal<>();

    private TenantContext() {}

    public static void setTenantId(UUID tenantId) {
        log.trace("Setting TenantContext to {}", tenantId);
        CURRENT_TENANT.set(tenantId);
    }

    public static Optional<UUID> getTenantId() {
        return Optional.ofNullable(CURRENT_TENANT.get());
    }

    public static UUID getCurrentTenantId() {
        UUID tenantId = CURRENT_TENANT.get();
        if (tenantId == null) {
            log.warn("Attempted to access tenant data without active tenant context on thread {}", Thread.currentThread().getName());
            throw new TenantAccessDeniedException("No active gym tenant context found for the current request.");
        }
        return tenantId;
    }

    public static boolean hasTenant() {
        return CURRENT_TENANT.get() != null;
    }

    public static void clear() {
        log.trace("Clearing TenantContext from thread {}", Thread.currentThread().getName());
        CURRENT_TENANT.remove();
    }

    public static <T> T callAs(UUID tenantId, Callable<T> task) throws Exception {
        UUID previous = CURRENT_TENANT.get();
        try {
            setTenantId(tenantId);
            return task.call();
        } finally {
            if (previous != null) {
                setTenantId(previous);
            } else {
                clear();
            }
        }
    }

    public static void runAs(UUID tenantId, Runnable task) {
        UUID previous = CURRENT_TENANT.get();
        try {
            setTenantId(tenantId);
            task.run();
        } finally {
            if (previous != null) {
                setTenantId(previous);
            } else {
                clear();
            }
        }
    }
}
