package com.ai.wt.controller;

import com.ai.wt.dto.common.ApiResponse;
import com.ai.wt.dto.log.RawLogRequest;
import com.ai.wt.dto.log.RawLogResponse;
import com.ai.wt.service.LogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Work Logs", description = "Submit and retrieve work log entries")
public class LogController {

    private final LogService logService;

    @PostMapping
    @Operation(summary = "Submit raw work notes — triggers AI processing")
    public ResponseEntity<ApiResponse<RawLogResponse>> submitLog(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody RawLogRequest request) {
        RawLogResponse response = logService.submitLog(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Work log submitted and processed", response));
    }

    @GetMapping
    @Operation(summary = "Retrieve all work logs for the authenticated user")
    public ResponseEntity<ApiResponse<List<RawLogResponse>>> getLogs(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<RawLogResponse> logs = logService.getLogsForUser(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single work log entry with structured tasks")
    public ResponseEntity<ApiResponse<RawLogResponse>> getLogById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        RawLogResponse log = logService.getLogById(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success(log));
    }
}
