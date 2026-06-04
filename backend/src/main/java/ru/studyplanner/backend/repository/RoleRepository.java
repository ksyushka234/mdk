package ru.studyplanner.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.studyplanner.backend.entity.Role;

public interface RoleRepository extends JpaRepository<Role, String> {
}