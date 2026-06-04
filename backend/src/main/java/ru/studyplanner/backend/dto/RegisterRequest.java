package ru.studyplanner.backend.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String login;
    private String password;
    private String role;
    private String fullName;
    private String position;
}