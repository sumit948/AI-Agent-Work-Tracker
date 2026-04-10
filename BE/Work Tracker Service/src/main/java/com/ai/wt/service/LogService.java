package com.ai.wt.service;

import com.ai.wt.dto.ai.AiTaskResult;
import com.ai.wt.dto.log.RawLogRequest;
import com.ai.wt.dto.log.RawLogResponse;
import com.ai.wt.dto.log.StructuredLogDto;
import com.ai.wt.entity.RawLog;
import com.ai.wt.entity.StructuredLog;
import com.ai.wt.entity.User;
import com.ai.wt.entity.enums.AiStatus;
import com.ai.wt.entity.enums.Category;
import com.ai.wt.exception.ResourceNotFoundException;
import com.ai.wt.repository.RawLogRepository;
import com.ai.wt.repository.StructuredLogRepository;
import com.ai.wt.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LogService {

    private final RawLogRepository rawLogRepository;
    private final StructuredLogRepository structuredLogRepository;
    private final UserRepository userRepository;
    private final AIService aiService;

    @Transactional
    public RawLogResponse submitLog(String userEmail, RawLogRequest request) {
        User user = findUser(userEmail);

        RawLog rawLog = RawLog.builder()
                .user(user)
                .rawText(request.getRawText())
                .aiStatus(AiStatus.PENDING)
                .build();
        rawLog = rawLogRepository.save(rawLog);

        List<StructuredLog> structuredLogs = processWithAI(rawLog, user);

        return buildRawLogResponse(rawLog, structuredLogs);
    }

    @Transactional(readOnly = true)
    public List<RawLogResponse> getLogsForUser(String userEmail) {
        User user = findUser(userEmail);

        return rawLogRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(rawLog -> {
                    List<StructuredLog> tasks = structuredLogRepository.findByRawLogId(rawLog.getId());
                    return buildRawLogResponse(rawLog, tasks);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RawLogResponse getLogById(String userEmail, Long logId) {
        User user = findUser(userEmail);

        RawLog rawLog = rawLogRepository.findByIdAndUserId(logId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Log not found with id: " + logId));

        List<StructuredLog> tasks = structuredLogRepository.findByRawLogId(logId);
        return buildRawLogResponse(rawLog, tasks);
    }

    @Transactional
    public RawLogResponse reprocessLog(String userEmail, Long rawLogId) {
        User user = findUser(userEmail);

        RawLog rawLog = rawLogRepository.findByIdAndUserId(rawLogId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Log not found with id: " + rawLogId));

        // Remove old structured logs before reprocessing
        structuredLogRepository.deleteByRawLogId(rawLogId);

        List<StructuredLog> structuredLogs = processWithAI(rawLog, user);
        return buildRawLogResponse(rawLog, structuredLogs);
    }

    private List<StructuredLog> processWithAI(RawLog rawLog, User user) {
        try {
            List<AiTaskResult> tasks = aiService.processRawLog(rawLog.getRawText());

            if (tasks.isEmpty()) {
                rawLog.setAiStatus(AiStatus.FAILED);
                rawLogRepository.save(rawLog);
                return Collections.emptyList();
            }

            List<StructuredLog> structuredLogs = tasks.stream()
                    .map(task -> StructuredLog.builder()
                            .user(user)
                            .rawLog(rawLog)
                            .taskTitle(task.getTitle())
                            .category(parseCategory(task.getCategory()))
                            .hours(task.getHours() != null ? BigDecimal.valueOf(task.getHours()) : BigDecimal.ZERO)
                            .logDate(rawLog.getCreatedAt().toLocalDate())
                            .build())
                    .collect(Collectors.toList());

            structuredLogs = structuredLogRepository.saveAll(structuredLogs);

            rawLog.setAiStatus(AiStatus.PROCESSED);
            rawLogRepository.save(rawLog);

            log.info("AI processed log id={} -> {} tasks extracted", rawLog.getId(), structuredLogs.size());
            return structuredLogs;

        } catch (Exception e) {
            log.error("AI processing failed for log id: {}", rawLog.getId(), e);
            rawLog.setAiStatus(AiStatus.FAILED);
            rawLogRepository.save(rawLog);
            return Collections.emptyList();
        }
    }

    private Category parseCategory(String categoryStr) {
        if (categoryStr == null) return Category.OTHER;
        try {
            return Category.valueOf(categoryStr.toUpperCase().replace(" ", "_"));
        } catch (IllegalArgumentException e) {
            log.debug("Unknown category '{}', defaulting to OTHER", categoryStr);
            return Category.OTHER;
        }
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private RawLogResponse buildRawLogResponse(RawLog rawLog, List<StructuredLog> structuredLogs) {
        List<StructuredLogDto> taskDtos = structuredLogs.stream()
                .map(task -> StructuredLogDto.builder()
                        .id(task.getId())
                        .taskTitle(task.getTaskTitle())
                        .category(task.getCategory())
                        .hours(task.getHours())
                        .logDate(task.getLogDate())
                        .build())
                .collect(Collectors.toList());

        return RawLogResponse.builder()
                .rawLogId(rawLog.getId())
                .rawText(rawLog.getRawText())
                .aiStatus(rawLog.getAiStatus())
                .createdAt(rawLog.getCreatedAt())
                .structuredTasks(taskDtos)
                .build();
    }
}
