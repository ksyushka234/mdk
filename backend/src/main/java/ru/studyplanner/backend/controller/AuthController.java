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
        if (userRepository.existsByLogin(request.getLogin())) {
            throw new RuntimeException("User with login '" + request.getLogin() + "' already exists");
        }

        User user = new User();
        user.setLogin(request.getLogin());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        String role = request.getRole() != null ? request.getRole() : "EMPLOYEE";
        user.setRoleCode(role);
        userRepository.save(user); // После save у user появится ID

        if ("EMPLOYEE".equals(role)) {
            Employee employee = new Employee();
            employee.setUser(user);
            employee.setFullName(request.getFullName());
            employee.setPosition(request.getPosition());
            employee.setDepartmentId(null);
            employeeRepository.save(employee);
        } else if ("MANAGER".equals(role)) {
            Manager manager = new Manager();
            manager.setUser(user);
            manager.setFullName(request.getFullName());
            managerRepository.save(manager);
        }

        String token = jwtService.generateTokenWithId(user.getId(), user);
        return ResponseEntity.ok(new TokenResponse(token, user.getRoleCode()));
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getLogin(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByLogin(request.getLogin())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        String token = jwtService.generateTokenWithId(user.getId(), user);

        return ResponseEntity.ok(new TokenResponse(token, user.getRoleCode()));
    }
}