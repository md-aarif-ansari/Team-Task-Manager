package com.taskmanager.api.mapper;

import com.taskmanager.api.dto.TaskDto;
import com.taskmanager.api.entity.Task;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class TaskMapper {

    private final UserMapper userMapper;

    public TaskMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public TaskDto toDto(Task t) {
        if (t == null) return null;
        TaskDto dto = new TaskDto();
        dto.setId(t.getId());
        dto.setTitle(t.getTitle());
        dto.setDescription(t.getDescription());
        dto.setCreatedAt(t.getCreatedAt());
        dto.setDueDate(t.getDueDate());
        dto.setPriority(t.getPriority() != null ? t.getPriority().name() : null);
        dto.setStatus(t.getStatus() != null ? t.getStatus().name() : null);
        if (t.getAssignees() != null) dto.setAssignees(t.getAssignees().stream().map(userMapper::toDto).collect(Collectors.toList()));
        if (t.getTeam() != null) dto.setTeamId(t.getTeam().getId());
        return dto;
    }

    /**
     * Convert a Task entity to its DTO representation. Handles null checks
     * and maps nested user entities via `UserMapper`.
     */
}
