package ru.studyplanner.backend.dto; // Проверь свой пакет

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TokenResponse {
    private String token;
    private String role; // Добавляем поле для роли
}