package ru.studyplanner.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "roles")
public class Role {

    @Id
    @Column(name = "code", length = 20)
    private String code; // STUDENT / TEACHER / ADMIN

    @Column(name = "name", nullable = false, length = 100)
    private String name;
}