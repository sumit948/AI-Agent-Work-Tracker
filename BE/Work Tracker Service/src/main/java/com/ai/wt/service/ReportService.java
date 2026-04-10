package com.ai.wt.service;

import com.ai.wt.dto.analytics.CategoryBreakdownDto;
import com.ai.wt.dto.analytics.DailyTrendDto;
import com.ai.wt.dto.log.StructuredLogDto;
import com.ai.wt.dto.report.DailyReportResponse;
import com.ai.wt.dto.report.WeeklyReportResponse;
import com.ai.wt.entity.Report;
import com.ai.wt.entity.StructuredLog;
import com.ai.wt.entity.User;
import com.ai.wt.entity.enums.Category;
import com.ai.wt.entity.enums.ReportType;
import com.ai.wt.exception.ResourceNotFoundException;
import com.ai.wt.repository.ReportRepository;
import com.ai.wt.repository.StructuredLogRepository;
import com.ai.wt.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final StructuredLogRepository structuredLogRepository;
    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final AIService aiService;

    @Transactional
    public DailyReportResponse getDailyReport(String userEmail, LocalDate date) {
        User user = findUser(userEmail);

        List<StructuredLog> logs = structuredLogRepository
                .findByUserIdAndLogDateOrderByLogDate(user.getId(), date);

        List<StructuredLogDto> taskDtos = toStructuredLogDtos(logs);
        double totalHours = logs.stream()
                .mapToDouble(l -> l.getHours() != null ? l.getHours().doubleValue() : 0)
                .sum();

        Map<String, Double> categoryBreakdown = buildCategoryHoursMap(logs);

        // Try to get cached summary, generate if not exists
        String summary = getCachedOrGenerateDailySummary(user.getId(), date, logs);

        return DailyReportResponse.builder()
                .date(date)
                .totalHours(totalHours)
                .taskCount(logs.size())
                .tasks(taskDtos)
                .summary(summary)
                .categoryBreakdown(categoryBreakdown)
                .build();
    }

    @Transactional
    public WeeklyReportResponse getWeeklyReport(String userEmail, LocalDate weekStart) {
        // Ensure weekStart is Monday
        LocalDate monday = weekStart.with(DayOfWeek.MONDAY);
        LocalDate sunday = monday.plusDays(6);

        User user = findUser(userEmail);

        List<StructuredLog> logs = structuredLogRepository
                .findByUserIdAndLogDateBetweenOrderByLogDate(user.getId(), monday, sunday);

        double totalHours = logs.stream()
                .mapToDouble(l -> l.getHours() != null ? l.getHours().doubleValue() : 0)
                .sum();

        Map<String, Double> categoryBreakdown = buildCategoryHoursMap(logs);

        // Build daily breakdown
        Map<LocalDate, Double> hoursByDate = logs.stream()
                .collect(Collectors.groupingBy(StructuredLog::getLogDate,
                        Collectors.summingDouble(l -> l.getHours() != null ? l.getHours().doubleValue() : 0)));

        Map<LocalDate, Long> tasksByDate = logs.stream()
                .collect(Collectors.groupingBy(StructuredLog::getLogDate, Collectors.counting()));

        List<DailyTrendDto> dailyBreakdown = monday.datesUntil(sunday.plusDays(1))
                .map(date -> DailyTrendDto.builder()
                        .date(date)
                        .hours(hoursByDate.getOrDefault(date, 0.0))
                        .taskCount(tasksByDate.getOrDefault(date, 0L))
                        .build())
                .collect(Collectors.toList());

        String summary = getCachedOrGenerateWeeklySummary(user.getId(), monday, logs);

        return WeeklyReportResponse.builder()
                .weekStart(monday)
                .weekEnd(sunday)
                .totalHours(totalHours)
                .taskCount(logs.size())
                .categoryBreakdown(categoryBreakdown)
                .dailyBreakdown(dailyBreakdown)
                .summary(summary)
                .build();
    }

    private String getCachedOrGenerateDailySummary(Long userId, LocalDate date, List<StructuredLog> logs) {
        Optional<Report> cached = reportRepository.findByUserIdAndReportTypeAndPeriodStart(
                userId, ReportType.DAILY, date);

        if (cached.isPresent()) {
            return cached.get().getContent();
        }

        if (logs.isEmpty()) {
            return "No work was logged for " + date.format(DateTimeFormatter.ofPattern("MMMM dd, yyyy")) + ".";
        }

        try {
            String context = buildLogsContext(logs);
            String summary = aiService.generateReportSummary(context, "daily standup");

            Report report = Report.builder()
                    .user(User.builder().id(userId).build())
                    .reportType(ReportType.DAILY)
                    .content(summary)
                    .periodStart(date)
                    .build();
            reportRepository.save(report);

            return summary;
        } catch (Exception e) {
            log.error("Failed to generate AI daily summary for date: {}", date, e);
            return buildFallbackDailySummary(logs);
        }
    }

    private String getCachedOrGenerateWeeklySummary(Long userId, LocalDate weekStart, List<StructuredLog> logs) {
        Optional<Report> cached = reportRepository.findByUserIdAndReportTypeAndPeriodStart(
                userId, ReportType.WEEKLY, weekStart);

        if (cached.isPresent()) {
            return cached.get().getContent();
        }

        if (logs.isEmpty()) {
            return "No work was logged for the week starting " +
                   weekStart.format(DateTimeFormatter.ofPattern("MMMM dd, yyyy")) + ".";
        }

        try {
            String context = buildLogsContext(logs);
            String summary = aiService.generateReportSummary(context, "weekly");

            Report report = Report.builder()
                    .user(User.builder().id(userId).build())
                    .reportType(ReportType.WEEKLY)
                    .content(summary)
                    .periodStart(weekStart)
                    .build();
            reportRepository.save(report);

            return summary;
        } catch (Exception e) {
            log.error("Failed to generate AI weekly summary for week: {}", weekStart, e);
            return buildFallbackWeeklySummary(logs);
        }
    }

    private String buildLogsContext(List<StructuredLog> logs) {
        StringBuilder sb = new StringBuilder();
        logs.forEach(log -> sb.append(String.format("- [%s] %s (%.1fh) on %s%n",
                log.getCategory(), log.getTaskTitle(),
                log.getHours() != null ? log.getHours().doubleValue() : 0.0,
                log.getLogDate())));
        return sb.toString();
    }

    private String buildFallbackDailySummary(List<StructuredLog> logs) {
        double total = logs.stream()
                .mapToDouble(l -> l.getHours() != null ? l.getHours().doubleValue() : 0).sum();
        return String.format("Completed %d task(s) with a total of %.1f hours logged.", logs.size(), total);
    }

    private String buildFallbackWeeklySummary(List<StructuredLog> logs) {
        double total = logs.stream()
                .mapToDouble(l -> l.getHours() != null ? l.getHours().doubleValue() : 0).sum();
        return String.format("Completed %d task(s) across %d day(s) with %.1f total hours.",
                logs.size(),
                logs.stream().map(StructuredLog::getLogDate).distinct().count(),
                total);
    }

    private Map<String, Double> buildCategoryHoursMap(List<StructuredLog> logs) {
        return logs.stream()
                .collect(Collectors.groupingBy(
                        l -> l.getCategory().name(),
                        Collectors.summingDouble(l -> l.getHours() != null ? l.getHours().doubleValue() : 0)));
    }

    private List<StructuredLogDto> toStructuredLogDtos(List<StructuredLog> logs) {
        return logs.stream()
                .map(t -> StructuredLogDto.builder()
                        .id(t.getId())
                        .taskTitle(t.getTaskTitle())
                        .category(t.getCategory())
                        .hours(t.getHours())
                        .logDate(t.getLogDate())
                        .build())
                .collect(Collectors.toList());
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
