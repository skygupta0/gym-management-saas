package com.gymsaas.module.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckInRequest {

    // Can supply either memberId or memberCode (for fast barcode/QR scanning)
    private UUID memberId;
    private String memberCode;
    private String source; // QR_CODE, MANUAL_STAFF, BIOMETRIC
}
