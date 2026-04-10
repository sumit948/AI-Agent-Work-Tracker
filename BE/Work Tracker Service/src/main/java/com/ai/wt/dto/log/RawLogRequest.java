package com.ai.wt.dto.log;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class RawLogRequest {

    @NotBlank(message = "Work notes cannot be empty")
    @Size(min = 3, max = 5000, message = "Work notes must be between 3 and 5000 characters")
    private String rawText;
}
