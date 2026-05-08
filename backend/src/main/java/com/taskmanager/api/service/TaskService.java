package com.taskmanager.api.service;

import com.taskmanager.api.entity.Task;

import java.util.List;

/**
 * Service interface providing task-related operations.
 * Implementations handle business rules and permission checks for creating,
 * updating, assigning and listing tasks.
 */
public interface TaskService {
    /** Create and persist a new task. */
    Task createTask(Task task);
    /** Find a task by its id or throw if not found. */
    Task findById(Long id);
    /** List tasks associated with a specific team. */
    List<Task> listTasksByTeam(Long teamId);
    /** List tasks assigned to a specific user. */
    List<Task> listTasksByUser(Long userId);
    /** Update a task by id using provided DTO and acting username for permission checks. */
    Task updateTask(Long id, com.taskmanager.api.dto.TaskDto dto, String username);
    /** Delete a task by id, acting username is used for authorization. */
    void deleteTask(Long id, String username);
    /** Assign a user to a task; acting username is used for authorization. */
    Task assignUserToTask(Long taskId, Long userId, String username);
    /** Unassign a user from a task; acting username is used for authorization. */
    Task unassignUserFromTask(Long taskId, Long userId, String username);
    /** Change the status of a task; acting username is used for authorization. */
    Task changeTaskStatus(Long taskId, String status, String username);
}
