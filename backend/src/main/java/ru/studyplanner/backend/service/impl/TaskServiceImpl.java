package ru.studyplanner.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.studyplanner.backend.entity.Task;
import ru.studyplanner.backend.entity.Employee;
import ru.studyplanner.backend.repository.TaskRepository;
import ru.studyplanner.backend.repository.EmployeeRepository;
import ru.studyplanner.backend.dto.TaskCreateRequest;
import ru.studyplanner.backend.dto.TaskStatsDto; // <-- ДОБАВЛЕН ИМПОРТ DTO
import ru.studyplanner.backend.service.TaskService;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    public Task updateTask(Long id, Task taskDetails) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Задача не найдена с ID: " + id));

        task.setTitle(taskDetails.getTitle());
        task.setDescription(taskDetails.getDescription());
        task.setDeadlineAt(taskDetails.getDeadlineAt());
        task.setStartDateAt(taskDetails.getStartDateAt());

        task.setStatus(taskDetails.getStatus());
        task.setPriority(taskDetails.getPriority());

        return taskRepository.save(task);
    }

    @Override
    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Задача не найдена с ID: " + id));

        taskRepository.delete(task);
    }

    @Override
    public List<Task> getTasksByEmployee(Long userId) {
        return taskRepository.findByAssignee_UserId(userId);
    }

    @Override
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    @Override
    @Transactional
    public Task createTask(TaskCreateRequest request) {
        Employee assignee = employeeRepository.findByUserId(request.getAssigneeUserId())
                .orElseThrow(() -> new RuntimeException("Сотрудник не найден"));

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDeadlineAt(request.getDeadlineAt());
        task.setPriority(request.getPriority());

        task.setStartDateAt(request.getStartDateAt());

        task.setStatus("TODO");
        task.setProgressPercent(0);
        task.setAssignee(assignee);

        return taskRepository.save(task);
    }

    @Override
    @Transactional
    public Task updateTaskStatus(Long taskId, String status, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Задача не найдена"));

        if (!task.getAssignee().getUserId().equals(userId)) {
            throw new RuntimeException("Нет прав на изменение этой задачи");
        }

        task.setStatus(status);
        if ("DONE".equals(status)) {
            task.setCompletedAt(LocalDateTime.now());
            task.setProgressPercent(100);
        }

        return taskRepository.save(task);
    }


    @Override
    public TaskStatsDto getStats() {
        List<Task> allTasks = taskRepository.findAll();

        long total = allTasks.size();
        long done = allTasks.stream().filter(t -> "DONE".equals(t.getStatus())).count();
        long inProgress = allTasks.stream().filter(t -> "IN_PROGRESS".equals(t.getStatus())).count();
        long todo = allTasks.stream().filter(t -> "TODO".equals(t.getStatus())).count();

        LocalDateTime now = LocalDateTime.now();
        long overdue = allTasks.stream()
                .filter(t -> t.getDeadlineAt() != null
                        && t.getDeadlineAt().isBefore(now)
                        && !"DONE".equals(t.getStatus()))
                .count();

        int percentDone = total > 0 ? (int) Math.round((done * 100.0) / total) : 0;

        return TaskStatsDto.builder()
                .total(total)
                .done(done)
                .inProgress(inProgress)
                .todo(todo)
                .overdue(overdue)
                .percentDone(percentDone)
                .build();
    }
}