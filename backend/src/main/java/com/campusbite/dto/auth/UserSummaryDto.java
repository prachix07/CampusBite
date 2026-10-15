package com.campusbite.dto.auth;

import com.campusbite.entity.Role;
import com.campusbite.entity.User;

import java.time.LocalDateTime;

/**
 * UserSummaryDto
 * 
 * Safe representation of a User.
 * CRITICAL: NEVER exposes the password hash!
 */
public class UserSummaryDto {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private Role role;
    private LocalDateTime createdAt;

    public UserSummaryDto() {}

    public UserSummaryDto(Long id, String fullName, String email, String phone, Role role, LocalDateTime createdAt) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.createdAt = createdAt;
    }

    public static UserSummaryDto fromEntity(User user) {
        return new UserSummaryDto(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getCreatedAt()
        );
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
