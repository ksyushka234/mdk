package ru.studyplanner.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.studyplanner.backend.entity.ActivityLog;

import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findByUser_Id(Long userId);
    List<ActivityLog> findByEventType(String eventType);
}