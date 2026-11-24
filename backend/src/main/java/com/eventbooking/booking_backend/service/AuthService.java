package com.eventbooking.booking_backend.service;

import com.eventbooking.booking_backend.config.JwtService;
import com.eventbooking.booking_backend.dto.AuthResponse;
import com.eventbooking.booking_backend.dto.LoginRequest;
import com.eventbooking.booking_backend.dto.RegisterRequest;
import com.eventbooking.booking_backend.entity.AppUser;
import com.eventbooking.booking_backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    public AuthResponse register(RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (users.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }
        AppUser u = new AppUser();
        u.setId(UUID.randomUUID());
        u.setName(req.name());
        u.setEmail(email);
        u.setPasswordHash(encoder.encode(req.password()));
        u.setRole("CUSTOMER");
        u.setCreatedAt(LocalDateTime.now());
        users.save(u);
        return new AuthResponse(jwt.generateToken(email, u.getRole()), u.getName(), email, u.getRole());
    }

    public AuthResponse login(LoginRequest req) {
        String email = req.email().trim().toLowerCase();
        AppUser u = users.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        if (!encoder.matches(req.password(), u.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        return new AuthResponse(jwt.generateToken(email, u.getRole()), u.getName(), email, u.getRole());
    }
}