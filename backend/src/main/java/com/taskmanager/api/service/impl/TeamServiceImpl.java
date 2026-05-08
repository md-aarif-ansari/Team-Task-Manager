
package com.taskmanager.api.service.impl;

import com.taskmanager.api.entity.Team;
import com.taskmanager.api.entity.User;
import com.taskmanager.api.repository.TeamRepository;
import com.taskmanager.api.repository.UserRepository;
import com.taskmanager.api.service.TeamService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

import com.taskmanager.api.dto.TeamDto;
import com.taskmanager.api.dto.UserDto;
import com.taskmanager.api.mapper.TeamMapper;
import com.taskmanager.api.mapper.UserMapper;
import java.util.ArrayList;

/**
 * Implementation of {@link com.taskmanager.api.service.TeamService}.
 * Manages team lifecycle, membership and basic team queries. Methods
 * perform authorization checks based on the acting username.
 */
@Service
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final TeamMapper teamMapper;
    private final UserMapper userMapper;

    @Autowired
    public TeamServiceImpl(TeamRepository teamRepository, UserRepository userRepository, TeamMapper teamMapper, UserMapper userMapper) {
        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
        this.teamMapper = teamMapper;
        this.userMapper = userMapper;
    }

    @Override
    @Transactional
    public Team createTeam(Team team) {
        // Ensure admin and members reference managed User entities to avoid accidental inserts
        if (team.getAdmin() != null && team.getAdmin().getId() != null) {
            User managedAdmin = userRepository.findById(team.getAdmin().getId())
                    .orElseThrow(() -> new NoSuchElementException("User not found"));
            team.setAdmin(managedAdmin);
            team.getMembers().clear();
            team.getMembers().add(managedAdmin);
        }
        return teamRepository.save(team);
    }

    @Override
    @Transactional
    public Team addMember(Long teamId, Long userId, String username) {
        Team team = teamRepository.findById(teamId).orElseThrow(() -> new NoSuchElementException("Team not found"));
        User actingUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("User not found"));
        // Only team admin can add members
        if (team.getAdmin() == null || !team.getAdmin().getId().equals(actingUser.getId())) {
            throw new AccessDeniedException("Only team admin can add members");
        }
        User user = userRepository.findById(userId).orElseThrow(() -> new NoSuchElementException("User not found"));
        team.getMembers().add(user);
        return teamRepository.save(team);
    }

    @Override
    public List<Team> listTeamsForUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new NoSuchElementException("User not found"));
        return teamRepository.findAll().stream().filter(t -> t.getMembers().contains(user)).toList();
    }
     @Override
    public User findUserByUsername(String username) {
        return userRepository.findByUsername(username).orElseThrow(() -> new NoSuchElementException("User not found"));
    }

    @Override
    @Transactional
    public Team updateTeam(Long teamId, TeamDto dto, String username) {
        Team team = teamRepository.findById(teamId).orElseThrow(() -> new NoSuchElementException("Team not found"));
        User user = userRepository.findByUsername(username).orElseThrow(() -> new NoSuchElementException("User not found"));
        if (!team.getAdmin().getId().equals(user.getId())) {
            throw new AccessDeniedException("Only admin can update the team");
        }
        if (dto.getName() != null) team.setName(dto.getName());
        if (dto.getDescription() != null) team.setDescription(dto.getDescription());
        return teamRepository.save(team);
    }

    @Override
    @Transactional
    public void deleteTeam(Long teamId, String username) {
        Team team = teamRepository.findById(teamId).orElseThrow(() -> new NoSuchElementException("Team not found"));
        User user = userRepository.findByUsername(username).orElseThrow(() -> new NoSuchElementException("User not found"));
        if (!team.getAdmin().getId().equals(user.getId())) {
            throw new AccessDeniedException("Only admin can delete the team");
        }
        teamRepository.delete(team);
    }

    @Override
    @Transactional
    public Team removeMember(Long teamId, Long userId, String username) {
        Team team = teamRepository.findById(teamId).orElseThrow(() -> new NoSuchElementException("Team not found"));
        User actingUser = userRepository.findByUsername(username).orElseThrow(() -> new NoSuchElementException("User not found"));
        User userToRemove = userRepository.findById(userId).orElseThrow(() -> new NoSuchElementException("User to remove not found"));
        boolean isAdmin = team.getAdmin().getId().equals(actingUser.getId());
        boolean isSelf = actingUser.getId().equals(userToRemove.getId());
        if (!isAdmin && !isSelf) {
            throw new AccessDeniedException("Only admin or the user themselves can remove a member");
        }
        if (team.getAdmin().getId().equals(userToRemove.getId())) {
            throw new IllegalArgumentException("Admin cannot be removed from the team");
        }
        team.getMembers().remove(userToRemove);
        return teamRepository.save(team);
    }

    @Override
    public List<User> listMembers(Long teamId) {
        Team team = teamRepository.findById(teamId).orElseThrow(() -> new NoSuchElementException("Team not found"));
        return new ArrayList<>(team.getMembers());
    }

    @Override
    public UserDto toUserDto(User user) {
        return userMapper.toDto(user);
    }

}
