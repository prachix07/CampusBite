package com.campusbite.controller;

import com.campusbite.dto.auth.AuthResponse;
import com.campusbite.dto.auth.LoginRequest;
import com.campusbite.dto.auth.RegisterRequest;
import com.campusbite.dto.auth.UserSummaryDto;
import com.campusbite.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AuthController
 * 
 * Exposes authentication endpoints for students and canteen administrators.
 * Delegates all registration and verification logic to AuthService.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * POST /api/auth/register
     * Register a new student account.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.registerStudent(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * POST /api/auth/login
     * Authenticate student or canteen administrator with email and password.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/auth/profile/{userId}
     * Retrieve user profile information (without password).
     */
    @GetMapping("/profile/{userId}")
    public ResponseEntity<UserSummaryDto> getProfile(@PathVariable Long userId) {
        UserSummaryDto profile = authService.getUserProfile(userId);
        return ResponseEntity.ok(profile);
    }
}
