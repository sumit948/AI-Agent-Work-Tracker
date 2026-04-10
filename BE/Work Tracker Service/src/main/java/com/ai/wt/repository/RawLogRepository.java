package com.ai.wt.repository;

import com.ai.wt.entity.RawLog;
import com.ai.wt.entity.enums.AiStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RawLogRepository extends JpaRepository<RawLog, Long> {

    List<RawLog> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<RawLog> findByUserIdAndAiStatus(Long userId, AiStatus aiStatus);

    Optional<RawLog> findByIdAndUserId(Long id, Long userId);
}
