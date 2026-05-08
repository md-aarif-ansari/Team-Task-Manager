package com.taskmanager.api.mapper;

import com.taskmanager.api.dto.TeamDto;
import com.taskmanager.api.entity.Team;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class TeamMapper {

    private final UserMapper userMapper;

    public TeamMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public TeamDto toDto(Team t) {
        if (t == null) return null;
        TeamDto dto = new TeamDto();
        dto.setId(t.getId());
        dto.setName(t.getName());
        dto.setDescription(t.getDescription());
        dto.setCreatedAt(t.getCreatedAt());
        if (t.getMembers() != null) dto.setMembers(t.getMembers().stream().map(userMapper::toDto).collect(Collectors.toList()));
        if (t.getAdmin() != null) dto.setAdmin(userMapper.toDto(t.getAdmin()));
        return dto;
    }

    /**
     * Convert a Team entity to `TeamDto`, mapping members and admin using `UserMapper`.
     */
}
