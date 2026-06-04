package ru.studyplanner.backend.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ActivityLogCreateRequest(
        @NotNull Long userId,
        @NotBlank @Size(max = 30) String eventType,
        String details
) {}