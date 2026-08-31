package com.gymsaas.module.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    private long activeMembers;
    private long todayCheckIns;
    private BigDecimal monthlyRevenue;
    private long expiringSoon;

    private long liveFloorCount;
    private long liveFloorCapacity;
    private int liveFloorPercentage;

    private List<ActivityStreamItem> recentActivity;
}
