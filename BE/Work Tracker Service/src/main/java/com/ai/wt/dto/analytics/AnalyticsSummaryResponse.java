package com.ai.wt.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsSummaryResponse {

    private double totalHours;
    private long totalTasks;
    private double avgHoursPerDay;
    private double productivityScore;
    private List<CategoryBreakdownDto> categoryBreakdown;
    private List<DailyTrendDto> dailyTrend;
}
