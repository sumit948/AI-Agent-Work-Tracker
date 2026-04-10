package com.ai.wt.repository;

import com.ai.wt.entity.StructuredLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface StructuredLogRepository extends JpaRepository<StructuredLog, Long> {

    List<StructuredLog> findByRawLogId(Long rawLogId);

    List<StructuredLog> findByUserIdAndLogDateOrderByLogDate(Long userId, LocalDate logDate);

    List<StructuredLog> findByUserIdAndLogDateBetweenOrderByLogDate(Long userId, LocalDate start, LocalDate end);

    void deleteByRawLogId(Long rawLogId);

    @Query("SELECT s.category, COUNT(s), SUM(s.hours) " +
           "FROM StructuredLog s " +
           "WHERE s.user.id = :userId " +
           "  AND s.logDate BETWEEN :start AND :end " +
           "GROUP BY s.category")
    List<Object[]> getCategoryBreakdown(@Param("userId") Long userId,
                                         @Param("start") LocalDate start,
                                         @Param("end") LocalDate end);

    @Query("SELECT s.logDate, SUM(s.hours), COUNT(s) " +
           "FROM StructuredLog s " +
           "WHERE s.user.id = :userId " +
           "  AND s.logDate BETWEEN :start AND :end " +
           "GROUP BY s.logDate " +
           "ORDER BY s.logDate")
    List<Object[]> getDailyHoursSummary(@Param("userId") Long userId,
                                         @Param("start") LocalDate start,
                                         @Param("end") LocalDate end);
}
