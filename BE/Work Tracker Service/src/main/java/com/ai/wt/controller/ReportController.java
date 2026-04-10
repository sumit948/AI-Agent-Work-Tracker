package com.ai.wt.controller;

import com.ai.wt.dto.common.ApiResponse;
import com.ai.wt.dto.report.DailyReportResponse;
import com.ai.wt.dto.report.WeeklyReportResponse;
import com.ai.wt.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Reports", description = "AI-generated daily and weekly work reports")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/daily")
    @Operation(summary = "Get daily report — tasks and AI summary for a specific date")
    public ResponseEntity<ApiResponse<DailyReportResponse>> getDailyReport(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        DailyReportResponse report = reportService.getDailyReport(userDetails.getUsername(), targetDate);
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/weekly")
    @Operation(summary = "Get weekly report — aggregated tasks and AI summary for a week")
    public ResponseEntity<ApiResponse<WeeklyReportResponse>> getWeeklyReport(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        LocalDate targetWeek = weekStart != null ? weekStart : LocalDate.now();
        WeeklyReportResponse report = reportService.getWeeklyReport(userDetails.getUsername(), targetWeek);
        return ResponseEntity.ok(ApiResponse.success(report));
    }
}
