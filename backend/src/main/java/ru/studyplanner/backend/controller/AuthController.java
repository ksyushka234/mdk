package ru.studyplanner.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import ru.studyplanner.backend.config.JwtService;
import ru.studyplanner.backend.dto.LoginRequest;
import ru.studyplanner.backend.dto.RegisterRequest;
import ru.studyplanner.backend.dto.TokenResponse;
import ru.studyplanner.backend.entity.Employee;
import ru.studyplanner.backend.entity.Manager;
import ru.studyplanner.backend.entity.User;
import ru.studyplanner.backend.repository.EmployeeRepository;
import ru.studyplanner.backend.repository.ManagerRepository;
import ru.studyplanner.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final ManagerRepository managerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<TokenResponse> register(@RequestBody RegisterRequest request) {
        // Проверка на существующего пользователя
        if (userRepository.existsByLogin(request.getLogin())) {
            throw new RuntimeException("User with login '" + request.getLogin() + "' already exists");
        }

        // Создаем пользователя
        User user = new User();
        user.setLogin(request.getLogin());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        // Используем roleCode из DTO (убедись, что в RegisterRequest поле называется roleCode)
        String role = request.getRole() != null ? request.getRole() : "EMPLOYEE";
        user.setRoleCode(role);

        userRepository.save(user);

        // Создаем профиль в зависимости от роли
        if ("EMPLOYEE".equals(role)) {
            Employee employee = new Employee();

            employee.setUser(user);

            employee.setFullName(request.getFullName());

            employee.setPosition(request.getPosition());

            // Отдел пока null
            employee.setDepartmentId(null);

            // Используем save, Hibernate сам разберется с ID благодаря связи с User
            employeeRepository.save(employee);

        } else if ("MANAGER".equals(role)) {
            Manager manager = new Manager();
            manager.setUser(user); // Аналогично для менеджера
            manager.setFullName(request.getFullName());
            managerRepository.save(manager);
        }

        // Генерируем токен
        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new TokenResponse(token, user.getRoleCode()));
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody LoginRequest request) {
        // Аутентификация через Spring Security
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getLogin(),
                        request.getPassword()
                )
        );

        // Находим пользователя
        User user = userRepository.findByLogin(request.getLogin())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        // Генерируем токен
        String token = jwtService.generateToken(user);

        // Получаем роль пользователя
        String roleCode = user.getRoleCode();

        // Возвращаем токен И роль
        return ResponseEntity.ok(new TokenResponse(token, roleCode));
    }
}