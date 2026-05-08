package com.taskmanager.api.service.impl;

import com.taskmanager.api.entity.Task;
import com.taskmanager.api.entity.Team;
import com.taskmanager.api.entity.User;
import com.taskmanager.api.entity.Priority;
import com.taskmanager.api.entity.Status;
import com.taskmanager.api.repository.TaskRepository;
import com.taskmanager.api.repository.TeamRepository;
import com.taskmanager.api.repository.UserRepository;
import com.taskmanager.api.service.TaskService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implementation of {@link com.taskmanager.api.service.TaskService}.
 * Contains task-related business logic and enforces permission checks
 * for operations such as update, assign, unassign and status changes.
 */
@Service
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;

    public TaskServiceImpl(TaskRepository taskRepository, TeamRepository teamRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
    }
    @Override
    @Transactional
    public Task updateTask(Long id, com.taskmanager.api.dto.TaskDto dto, String username) {
        Task task = taskRepository.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        boolean isCreator = task.getCreator() != null && user.getId().equals(task.getCreator().getId());
        boolean isAdmin = task.getTeam() != null && task.getTeam().getAdmin() != null && user.getId().equals(task.getTeam().getAdmin().getId());
        boolean isAssignee = task.getAssignees() != null && task.getAssignees().stream().anyMatch(u -> u.getId().equals(user.getId()));
        if (!(isCreator || isAdmin || isAssignee)) {
            throw new RuntimeException("You do not have permission to update this task");
        }
        if (dto.getTitle() != null) task.setTitle(dto.getTitle());
        if (dto.getDescription() != null) task.setDescription(dto.getDescription());
        if (dto.getDueDate() != null) task.setDueDate(dto.getDueDate());
        if (dto.getPriority() != null) task.setPriority(Priority.valueOf(dto.getPriority()));
        if (dto.getStatus() != null) task.setStatus(Status.valueOf(dto.getStatus()));
        if (dto.getAssignees() != null) {
            task.getAssignees().clear();
            for (com.taskmanager.api.dto.UserDto userDto : dto.getAssignees()) {
                if (userDto.getId() != null) {
                    User assignee = userRepository.findById(userDto.getId()).orElse(null);
                    if (assignee != null) task.getAssignees().add(assignee);
                }
            }
        }
        return taskRepository.save(task);
    }

    @Override
    @Transactional
    public Task createTask(Task task) {
        if (task.getTeam() != null && task.getTeam().getId() != null) {
            Long teamId = task.getTeam().getId();
            Team team = teamRepository.findById(teamId)
                    .orElseThrow(() -> new DataIntegrityViolationException("Team does not exist: " + teamId));
            task.setTeam(team);
        }
        return taskRepository.save(task);
    }

    @Override
    public Task findById(Long id) {
        return taskRepository.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));
    }

    @Override
    public List<Task> listTasksByTeam(Long teamId) {
        Team team = teamRepository.findById(teamId).orElseThrow(() -> new RuntimeException("Team not found"));
        return taskRepository.findAll().stream().filter(t -> t.getTeam() != null && t.getTeam().getId().equals(team.getId())).toList();
    }
     @Override
    @Transactional
    public void deleteTask(Long id, String username) {
        Task task = taskRepository.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        boolean isCreator = task.getCreator() != null && user.getId().equals(task.getCreator().getId());
        boolean isAdmin = task.getTeam() != null && task.getTeam().getAdmin() != null && user.getId().equals(task.getTeam().getAdmin().getId());
        if (!(isCreator || isAdmin)) {
            throw new RuntimeException("You do not have permission to delete this task");
        }
        taskRepository.delete(task);
    }

    @Override
    public List<Task> listTasksByUser(Long userId) {
        return taskRepository.findAll().stream()
                .filter(t -> t.getAssignees() != null && t.getAssignees().stream().anyMatch(u -> u.getId().equals(userId)))
                .toList();
    }
    @Override
    @Transactional
    public Task assignUserToTask(Long taskId, Long userId, String username) {
        Task task = taskRepository.findById(taskId).orElseThrow(() -> new RuntimeException("Task not found"));
        User actingUser = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        User userToAssign = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User to assign not found"));
        boolean isAdmin = task.getTeam() != null && task.getTeam().getAdmin() != null && actingUser.getId().equals(task.getTeam().getAdmin().getId());
        boolean isCreator = task.getCreator() != null && actingUser.getId().equals(task.getCreator().getId());
        if (!(isAdmin || isCreator)) {
            throw new RuntimeException("Only admin or creator can assign users");
        }
        task.getAssignees().add(userToAssign);
        return taskRepository.save(task);
    }

    @Override
    @Transactional
    public Task unassignUserFromTask(Long taskId, Long userId, String username) {
        Task task = taskRepository.findById(taskId).orElseThrow(() -> new RuntimeException("Task not found"));
        User actingUser = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        User userToUnassign = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User to unassign not found"));
        boolean isAdmin = task.getTeam() != null && task.getTeam().getAdmin() != null && actingUser.getId().equals(task.getTeam().getAdmin().getId());
        boolean isCreator = task.getCreator() != null && actingUser.getId().equals(task.getCreator().getId());
        boolean isSelf = actingUser.getId().equals(userToUnassign.getId());
        if (!(isAdmin || isCreator || isSelf)) {
            throw new RuntimeException("Only admin, creator, or the user themselves can unassign");
        }
        task.getAssignees().remove(userToUnassign);
        return taskRepository.save(task);
    }

    @Override
    @Transactional
    public Task changeTaskStatus(Long taskId, String status, String username) {
        Task task = taskRepository.findById(taskId).orElseThrow(() -> new RuntimeException("Task not found"));
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        boolean isCreator = task.getCreator() != null && user.getId().equals(task.getCreator().getId());
        boolean isAdmin = task.getTeam() != null && task.getTeam().getAdmin() != null && user.getId().equals(task.getTeam().getAdmin().getId());
        boolean isAssignee = task.getAssignees() != null && task.getAssignees().stream().anyMatch(u -> u.getId().equals(user.getId()));
        if (!(isCreator || isAdmin || isAssignee)) {
            throw new RuntimeException("You do not have permission to change the status of this task");
        }
        task.setStatus(Status.valueOf(status));
        return taskRepository.save(task);
    }
}
