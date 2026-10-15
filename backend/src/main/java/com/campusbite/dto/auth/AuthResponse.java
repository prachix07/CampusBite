package com.campusbite.dto.auth;

/**
 * AuthResponse
 * 
 * Returned upon successful student registration or login.
 */
public class AuthResponse {

    private String token;
    private String tokenType = "Bearer";
    private UserSummaryDto user;
    private String message;

    public AuthResponse() {}

    public AuthResponse(String token, UserSummaryDto user, String message) {
        this.token = token;
        this.user = user;
        this.message = message;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public UserSummaryDto getUser() { return user; }
    public void setUser(UserSummaryDto user) { this.user = user; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
