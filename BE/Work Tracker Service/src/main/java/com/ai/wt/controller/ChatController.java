package com.ai.wt.controller;

import com.ai.wt.dto.chat.ChatRequest;
import com.ai.wt.dto.chat.ChatResponse;
import com.ai.wt.dto.common.ApiResponse;
import com.ai.wt.service.ChatService;
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
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "AI Chat", description = "Natural language queries about your work logs")
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    @Operation(summary = "Ask a natural language question — AI answers from your work history")
    public ResponseEntity<ApiResponse<ChatResponse>> chat(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChatRequest request) {
        ChatResponse response = chatService.processQuery(userDetails.getUsername(), request.getQuestion());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
