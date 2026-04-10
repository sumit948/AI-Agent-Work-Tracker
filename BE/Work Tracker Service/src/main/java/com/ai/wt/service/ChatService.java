package com.ai.wt.service;

import com.ai.wt.dto.chat.ChatResponse;
import com.ai.wt.entity.StructuredLog;
import com.ai.wt.entity.User;
import com.ai.wt.exception.ResourceNotFoundException;
import com.ai.wt.repository.StructuredLogRepository;
import com.ai.wt.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final StructuredLogRepository structuredLogRepository;
    private final UserRepository userRepository;
    private final AIService aiService;

    @Transactional(readOnly = true)
    public ChatResponse processQuery(String userEmail, String question) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Build context from the last 30 days of logs
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(30);

        List<StructuredLog> recentLogs = structuredLogRepository
                .findByUserIdAndLogDateBetweenOrderByLogDate(user.getId(), startDate, endDate);

        String logContext = buildLogContext(recentLogs, startDate, endDate);

        try {
            String answer = aiService.answerChatQuery(question, logContext);

            return ChatResponse.builder()
                    .question(question)
                    .answer(answer)
                    .timestamp(LocalDateTime.now())
                    .build();
        } catch (Exception e) {
            log.error("Chat query failed for user: {}", userEmail, e);
            return ChatResponse.builder()
                    .question(question)
                    .answer("I'm sorry, I couldn't process your question right now. Please try again.")
                    .timestamp(LocalDateTime.now())
                    .build();
        }
    }

    private String buildLogContext(List<StructuredLog> logs, LocalDate startDate, LocalDate endDate) {
        if (logs.isEmpty()) {
            return "No work logs found for the period from " + startDate + " to " + endDate + ".";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("Work logs from ").append(startDate).append(" to ").append(endDate).append(":\n\n");

        logs.forEach(log -> sb.append(String.format(
                "Date: %s | Task: %s | Category: %s | Hours: %.1f%n",
                log.getLogDate(),
                log.getTaskTitle(),
                log.getCategory(),
                log.getHours() != null ? log.getHours().doubleValue() : 0.0)));

        return sb.toString();
    }
}
