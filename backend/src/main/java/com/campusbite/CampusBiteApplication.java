package com.campusbite;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * CampusBiteApplication
 * 
 * Entry point for the CampusBite Spring Boot backend application.
 * Starts the embedded Tomcat server, discovers Spring components,
 * sets up JPA entity scanning, and prepares REST API routes.
 */
@SpringBootApplication
@EnableTransactionManagement
public class CampusBiteApplication {

    public static void main(String[] args) {
        SpringApplication.run(CampusBiteApplication.class, args);
    }
}
