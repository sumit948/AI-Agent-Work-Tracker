package com.ai.wt.controller;

import com.ai.wt.dto.ai.ProcessLogRequest;
import com.ai.wt.dto.common.ApiResponse;
import com.ai.wt.dto.log.RawLogResponse;
import com.ai.wt.service.LogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "AI Processing", description = "Manually trigger AI re-processing on saved logs")
public class AIController {

    private final LogService logService;

    @PostMapping("/process-log")
    @Operation(summary = "Manually re-trigger AI processing on a raw log (retry for FAILED logs)")
    public ResponseEntity<ApiResponse<RawLogResponse>> processLog(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ProcessLogRequest request) {
        RawLogResponse response = logService.reprocessLog(userDetails.getUsername(), request.getRawLogId());
        return ResponseEntity.ok(ApiResponse.success("Log re-processed successfully", response));
    }
}
