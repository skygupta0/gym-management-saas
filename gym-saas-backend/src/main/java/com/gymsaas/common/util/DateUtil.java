package com.gymsaas.common.util;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public final class DateUtil {

    private DateUtil() {}

    public static long daysBetween(LocalDate start, LocalDate end) {
        if (start == null || end == null) {
            return 0;
        }
        return ChronoUnit.DAYS.between(start, end);
    }

    public static long daysUntil(LocalDate date) {
        if (date == null) {
            return 0;
        }
        return ChronoUnit.DAYS.between(LocalDate.now(), date);
    }

    public static boolean isExpiringWithinDays(LocalDate endDate, int days) {
        if (endDate == null) {
            return false;
        }
        long diff = daysUntil(endDate);
        return diff >= 0 && diff <= days;
    }

    public static boolean isExpired(LocalDate endDate) {
        if (endDate == null) {
            return false;
        }
        return endDate.isBefore(LocalDate.now());
    }
}
