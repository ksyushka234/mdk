package ru.studyplanner.backend.service;

import ru.studyplanner.backend.entity.Task;
import ru.studyplanner.backend.dto.TaskCreateRequest;
import java.util.List;

public interface TaskService {
    List<Task> getTasksByEmployee(Long userId); // Задачи сотрудника
    List<Task> getAllTasks(); // Все задачи (для админа/руководителя)
    Task createTask(TaskCreateRequest request);
    Task updateTaskStatus(Long taskId, String status, Long userId);
    Task updateTask(Long id, Task taskDetails);
    void deleteTask(Long id);
}