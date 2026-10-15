package com.campusbite.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * SecurityConfig
 * 
 * Spring Security 6+ configuration class.
 * Configures stateless session management, role-based endpoint permissions,
 * and attaches the JWT authentication filter into the security chain.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationEntryPoint unauthorizedHandler;
    private final JwtAccessDeniedHandler accessDeniedHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationEntryPoint unauthorizedHandler,
                          JwtAccessDeniedHandler accessDeniedHandler,
                          JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.unauthorizedHandler = unauthorizedHandler;
        this.accessDeniedHandler = accessDeniedHandler;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. Disable CSRF because our REST APIs are stateless and authenticate via Bearer token
            .csrf(AbstractHttpConfigurer::disable)

            // 2. Enable CORS with default settings (configured in CorsConfig.java)
            .cors(Customizer.withDefaults())

            // 3. Configure custom JSON handlers for 401 Unauthorized and 403 Forbidden
            .exceptionHandling(exceptions -> exceptions
                    .authenticationEntryPoint(unauthorizedHandler)
                    .accessDeniedHandler(accessDeniedHandler)
            )

            // 4. Enforce STATELESS session policy (no HTTP session cookies created or used)
            .sessionManagement(session -> session
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // 5. Endpoint Authorization Rules
            .authorizeHttpRequests(authorize -> authorize
                    // Public Endpoints
                    .requestMatchers("/api/health").permitAll()
                    .requestMatchers("/api/auth/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/foods/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/pickup-slots/**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/pickup-slots/validate").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/pickup-slots/**").hasAuthority("ROLE_ADMIN")
                    .requestMatchers(HttpMethod.PUT, "/api/pickup-slots/**").hasAuthority("ROLE_ADMIN")
                    .requestMatchers(HttpMethod.PATCH, "/api/pickup-slots/**").hasAuthority("ROLE_ADMIN")
                    .requestMatchers(HttpMethod.DELETE, "/api/pickup-slots/**").hasAuthority("ROLE_ADMIN")
                    .requestMatchers(HttpMethod.POST, "/api/categories/**").hasAuthority("ROLE_ADMIN")
                    .requestMatchers(HttpMethod.PUT, "/api/categories/**").hasAuthority("ROLE_ADMIN")
                    .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasAuthority("ROLE_ADMIN")

                    // Admin-Only Endpoints: Food Item Modifications
                    .requestMatchers(HttpMethod.POST, "/api/foods/**").hasAuthority("ROLE_ADMIN")
                    .requestMatchers(HttpMethod.PUT, "/api/foods/**").hasAuthority("ROLE_ADMIN")
                    .requestMatchers(HttpMethod.DELETE, "/api/foods/**").hasAuthority("ROLE_ADMIN")
                    .requestMatchers(HttpMethod.PATCH, "/api/foods/**").hasAuthority("ROLE_ADMIN")

                    // Admin General & Order Management Endpoints
                    .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
                    .requestMatchers(HttpMethod.GET, "/api/orders/dashboard-stats").hasAuthority("ROLE_ADMIN")
                    .requestMatchers(HttpMethod.PATCH, "/api/orders/*/status").hasAuthority("ROLE_ADMIN")
                    .requestMatchers(HttpMethod.GET, "/api/orders").hasAuthority("ROLE_ADMIN")

                    // Student & Authenticated User Endpoints
                    .requestMatchers("/api/orders/**").authenticated()

                    // All other routes require authentication
                    .anyRequest().authenticated()
            );

        // 6. Insert our JwtAuthenticationFilter before UsernamePasswordAuthenticationFilter
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
