package com.ai.wt.dto.report;

import com.ai.wt.dto.analytics.CategoryBreakdownDto;
import com.ai.wt.dto.analytics.DailyTrendDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeeklyReportResponse {

    private LocalDate weekStart;
    private LocalDate weekEnd;
    private double totalHours;
    private int taskCount;
    private Map<String, Double> categoryBreakdown;
    private List<DailyTrendDto> dailyBreakdown;
    private String summary;
}
