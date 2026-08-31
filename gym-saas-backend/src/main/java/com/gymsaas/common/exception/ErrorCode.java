package com.gymsaas.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    INVALID_CREDENTIALS("AUTH_001", "Invalid email or password", HttpStatus.UNAUTHORIZED),
    ACCOUNT_INACTIVE("AUTH_002", "Account is inactive or suspended", HttpStatus.FORBIDDEN),
    TOKEN_EXPIRED("AUTH_003", "Token has expired", HttpStatus.UNAUTHORIZED),
    INVALID_TOKEN("AUTH_004", "Token is invalid or revoked", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED("AUTH_005", "Authentication is required", HttpStatus.UNAUTHORIZED),
    ACCESS_DENIED("AUTH_006", "Access denied: insufficient permissions", HttpStatus.FORBIDDEN),
    TENANT_ACCESS_DENIED("AUTH_007", "Access denied: cross-tenant access prohibited", HttpStatus.FORBIDDEN),
    RATE_LIMIT_EXCEEDED("AUTH_008", "Too many requests. Please try again later.", HttpStatus.TOO_MANY_REQUESTS),

    RESOURCE_NOT_FOUND("RES_001", "Requested resource not found", HttpStatus.NOT_FOUND),
    DUPLICATE_RESOURCE("RES_002", "Resource already exists", HttpStatus.CONFLICT),
    VALIDATION_FAILED("REQ_001", "Request validation failed", HttpStatus.BAD_REQUEST),
    BAD_REQUEST("REQ_002", "Bad request payload", HttpStatus.BAD_REQUEST),

    TENANT_NOT_FOUND("TENANT_001", "Gym tenant not found", HttpStatus.NOT_FOUND),
    USER_NOT_FOUND("USER_001", "User not found", HttpStatus.NOT_FOUND),
    MEMBER_NOT_FOUND("MEMBER_001", "Member not found", HttpStatus.NOT_FOUND),
    MEMBERSHIP_NOT_FOUND("MEMBERSHIP_001", "Membership not found", HttpStatus.NOT_FOUND),
    PAYMENT_NOT_FOUND("PAYMENT_001", "Payment record not found", HttpStatus.NOT_FOUND),

    INTERNAL_SERVER_ERROR("SYS_001", "An unexpected internal server error occurred", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String code;
    private final String defaultMessage;
    private final HttpStatus httpStatus;

    ErrorCode(String code, String defaultMessage, HttpStatus httpStatus) {
        this.code = code;
        this.defaultMessage = defaultMessage;
        this.httpStatus = httpStatus;
    }
}
