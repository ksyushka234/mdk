package ru.studyplanner.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import ru.studyplanner.backend.dto.ActivityLogCreateRequest;
import ru.studyplanner.backend.entity.ActivityLog;
import ru.studyplanner.backend.entity.User;
import ru.studyplanner.backend.repository.ActivityLogRepository;
import ru.studyplanner.backend.repository.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/api/activity-log")
@RequiredArgsConstructor
public class ActivityLogController {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    @GetMapping
    public List<ActivityLog> list(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String eventType
    ) {
        if (userId != null) return activityLogRepository.findByUser_Id(userId);
        if (eventType != null) return activityLogRepository.findByEventType(eventType);
        return activityLogRepository.findAll();
    }

    @GetMapping("/{id}")
    public ActivityLog get(@PathVariable Long id) {
        return activityLogRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Log record not found"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ActivityLog create(@Valid @RequestBody ActivityLogCreateRequest req) {
        User user = userRepository.findById(req.userId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        ActivityLog log = new ActivityLog();
        log.setUser(user);
        log.setEventType(req.eventType());
        // Сохраняем любую дополнительную информацию (например, ID задачи) в поле details
        log.setDetails(req.details());

        return activityLogRepository.save(log);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!activityLogRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Log record not found");
        }
        activityLogRepository.deleteById(id);
    }
}