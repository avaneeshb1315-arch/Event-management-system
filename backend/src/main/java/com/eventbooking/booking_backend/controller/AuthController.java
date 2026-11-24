package com.eventbooking.booking_backend.controller;

import com.eventbooking.booking_backend.dto.AuthResponse;
import com.eventbooking.booking_backend.dto.LoginRequest;
import com.eventbooking.booking_backend.dto.RegisterRequest;
import com.eventbooking.booking_backend.entity.AppUser;
import com.eventbooking.booking_backend.repository.UserRepository;
import com.eventbooking.booking_backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final AuthService authService;
    private final UserRepository users;

    public AuthController(AuthService authService, UserRepository users) {
        this.authService = authService;
        this.users = users;
    }

    @PostMapping("/auth/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        return authService.register(req);
    }

    @PostMapping("/auth/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @GetMapping("/me")
    public Map<String, Object> me(Authentication authentication) {
        AppUser u = users.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        return Map.of("id", u.getId(), "name", u.getName(), "email", u.getEmail(), "role", u.getRole());
    }
}