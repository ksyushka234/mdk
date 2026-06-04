package ru.studyplanner.backend.dto;

import java.time.Instant;

public record UserResponse(
        Long id,
        String roleCode,
        String login,
        Instant createdAt,
        Instant lastLoginAt,
        boolean isActive
) {}
