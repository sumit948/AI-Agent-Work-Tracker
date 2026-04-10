package com.ai.wt.dto.log;

import com.ai.wt.entity.enums.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StructuredLogDto {

    private Long id;
    private String taskTitle;
    private Category category;
    private BigDecimal hours;
    private LocalDate logDate;
}
