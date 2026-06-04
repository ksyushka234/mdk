package ru.studyplanner.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "employees")
public class Employee {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne(fetch = FetchType.EAGER)
    @MapsId
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User user;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "position")
    private String position;

    //  ДОБАВЛЕННОЕ ПОЛЕ ДЛЯ ОТДЕЛА
    @Column(name = "department_id")
    private Long departmentId;

    // Связь с отделом
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Department department;
}