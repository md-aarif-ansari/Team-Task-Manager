package com.taskmanager.api.service.impl;

import com.taskmanager.api.dto.ProfileDto;
import com.taskmanager.api.entity.User;
import com.taskmanager.api.repository.RoleRepository;
import com.taskmanager.api.repository.UserRepository;
import com.taskmanager.api.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;

/**
 * Implementation of {@link com.taskmanager.api.service.UserService}.
 * Responsible for creating users (password hashing), profile updates
 * and basic user retrieval operations.
 */
@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public User createUser(User user, String rawPassword) {
        user.setPassword(passwordEncoder.encode(rawPassword));
        // assign ROLE_USER by default if present
        roleRepository.findByName("ROLE_USER").ifPresent(role -> user.setRoles(new HashSet<>() {{ add(role); }}));
        return userRepository.save(user);
    }

    @Override
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    @Transactional
    public User updateProfile(Long userId, ProfileDto profileDto) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setDisplayName(profileDto.getDisplayName());
        user.setEmail(profileDto.getEmail());
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User updateUser(Long userId, com.taskmanager.api.dto.UserUpdateDto userDto) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        if (userDto.getUsername() != null && !userDto.getUsername().isBlank()) {
            user.setUsername(userDto.getUsername());
        }
        if (userDto.getDisplayName() != null) {
            user.setDisplayName(userDto.getDisplayName());
        }
        if (userDto.getEmail() != null) {
            user.setEmail(userDto.getEmail());
        }
        if (userDto.getPassword() != null && !userDto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        }
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
    }
}
