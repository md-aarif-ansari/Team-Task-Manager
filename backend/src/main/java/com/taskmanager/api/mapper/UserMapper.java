package com.taskmanager.api.mapper;

import com.taskmanager.api.dto.UserDto;
import com.taskmanager.api.entity.User;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class UserMapper {

    public UserDto toDto(User u) {
        if (u == null) return null;
        UserDto dto = new UserDto();
        dto.setId(u.getId());
        dto.setUsername(u.getUsername());
        dto.setEmail(u.getEmail());
        dto.setDisplayName(u.getDisplayName());
        dto.setCreatedAt(u.getCreatedAt());
        if (u.getRoles() != null) dto.setRoles(u.getRoles().stream().map(r -> r.getName()).collect(Collectors.toSet()));
        return dto;
    }

    /**
     * Convert a User entity to `UserDto`. Safely handles null entities.
     */
}
