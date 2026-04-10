package com.ai.wt.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryBreakdownDto {

    private String category;
    private long taskCount;
    private double totalHours;
}
