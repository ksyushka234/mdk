package ru.studyplanner.backend.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
public record TaskUpdateRequest(
        String status,          // TODO, IN_PROGRESS, DONE
        Integer progressPercent,
        LocalDateTime completedAt
) {}