package com.campusbite.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * PasswordEncoderConfig
 * 
 * Provides the BCryptPasswordEncoder bean used across the application.
 * BCrypt uses a one-way mathematical hash function with a random salt
 * to ensure that plain-text passwords can NEVER be retrieved, even if
 * the database is accessed.
 */
@Configuration
public class PasswordEncoderConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Standard strength 10 (1024 hashing rounds)
        return new BCryptPasswordEncoder();
    }
}
