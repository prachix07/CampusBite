package com.campusbite.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * HealthCheckController
 * 
 * Provides a simple REST endpoint to verify that the Spring Boot server
 * is running and able to receive incoming requests from the React frontend.
 * 
 * Route: GET /api/health
 */
@RestController
@RequestMapping("/api")
public class HealthCheckController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "CampusBite Spring Boot Backend");
        response.put("version", "1.0.0");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("message", "REST API connection between React and Spring Boot is working successfully!");
        
        return ResponseEntity.ok(response);
    }
}
