package com.gymsaas.module.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityStreamItem {

    private String id;
    private String type; // CHECK_IN, PAYMENT, ENROLLMENT, EXPIRY_ALERT
    private String icon;
    private String title;
    private String description;
    private Instant timestamp;
    private String timeAgo;
}
