package com.campusbite.service;

import com.campusbite.dto.auth.AuthResponse;
import com.campusbite.dto.auth.LoginRequest;
import com.campusbite.dto.auth.RegisterRequest;
import com.campusbite.dto.auth.UserSummaryDto;
import com.campusbite.entity.Role;
import com.campusbite.entity.User;
import com.campusbite.exception.BadRequestException;
import com.campusbite.exception.ResourceNotFoundException;
import com.campusbite.repository.UserRepository;
import com.campusbite.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * AuthService
 * 
 * Contains business logic for user authentication:
 * - Student registration with email uniqueness validation
 * - Secure BCrypt password hashing
 * - Student & Canteen Admin login authentication
 * - Generation of signed HMAC-SHA256 JWT tokens
 */
@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository, 
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    /**
     * Register a new student account
     */
    public AuthResponse registerStudent(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        // 1. Verify email uniqueness
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new BadRequestException("An account with email '" + normalizedEmail + "' is already registered.");
        }

        // 2. Hash password securely using BCrypt (NEVER plain text)
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        // 3. Create and persist User entity with ROLE_STUDENT
        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(normalizedEmail);
        user.setPassword(hashedPassword);
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        user.setRole(Role.ROLE_STUDENT);

        User savedUser = userRepository.save(user);

        // 4. Generate signed cryptographic JWT token
        String token = tokenProvider.generateToken(
                savedUser.getId(), 
                savedUser.getEmail(), 
                savedUser.getRole().name()
        );

        return new AuthResponse(
                token,
                UserSummaryDto.fromEntity(savedUser),
                "Student account registered successfully"
        );
    }

    /**
     * Authenticate student or canteen administrator
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        // 1. Fetch user by email
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new BadRequestException("Invalid email or password."));

        // 2. Verify password hash using BCrypt
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            // Consistent generic error prevents account enumeration attacks
            throw new BadRequestException("Invalid email or password.");
        }

        // 3. Generate signed cryptographic JWT token
        String token = tokenProvider.generateToken(
                user.getId(), 
                user.getEmail(), 
                user.getRole().name()
        );

        String welcomeMsg = user.getRole() == Role.ROLE_ADMIN
                ? "Welcome back, Canteen Administrator"
                : "Welcome back, " + user.getFullName();

        return new AuthResponse(
                token,
                UserSummaryDto.fromEntity(user),
                welcomeMsg
        );
    }

    /**
     * Fetch user profile by ID
     */
    @Transactional(readOnly = true)
    public UserSummaryDto getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return UserSummaryDto.fromEntity(user);
    }
}
