package com.ai.wt.repository;

import com.ai.wt.entity.Report;
import com.ai.wt.entity.enums.ReportType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    Optional<Report> findByUserIdAndReportTypeAndPeriodStart(Long userId, ReportType reportType, LocalDate periodStart);

    List<Report> findByUserIdAndReportTypeOrderByPeriodStartDesc(Long userId, ReportType reportType);
}
