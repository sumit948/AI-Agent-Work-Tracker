package com.ai.wt.dto.report;

import com.ai.wt.dto.log.StructuredLogDto;
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
public class DailyReportResponse {

    private LocalDate date;
    private double totalHours;
    private int taskCount;
    private List<StructuredLogDto> tasks;
    private String summary;
    private Map<String, Double> categoryBreakdown;
}
