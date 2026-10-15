package com.campusbite.repository;

import com.campusbite.entity.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * FoodItemRepository
 * 
 * Spring Data JPA repository for FoodItem entity.
 * Provides menu filtering, category queries, and search capabilities.
 */
@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {

    List<FoodItem> findByCategoryId(Long categoryId);

    List<FoodItem> findByAvailableTrue();

    List<FoodItem> findByCategoryIdAndAvailableTrue(Long categoryId);

    List<FoodItem> findByNameContainingIgnoreCase(String keyword);

    List<FoodItem> findByCategoryIdAndNameContainingIgnoreCase(Long categoryId, String keyword);

    boolean existsByNameIgnoreCaseAndCategoryId(String name, Long categoryId);

    boolean existsByNameIgnoreCaseAndCategoryIdAndIdNot(String name, Long categoryId, Long id);
}
