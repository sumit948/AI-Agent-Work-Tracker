package com.ai.wt.entity;

import com.ai.wt.entity.enums.Category;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "structured_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"user", "rawLog"})
@EqualsAndHashCode(of = "id")
public class StructuredLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "raw_log_id", nullable = false)
    private RawLog rawLog;

    @Column(name = "task_title", nullable = false, length = 255)
    private String taskTitle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Category category;

    @Column(precision = 4, scale = 1)
    private BigDecimal hours;

    @Column(name = "log_date")
    private LocalDate logDate;
}
