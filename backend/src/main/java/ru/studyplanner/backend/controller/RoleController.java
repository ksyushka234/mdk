package ru.studyplanner.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import ru.studyplanner.backend.entity.Role;
import ru.studyplanner.backend.repository.RoleRepository;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleRepository roleRepository;

    @GetMapping
    public List<Role> list() {
        return roleRepository.findAll();
    }

    @GetMapping("/{code}")
    public Role get(@PathVariable String code) {
        return roleRepository.findById(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found"));
    }
}