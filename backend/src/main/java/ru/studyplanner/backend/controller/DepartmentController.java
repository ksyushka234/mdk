package ru.studyplanner.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.studyplanner.backend.entity.Department;
import ru.studyplanner.backend.repository.DepartmentRepository;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentRepository departmentRepository;
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        departmentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    @PostMapping
    public Department createDepartment(@RequestBody Department department) {
        return departmentRepository.save(department);
    }
}