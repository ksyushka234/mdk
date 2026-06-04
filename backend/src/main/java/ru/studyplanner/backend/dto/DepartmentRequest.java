package ru.studyplanner.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record DepartmentRequest(
        @NotBlank String name,
        Long managerUserId      // ID руководителя отдела
) {}