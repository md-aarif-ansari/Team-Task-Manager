package com.taskmanager.api.service;

import com.taskmanager.api.dto.ProfileDto;
import com.taskmanager.api.entity.User;

import java.util.Optional;

/**
 * Service interface for user management operations like creating users,
 * updating profiles and retrieving users.
 */
public interface UserService {
    /** Create a new user and persist it (password should be raw, implementation hashes it). */
    User createUser(User user, String rawPassword);
    /** Find a user by id. */
    Optional<User> findById(Long id);
    /** Find a user by username. */
    Optional<User> findByUsername(String username);
    /** Update a user's profile fields (display name, email). */
    User updateProfile(Long userId, ProfileDto profileDto);
    /** Update user account fields (username, password, etc.). */
    User updateUser(Long userId, com.taskmanager.api.dto.UserUpdateDto userDto);
    /** Delete a user by id. */
    void deleteUser(Long userId);
}
