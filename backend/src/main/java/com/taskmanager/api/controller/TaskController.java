    package com.taskmanager.api.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taskmanager.api.dto.TaskCreateDto;
import com.taskmanager.api.dto.TaskDto;
import com.taskmanager.api.entity.Task;
import com.taskmanager.api.entity.User;
import com.taskmanager.api.mapper.TaskMapper;
import com.taskmanager.api.repository.UserRepository;
import com.taskmanager.api.service.TaskService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

/**
 * Controller exposing task management endpoints.
 * Supports creation, retrieval and listing of tasks by team.
 */
@RestController
@RequestMapping("/api/tasks")
@Tag(name = "Tasks", description = "Endpoints for task management.")
public class TaskController {

    /**
     * REST endpoints for creating, updating, deleting and listing tasks.
     * Authorization is enforced at the controller level; detailed permission
     * checks are implemented in the service layer.
     */

    private final TaskService taskService;
    private final UserRepository userRepository;
    private final TaskMapper taskMapper;

    public TaskController(TaskService taskService, UserRepository userRepository, TaskMapper taskMapper) {
        this.taskService = taskService;
        this.userRepository = userRepository;
        this.taskMapper = taskMapper;
    }

    /**
     * Create a new task from the provided `TaskCreateDto`.
     */
    @Operation(summary = "Create task", description = "Create a new task from the provided TaskCreateDto.")
    @PostMapping
    //@PreAuthorize("hasRole('USER')")
    public ResponseEntity<TaskDto> createTask(@Valid @RequestBody TaskCreateDto createDto) {
        Task task = new Task();
        task.setTitle(createDto.getTitle());
        task.setDescription(createDto.getDescription());
        task.setDueDate(createDto.getDueDate());
        task.setPriority(createDto.getPriority() != null ? com.taskmanager.api.entity.Priority.valueOf(createDto.getPriority()) : null);
        if (createDto.getTeamId() != null) {
            com.taskmanager.api.entity.Team t = new com.taskmanager.api.entity.Team();
            t.setId(createDto.getTeamId());
            task.setTeam(t);
        }
        if (createDto.getAssigneeIds() != null) {
            for (Long id : createDto.getAssigneeIds()) {
                User u = userRepository.findById(id).orElse(null);
                if (u != null) task.getAssignees().add(u);
            }
        }
        Task created = taskService.createTask(task);
        return ResponseEntity.ok(taskMapper.toDto(created));
    }

    /**
     * Retrieve a task by its id.
     */
    @Operation(summary = "Get task by ID", description = "Retrieve a task by its ID.")
    @GetMapping("/{id}")
    //@PreAuthorize("hasRole('USER')")
    public ResponseEntity<TaskDto> getTask(@PathVariable Long id) {
        Task t = taskService.findById(id);
        return ResponseEntity.ok(taskMapper.toDto(t));
    }

    /**
     * List tasks for a given team id.
     */
    @Operation(summary = "List tasks by team", description = "List all tasks for a given team ID.")
    @GetMapping("/team/{teamId}")
   // @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<TaskDto>> listByTeam(@PathVariable Long teamId) {
        List<Task> tasks = taskService.listTasksByTeam(teamId);
        List<TaskDto> dtos = tasks.stream().map(taskMapper::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
     /**
     * Update a task by its id.
     */
    @Operation(summary = "Update task", description = "Update a task by its ID. Only creator, team admin, or assignee can update.")
    @PatchMapping("/{id}")
   // @PreAuthorize("hasRole('USER')")
    public ResponseEntity<TaskDto> updateTask(@PathVariable Long id, @Valid @RequestBody TaskDto dto) {
        // Extract username from security context
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        Task updated = taskService.updateTask(id, dto, username);
        return ResponseEntity.ok(taskMapper.toDto(updated));
    }

    /**
     * Delete a task by its id.
     */
    @Operation(summary = "Delete task", description = "Delete a task by its ID. Only creator or team admin can delete.")
    @DeleteMapping("/{id}")
    //@PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        taskService.deleteTask(id, username);
        return ResponseEntity.noContent().build();
    }
    /**
     * List tasks assigned to a specific user.
     */
    @Operation(summary = "List tasks for user", description = "List all tasks assigned to a specific user.")
    @GetMapping("/user/{userId}")
    //@PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<TaskDto>> listByUser(@PathVariable Long userId) {
        List<Task> tasks = taskService.listTasksByUser(userId);
        List<TaskDto> dtos = tasks.stream().map(taskMapper::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Assign a user to a task.
     */
    @Operation(summary = "Assign user to task", description = "Assign a user to a task. Only admin or creator can assign.")
    @PostMapping("/{taskId}/assignees/{userId}")
    //@PreAuthorize("hasRole('USER')")
    public ResponseEntity<TaskDto> assignUserToTask(@PathVariable Long taskId, @PathVariable Long userId) {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        Task updated = taskService.assignUserToTask(taskId, userId, username);
        return ResponseEntity.ok(taskMapper.toDto(updated));
    }

    /**
     * Unassign a user from a task.
     */
    @Operation(summary = "Unassign user from task", description = "Unassign a user from a task. Only admin, creator, or the user themselves can unassign.")
    @DeleteMapping("/{taskId}/assignees/{userId}")
    //@PreAuthorize("hasRole('USER')")
    public ResponseEntity<TaskDto> unassignUserFromTask(@PathVariable Long taskId, @PathVariable Long userId) {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        Task updated = taskService.unassignUserFromTask(taskId, userId, username);
        return ResponseEntity.ok(taskMapper.toDto(updated));
    }

    /**
     * Change the status of a task.
     */
    @Operation(summary = "Change task status", description = "Change the status of a task. Only creator, admin, or assignee can change.")
    @PatchMapping("/{taskId}/status")
    //@PreAuthorize("hasRole('USER')")
    public ResponseEntity<TaskDto> changeTaskStatus(@PathVariable Long taskId, @RequestBody StatusChangeRequest statusChangeRequest) {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        Task updated = taskService.changeTaskStatus(taskId, statusChangeRequest.getStatus(), username);
        return ResponseEntity.ok(taskMapper.toDto(updated));
    }

    public static class StatusChangeRequest {
        private String status;
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}
