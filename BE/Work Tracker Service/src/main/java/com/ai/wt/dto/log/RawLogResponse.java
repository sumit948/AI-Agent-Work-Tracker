package com.ai.wt.dto.log;

import com.ai.wt.entity.enums.AiStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RawLogResponse {

    private Long rawLogId;
    private String rawText;
    private AiStatus aiStatus;
    private LocalDateTime createdAt;
    private List<StructuredLogDto> structuredTasks;
}
