package com.gymsaas.module.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OccupancyResponse {

    private long currentCount;
    private long totalCapacity;
    private int occupancyPercentage;
    private long todayTotalCheckIns;
}
