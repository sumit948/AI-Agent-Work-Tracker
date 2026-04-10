package com.ai.wt.dto.ai;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ProcessLogRequest {

    @NotNull(message = "rawLogId is required")
    private Long rawLogId;
}
