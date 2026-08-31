package com.gymsaas.common.exception;

public class TenantAccessDeniedException extends GymException {

    public TenantAccessDeniedException(String message) {
        super(ErrorCode.TENANT_ACCESS_DENIED, message);
    }

    public TenantAccessDeniedException() {
        super(ErrorCode.TENANT_ACCESS_DENIED, "Access to data belonging to another gym tenant is strictly denied.");
    }
}
