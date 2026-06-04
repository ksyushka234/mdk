package ru.studyplanner.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.studyplanner.backend.entity.Manager;
import java.util.Optional;

public interface ManagerRepository extends JpaRepository<Manager, Long> {
    Optional<Manager> findByUserId(Long userId);
}