package com.campusbite.repository;

import com.campusbite.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * CategoryRepository
 * 
 * Spring Data JPA repository for Category entity.
 * Provides standard CRUD and custom search operations.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    List<Category> findAllByOrderByDisplayOrderAsc();
}
