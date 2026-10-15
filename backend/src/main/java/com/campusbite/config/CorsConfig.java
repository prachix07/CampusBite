package com.campusbite.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

/**
 * CorsConfig
 * 
 * Enables Cross-Origin Resource Sharing (CORS) so that our React frontend
 * (running on http://localhost:3000 or http://localhost:5173) can communicate
 * with this Spring Boot backend (running on http://localhost:8080) without
 * being blocked by browser security restrictions.
 */
@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins:http://localhost:3000,http://localhost:5173}")
    private String allowedOrigins;

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        // Split comma-separated origins from application.yml
        List<String> origins = Arrays.asList(allowedOrigins.split(","));
        config.setAllowedOrigins(origins);
        
        // Allow cookies and Authorization headers
        config.setAllowCredentials(true);
        
        // Allow standard REST HTTP methods
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        
        // Allow common headers including Authorization and Content-Type
        config.setAllowedHeaders(Arrays.asList(
                "Origin", 
                "Content-Type", 
                "Accept", 
                "Authorization", 
                "X-Requested-With",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers"
        ));
        
        // Expose Authorization header so frontend can read JWT tokens
        config.setExposedHeaders(Arrays.asList("Authorization", "Content-Disposition"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        
        return new CorsFilter(source);
    }
}
