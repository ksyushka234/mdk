package ru.studyplanner.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.studyplanner.backend.dto.TaskStatsDto;
import ru.studyplanner.backend.entity.Task;
import ru.studyplanner.backend.service.TaskService;
import ru.studyplanner.backend.dto.TaskCreateRequest;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    // Обновление задачи (PUT /api/tasks/{id})
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @RequestBody Task taskDetails) {
        Task updatedTask = taskService.updateTask(id, taskDetails);
        return ResponseEntity.ok(updatedTask);
    }

    // Удаление задачи (DELETE /api/tasks/{id})
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    // Получить задачи текущего пользователя (сотрудника)
    @GetMapping("/my-tasks")
    public List<Task> getMyTasks(@RequestParam Long userId) {
        return taskService.getTasksByEmployee(userId);
    }

    // Получить все задачи (для руководителя)
    @GetMapping
    public List<Task> getAllTasks() {
        return taskService.getAllTasks();
    }

    // Получить статистику по задачам
    @GetMapping("/stats")
    public ResponseEntity<TaskStatsDto> getStats() {
        return ResponseEntity.ok(taskService.getStats());
    }

    // Создать задачу
    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody TaskCreateRequest request) {
        Task createdTask = taskService.createTask(request);
        return ResponseEntity.ok(createdTask);
    }

    // Обновить статус
    @PutMapping("/{id}/status")
    public ResponseEntity<Task> updateStatus(@PathVariable Long id, @RequestParam String status, @RequestParam Long userId) {
        Task updatedTask = taskService.updateTaskStatus(id, status, userId);
        return ResponseEntity.ok(updatedTask);
    }
}