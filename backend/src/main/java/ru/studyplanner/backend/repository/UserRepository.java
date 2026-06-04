package ru.studyplanner.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.studyplanner.backend.entity.User;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByLogin(String login);

    // Добавь этот метод:
    Optional<User> findByLogin(String login);
}