package com.taskmanager.api.controller;

import com.taskmanager.api.dto.UserDto;
import com.taskmanager.api.entity.Role;
import com.taskmanager.api.entity.User;
/**
 * REST controller for user-related endpoints.
 * Provides profile endpoints for the currently authenticated user.
 */

import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "Endpoints for user profile and information.")
public class UserController {

    private final com.taskmanager.api.service.UserService userService;

    /**
     * Controller exposing profile endpoints for the authenticated user.
     * Supports retrieving, updating and deleting the current user's account.
     */

    public UserController(com.taskmanager.api.service.UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "Get current user profile", description = "Return the profile of the currently authenticated user.")
    @GetMapping("/me")
    @Transactional(readOnly = true)
    public ResponseEntity<UserDto> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        String username = auth.getName();
        User user = userService.findByUsername(username).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setDisplayName(user.getDisplayName());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setRoles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));
        return ResponseEntity.ok(dto);
    }
    /**
     * Delete the currently authenticated user's account.
     */
    @Operation(summary = "Delete current user", description = "Delete the currently authenticated user's account.")
    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        String username = auth.getName();
        User user = userService.findByUsername(username).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();
        userService.deleteUser(user.getId());
        return ResponseEntity.noContent().build();
    }

    /**
     * Update the currently authenticated user's profile (username, displayName, password).
     */
    @Operation(summary = "Update current user", description = "Update the currently authenticated user's profile (username, displayName, password). Any field can be omitted.")
    @PatchMapping("/me")
    public ResponseEntity<UserDto> updateCurrentUser(@Valid @RequestBody com.taskmanager.api.dto.UserUpdateDto updateDto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        String username = auth.getName();
        User user = userService.findByUsername(username).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();
        User updated = userService.updateUser(user.getId(), updateDto);
        UserDto dto = new UserDto();
        dto.setId(updated.getId());
        dto.setUsername(updated.getUsername());
        dto.setEmail(updated.getEmail());
        dto.setDisplayName(updated.getDisplayName());
        dto.setCreatedAt(updated.getCreatedAt());
        dto.setRoles(updated.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));
        return ResponseEntity.ok(dto);
    }
}
