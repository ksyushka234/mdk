package ru.studyplanner.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TaskCreateRequest {
    private String title;
    private String description;
    private LocalDateTime deadlineAt;

    private LocalDateTime startDateAt;

    private String priority;
    private Long assigneeUserId;
}