package ru.studyplanner.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "activity_log")
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id") // Ссылка на пользователя, который совершил действие
    private User user;

    @Column(name = "event_type", nullable = false)
    private String eventType; // Например: "TASK_CREATED", "LOGIN", "STATUS_CHANGED"

    @Column(name = "event_time", nullable = false)
    private LocalDateTime eventTime;

    @Column(name = "details", columnDefinition = "jsonb")
    private String details; // Дополнительная информация в формате JSON

    @PrePersist
    void onCreate() {
        if (eventTime == null) eventTime = LocalDateTime.now();
    }
}