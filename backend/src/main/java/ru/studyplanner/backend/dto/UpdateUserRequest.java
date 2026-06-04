package ru.studyplanner.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        @NotNull @Size(max = 20) String roleCode,
        Boolean isActive,
        String password
) {}