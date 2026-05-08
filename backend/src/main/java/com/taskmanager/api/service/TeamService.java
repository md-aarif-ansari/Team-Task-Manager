package com.taskmanager.api.service;

import com.taskmanager.api.entity.Team;

import java.util.List;

/**
 * Service interface for team-related operations.
 * Handles creation, membership management and basic team queries.
 */
public interface TeamService {
    /** Create and persist a new team. */
    Team createTeam(Team team);
    /** Add a member to a team; acting username used for authorization. */
    Team addMember(Long teamId, Long userId, String username);
    /** List all teams a user belongs to. */
    List<Team> listTeamsForUser(Long userId);
    /** Find a user entity by username (helper used by controllers). */
    com.taskmanager.api.entity.User findUserByUsername(String username);

    /** Update team metadata (name/description); acting username used for authorization. */
    Team updateTeam(Long teamId, com.taskmanager.api.dto.TeamDto dto, String username);
    /** Delete a team; acting username used for authorization. */
    void deleteTeam(Long teamId, String username);
    /** Remove a member from a team; acting username used for authorization. */
    Team removeMember(Long teamId, Long userId, String username);
    /** List members of a team. */
    List<com.taskmanager.api.entity.User> listMembers(Long teamId);
    /** Convert a User entity to UserDto. */
    com.taskmanager.api.dto.UserDto toUserDto(com.taskmanager.api.entity.User user);
}
