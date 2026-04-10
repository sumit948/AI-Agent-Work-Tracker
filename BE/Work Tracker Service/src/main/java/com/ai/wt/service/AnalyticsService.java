package com.ai.wt.service;

import com.ai.wt.dto.analytics.AnalyticsSummaryResponse;
import com.ai.wt.dto.analytics.CategoryBreakdownDto;
import com.ai.wt.dto.analytics.DailyTrendDto;
import com.ai.wt.entity.StructuredLog;
import com.ai.wt.entity.User;
import com.ai.wt.entity.enums.Category;
import com.ai.wt.exception.ResourceNotFoundException;
import com.ai.wt.repository.StructuredLogRepository;
import com.ai.wt.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {

    private final StructuredLogRepository structuredLogRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public AnalyticsSummaryResponse getAnalytics(String userEmail, LocalDate startDate, LocalDate endDate) {
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("endDate must not be before startDate");
        }

        long dayRange = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        if (dayRange > 365) {
            throw new IllegalArgumentException("Date range must not exceed 365 days");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<StructuredLog> logs = structuredLogRepository
                .findByUserIdAndLogDateBetweenOrderByLogDate(user.getId(), startDate, endDate);

        double totalHours = logs.stream()
                .mapToDouble(l -> l.getHours() != null ? l.getHours().doubleValue() : 0)
                .sum();

        long totalTasks = logs.size();
        double avgHoursPerDay = dayRange > 0 ? totalHours / dayRange : 0;

        // Productivity score: based on logged hours vs expected 8h/day (work days only)
        long workDays = startDate.datesUntil(endDate.plusDays(1))
                .filter(d -> d.getDayOfWeek().getValue() <= 5)
                .count();
        double maxPossibleHours = workDays * 8.0;
        double productivityScore = maxPossibleHours > 0
                ? Math.min((totalHours / maxPossibleHours) * 100.0, 100.0)
                : 0.0;

        // Category breakdown
        Map<Category, Long> countByCategory = logs.stream()
                .collect(Collectors.groupingBy(StructuredLog::getCategory, Collectors.counting()));

        Map<Category, Double> hoursByCategory = logs.stream()
                .collect(Collectors.groupingBy(StructuredLog::getCategory,
                        Collectors.summingDouble(l -> l.getHours() != null ? l.getHours().doubleValue() : 0)));

        List<CategoryBreakdownDto> categoryBreakdown = Arrays.stream(Category.values())
                .filter(countByCategory::containsKey)
                .map(c -> CategoryBreakdownDto.builder()
                        .category(c.name())
                        .taskCount(countByCategory.getOrDefault(c, 0L))
                        .totalHours(hoursByCategory.getOrDefault(c, 0.0))
                        .build())
                .collect(Collectors.toList());

        // Daily trend
        Map<LocalDate, Double> hoursByDate = logs.stream()
                .collect(Collectors.groupingBy(StructuredLog::getLogDate,
                        Collectors.summingDouble(l -> l.getHours() != null ? l.getHours().doubleValue() : 0)));

        Map<LocalDate, Long> tasksByDate = logs.stream()
                .collect(Collectors.groupingBy(StructuredLog::getLogDate, Collectors.counting()));

        List<DailyTrendDto> dailyTrend = startDate.datesUntil(endDate.plusDays(1))
                .map(date -> DailyTrendDto.builder()
                        .date(date)
                        .hours(hoursByDate.getOrDefault(date, 0.0))
                        .taskCount(tasksByDate.getOrDefault(date, 0L))
                        .build())
                .collect(Collectors.toList());

        return AnalyticsSummaryResponse.builder()
                .totalHours(totalHours)
                .totalTasks(totalTasks)
                .avgHoursPerDay(avgHoursPerDay)
                .productivityScore(productivityScore)
                .categoryBreakdown(categoryBreakdown)
                .dailyTrend(dailyTrend)
                .build();
    }
}
