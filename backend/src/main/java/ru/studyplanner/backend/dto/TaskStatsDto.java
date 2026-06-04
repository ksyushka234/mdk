package ru.studyplanner.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskStatsDto {
    private Long total;
    private Long done;
    private Long inProgress;
    private Long todo;
    private Long overdue;
    private Integer percentDone;
}