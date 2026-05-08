package com.taskmanager.api.service.impl;

import com.taskmanager.api.dto.AuthRequest;
import com.taskmanager.api.dto.AuthResponse;
import com.taskmanager.api.entity.User;
import com.taskmanager.api.service.AuthService;
import com.taskmanager.api.service.UserService;
import com.taskmanager.api.security.JwtUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    /**
     * Implementation of `AuthService` responsible for authenticating users and issuing JWTs.
     */

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    public AuthServiceImpl(UserService userService, AuthenticationManager authenticationManager, JwtUtils jwtUtils) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
    }

    @Override
    public AuthResponse login(AuthRequest authRequest) {
        /**
         * Authenticate the user using `AuthenticationManager` and return a JWT token.
         *
         * @param authRequest credentials container (usernameOrEmail + password)
         * @return `AuthResponse` containing the issued token
         */
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getUsernameOrEmail(), authRequest.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String username = authentication.getName();
        String token = jwtUtils.generateToken(username);
        return new AuthResponse(token);
    }

    @Override
    public AuthResponse register(String username, String email, String password, String displayName) {
        /**
         * Create a new user record and issue a JWT token for the created user.
         *
         * @return `AuthResponse` containing the token for the newly created account
         */
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setDisplayName(displayName != null && !displayName.isBlank() ? displayName : username);
        User created = userService.createUser(user, password);
        String token = jwtUtils.generateToken(created.getUsername());
        return new AuthResponse(token);
    }
}
