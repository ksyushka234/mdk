package ru.studyplanner.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.studyplanner.backend.entity.Department;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    // Можно добавить методы поиска, если нужно
}