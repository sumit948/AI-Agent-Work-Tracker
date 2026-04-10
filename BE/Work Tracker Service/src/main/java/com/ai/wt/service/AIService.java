package com.ai.wt.service;

import com.ai.wt.dto.ai.AiStructuredResult;
import com.ai.wt.dto.ai.AiTaskResult;
import com.ai.wt.dto.ai.OpenAiRequest;
import com.ai.wt.dto.ai.OpenAiResponse;
import com.ai.wt.exception.AIProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIService {

    private final WebClient openAiWebClient;
    private final ObjectMapper objectMapper;

    @Value("${application.ai.openai.api-key}")
    private String apiKey;

    @Value("${application.ai.openai.model:gpt-3.5-turbo}")
    private String model;

    @Value("${application.ai.openai.base-url:https://api.openai.com/v1}")
    private String baseUrl;

    @Value("${application.ai.openai.timeout-seconds:10}")
    private int timeoutSeconds;

    private static final String STRUCTURING_SYSTEM_PROMPT =
            "You are a work log parser for a developer productivity system. " +
            "Your job is to convert raw developer work notes into structured tasks. " +
            "Rules:\n" +
            "- Return ONLY valid JSON, no explanation text\n" +
            "- Categories must be exactly one of: Bug, Feature, Meeting, Review, Documentation, Other\n" +
            "- Estimate hours based on typical task complexity (Bug: 1-3h, Feature: 2-5h, Meeting: 0.5-2h, Review: 0.5-2h)\n" +
            "- If multiple tasks, return all in the tasks array\n" +
            "- Keep task titles concise (under 80 chars)\n" +
            "Format: { \"tasks\": [{ \"title\": \"...\", \"category\": \"...\", \"hours\": 0.0 }] }";

    private static final String CHAT_SYSTEM_PROMPT =
            "You are an AI productivity assistant for a work tracking application. " +
            "You have access to the user's work logs. Answer questions based only on the provided data. " +
            "Be specific, mention task names, hours, dates, and categories where relevant. " +
            "If the data doesn't contain enough information to answer, say so clearly.";

    private static final String REPORT_SYSTEM_PROMPT =
            "You are a professional work report generator. " +
            "Given a list of work tasks, generate a clear, concise, and professional report. " +
            "Use bullet points where appropriate. Be factual and outcome-focused.";

    public List<AiTaskResult> processRawLog(String rawText) {
        log.info("Processing raw log with AI, text length: {}", rawText.length());

        OpenAiRequest request = OpenAiRequest.builder()
                .model(model)
                .messages(List.of(
                        new OpenAiRequest.Message("system", STRUCTURING_SYSTEM_PROMPT),
                        new OpenAiRequest.Message("user", "Input: " + rawText)))
                .temperature(0.2)
                .build();

        String responseContent = callOpenAi(request);
        return parseTasksFromResponse(responseContent);
    }

    public String answerChatQuery(String question, String logContext) {
        log.info("Processing chat query with AI");

        String userMessage = "Work logs context:\n" + logContext + "\n\nQuestion: " + question;

        OpenAiRequest request = OpenAiRequest.builder()
                .model(model)
                .messages(List.of(
                        new OpenAiRequest.Message("system", CHAT_SYSTEM_PROMPT),
                        new OpenAiRequest.Message("user", userMessage)))
                .temperature(0.5)
                .build();

        return callOpenAi(request);
    }

    public String generateReportSummary(String reportContext, String reportType) {
        log.info("Generating {} report summary with AI", reportType);

        String userMessage = "Generate a professional " + reportType + " work report based on these tasks:\n" + reportContext;

        OpenAiRequest request = OpenAiRequest.builder()
                .model(model)
                .messages(List.of(
                        new OpenAiRequest.Message("system", REPORT_SYSTEM_PROMPT),
                        new OpenAiRequest.Message("user", userMessage)))
                .temperature(0.4)
                .build();

        return callOpenAi(request);
    }

    private String callOpenAi(OpenAiRequest request) {
        try {
            OpenAiResponse response = openAiWebClient.post()
                    .uri(baseUrl + "/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(OpenAiResponse.class)
                    .timeout(Duration.ofSeconds(timeoutSeconds))
                    .block();

            if (response == null || response.getChoices() == null || response.getChoices().isEmpty()) {
                throw new AIProcessingException("Empty response from AI service");
            }

            return response.getChoices().get(0).getMessage().getContent();

        } catch (WebClientResponseException e) {
            log.error("OpenAI API error - status: {}, body: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new AIProcessingException("AI service returned error: " + e.getStatusCode());
        } catch (AIProcessingException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to call AI service", e);
            throw new AIProcessingException("Failed to communicate with AI service: " + e.getMessage(), e);
        }
    }

    private List<AiTaskResult> parseTasksFromResponse(String content) {
        try {
            // Extract JSON block if any surrounding text exists
            int jsonStart = content.indexOf('{');
            int jsonEnd = content.lastIndexOf('}');

            if (jsonStart == -1 || jsonEnd == -1) {
                log.warn("No valid JSON found in AI response: {}", content);
                return Collections.emptyList();
            }

            String jsonContent = content.substring(jsonStart, jsonEnd + 1);
            AiStructuredResult result = objectMapper.readValue(jsonContent, AiStructuredResult.class);

            if (result.getTasks() == null || result.getTasks().isEmpty()) {
                log.warn("AI returned empty tasks list");
                return Collections.emptyList();
            }

            return result.getTasks();

        } catch (Exception e) {
            log.error("Failed to parse AI response: {}", content, e);
            return Collections.emptyList();
        }
    }
}
