package com.gymsaas.common.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ErrorDetails {
        private String code;
        private String message;
        private List<String> details;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ErrorEnvelope {
        @Builder.Default
        private boolean success = false;
        private ErrorDetails error;
        @Builder.Default
        private Instant timestamp = Instant.now();
    }

    @ExceptionHandler(GymException.class)
    public ResponseEntity<ErrorEnvelope> handleGymException(GymException ex) {
        log.warn("Gym application exception: [{}] {}", ex.getErrorCode().getCode(), ex.getMessage());
        return buildResponse(ex.getErrorCode().getHttpStatus(), ex.getErrorCode().getCode(), ex.getMessage(), ex.getDetails());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorEnvelope> handleValidationException(MethodArgumentNotValidException ex) {
        List<String> validationErrors = new ArrayList<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            validationErrors.add(String.format("%s: %s", fieldError.getField(), fieldError.getDefaultMessage()));
        }
        log.warn("Validation failed: {}", validationErrors);
        return buildResponse(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_FAILED.getCode(), "Request validation failed", validationErrors);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorEnvelope> handleBadCredentials(BadCredentialsException ex) {
        log.warn("Authentication failed: bad credentials");
        return buildResponse(HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_CREDENTIALS.getCode(), ErrorCode.INVALID_CREDENTIALS.getDefaultMessage(), List.of());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorEnvelope> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        return buildResponse(HttpStatus.FORBIDDEN, ErrorCode.ACCESS_DENIED.getCode(), ErrorCode.ACCESS_DENIED.getDefaultMessage(), List.of(ex.getMessage()));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorEnvelope> handleAuthenticationException(AuthenticationException ex) {
        log.warn("Authentication error: {}", ex.getMessage());
        return buildResponse(HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED.getCode(), ex.getMessage(), List.of());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorEnvelope> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        log.error("Database integrity violation", ex);
        return buildResponse(HttpStatus.CONFLICT, ErrorCode.DUPLICATE_RESOURCE.getCode(), "Database constraint violation or duplicate entry", List.of());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorEnvelope> handleGeneralException(Exception ex) {
        log.error("Unhandled server exception", ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_SERVER_ERROR.getCode(), "An internal server error occurred", List.of(ex.getMessage() != null ? ex.getMessage() : "Unknown error"));
    }

    private ResponseEntity<ErrorEnvelope> buildResponse(HttpStatus status, String code, String message, List<String> details) {
        ErrorDetails errorDetails = ErrorDetails.builder()
                .code(code)
                .message(message)
                .details(details != null && !details.isEmpty() ? details : null)
                .build();

        ErrorEnvelope envelope = ErrorEnvelope.builder()
                .success(false)
                .error(errorDetails)
                .timestamp(Instant.now())
                .build();

        return new ResponseEntity<>(envelope, status);
    }
}
