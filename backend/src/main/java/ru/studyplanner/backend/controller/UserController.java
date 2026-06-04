package ru.studyplanner.backend.controller;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder; // Импорт для шифрования
import org.springframework.web.bind.annotation.*;
import ru.studyplanner.backend.entity.Employee;
import ru.studyplanner.backend.entity.User;
import ru.studyplanner.backend.repository.EmployeeRepository;
import ru.studyplanner.backend.repository.UserRepository;

import java.util.List;
import java.util.Map; // Импорт для Map

@Getter
@Setter
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // Добавили зависимость

    // Получить список всех сотрудников
    @GetMapping("/employees")
    public ResponseEntity<List<Employee>> getAllEmployees() {
        List<Employee> employees = employeeRepository.findAll();
        return ResponseEntity.ok(employees);
    }

    // Обновление профиля (ФИО и Пароль)
    @PutMapping("/profile")
    public ResponseEntity<Void> updateProfile(@RequestBody Map<String, String> updates) {
        // Получаем ID пользователя из запроса
        // В реальном проекте ID берется из токена безопасности, но для учебного проекта так проще
        Long userId = Long.parseLong(updates.get("userId"));

        String newFullName = updates.get("newFullName");
        String newPassword = updates.get("newPassword");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден с ID: " + userId));

        boolean isUpdated = false;

        // Обновляем ФИО, если оно передано и не пустое
        if (newFullName != null && !newFullName.isEmpty()) {
            user.setFullName(newFullName);
            isUpdated = true;
        }

        // Обновляем пароль, если он передан и не пустой
        if (newPassword != null && !newPassword.isEmpty()) {
            // ВАЖНО: Пароль нужно хешировать!
            user.setPasswordHash(passwordEncoder.encode(newPassword));
            isUpdated = true;
        }

        if (isUpdated) {
            userRepository.save(user);
        }

        return ResponseEntity.ok().build();
    }
}