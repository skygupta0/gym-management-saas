package com.gymsaas.common.exception;

import lombok.Getter;

import java.util.List;

@Getter
public class GymException extends RuntimeException {

    private final ErrorCode errorCode;
    private final List<String> details;

    public GymException(ErrorCode errorCode) {
        super(errorCode.getDefaultMessage());
        this.errorCode = errorCode;
        this.details = List.of();
    }

    public GymException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.details = List.of();
    }

    public GymException(ErrorCode errorCode, String message, List<String> details) {
        super(message);
        this.errorCode = errorCode;
        this.details = details != null ? details : List.of();
    }
}
