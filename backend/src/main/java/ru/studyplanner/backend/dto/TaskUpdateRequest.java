package ru.studyplanner.backend.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record TaskUpdateRequest(
        String title,
        String description,
        LocalDateTime deadlineAt,
        LocalDateTime startDateAt,
        String status,
        Integer progressPercent,
        LocalDateTime completedAt,
        String priority
) {}