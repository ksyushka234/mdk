package ru.studyplanner.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.studyplanner.backend.entity.Task;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    // Находим все задачи конкретного сотрудника (исполнителя)
    List<Task> findByAssignee_UserId(Long userId);

    // Если нужно, можно добавить поиск по автору (руководителю)
    List<Task> findByAuthor_UserId(Long userId);
}