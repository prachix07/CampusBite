package com.campusbite.repository;

import com.campusbite.entity.Role;
import com.campusbite.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * UserRepository
 * 
 * Spring Data JPA repository for the User entity.
 * Handles database operations for students and canteen administrators.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<User> findByRole(Role role);
}
