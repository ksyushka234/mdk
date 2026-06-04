package ru.studyplanner.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data // <--- ЭТА АННОТАЦИЯ ОБЯЗАТЕЛЬНА!
public class TaskCreateRequest {
    private String title;
    private String description;
    private LocalDateTime deadlineAt;
    private String priority;
    private Long assigneeUserId;
}