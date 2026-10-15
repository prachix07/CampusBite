package com.campusbite.service;

import com.campusbite.dto.FoodItemRequest;
import com.campusbite.dto.FoodItemResponse;
import com.campusbite.entity.Category;
import com.campusbite.entity.FoodItem;
import com.campusbite.exception.BadRequestException;
import com.campusbite.exception.ResourceNotFoundException;
import com.campusbite.repository.CategoryRepository;
import com.campusbite.repository.FoodItemRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * FoodService
 * 
 * Contains business logic for managing canteen menu items.
 * Validates category relationships, enforces pricing rules, and isolates database operations.
 */
@Service
@Transactional
public class FoodService {

    private final FoodItemRepository foodItemRepository;
    private final CategoryRepository categoryRepository;

    public FoodService(FoodItemRepository foodItemRepository, CategoryRepository categoryRepository) {
        this.foodItemRepository = foodItemRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<FoodItemResponse> getAllFoods(Long categoryId, String search, Boolean availableOnly) {
        List<FoodItem> items;

        boolean hasCategory = categoryId != null;
        boolean hasSearch = search != null && !search.trim().isEmpty();
        boolean onlyAvailable = Boolean.TRUE.equals(availableOnly);

        if (hasCategory && hasSearch) {
            items = foodItemRepository.findByCategoryIdAndNameContainingIgnoreCase(categoryId, search.trim());
        } else if (hasCategory) {
            items = onlyAvailable 
                    ? foodItemRepository.findByCategoryIdAndAvailableTrue(categoryId) 
                    : foodItemRepository.findByCategoryId(categoryId);
        } else if (hasSearch) {
            items = foodItemRepository.findByNameContainingIgnoreCase(search.trim());
        } else {
            items = onlyAvailable 
                    ? foodItemRepository.findByAvailableTrue() 
                    : foodItemRepository.findAll();
        }

        if (onlyAvailable && (hasSearch || (hasCategory && hasSearch))) {
            items = items.stream().filter(FoodItem::getAvailable).collect(Collectors.toList());
        }

        return items.stream()
                .map(FoodItemResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FoodItemResponse getFoodById(Long id) {
        FoodItem foodItem = findFoodEntityById(id);
        return FoodItemResponse.fromEntity(foodItem);
    }

    public FoodItemResponse createFood(FoodItemRequest request) {
        if (request.getPrice() == null || request.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Food price must be greater than zero.");
        }
        if (request.getPreparationTime() != null && request.getPreparationTime() <= 0) {
            throw new BadRequestException("Preparation time must be at least 1 minute.");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        if (foodItemRepository.existsByNameIgnoreCaseAndCategoryId(request.getName().trim(), category.getId())) {
            throw new BadRequestException("A food item with name '" + request.getName().trim() 
                    + "' already exists in category '" + category.getName() + "'.");
        }

        FoodItem foodItem = new FoodItem();
        foodItem.setName(request.getName().trim());
        foodItem.setDescription(request.getDescription());
        foodItem.setPrice(request.getPrice());
        foodItem.setCategory(category);
        foodItem.setImageUrl(request.getImageUrl());
        foodItem.setAvailable(request.getAvailable() != null ? request.getAvailable() : true);
        foodItem.setPreparationTime(request.getPreparationTime() != null ? request.getPreparationTime() : 10);

        FoodItem savedFood = foodItemRepository.save(foodItem);
        return FoodItemResponse.fromEntity(savedFood);
    }

    public FoodItemResponse updateFood(Long id, FoodItemRequest request) {
        if (request.getPrice() == null || request.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Food price must be greater than zero.");
        }
        if (request.getPreparationTime() != null && request.getPreparationTime() <= 0) {
            throw new BadRequestException("Preparation time must be at least 1 minute.");
        }

        FoodItem foodItem = findFoodEntityById(id);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        if (foodItemRepository.existsByNameIgnoreCaseAndCategoryIdAndIdNot(request.getName().trim(), category.getId(), id)) {
            throw new BadRequestException("Another food item with name '" + request.getName().trim() 
                    + "' already exists in category '" + category.getName() + "'.");
        }

        foodItem.setName(request.getName().trim());
        foodItem.setDescription(request.getDescription());
        foodItem.setPrice(request.getPrice());
        foodItem.setCategory(category);
        foodItem.setImageUrl(request.getImageUrl());
        if (request.getAvailable() != null) {
            foodItem.setAvailable(request.getAvailable());
        }
        if (request.getPreparationTime() != null) {
            foodItem.setPreparationTime(request.getPreparationTime());
        }

        FoodItem updatedFood = foodItemRepository.save(foodItem);
        return FoodItemResponse.fromEntity(updatedFood);
    }

    public void deleteFood(Long id) {
        FoodItem foodItem = findFoodEntityById(id);
        try {
            foodItemRepository.delete(foodItem);
            foodItemRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new BadRequestException("Cannot delete food item '" + foodItem.getName() + "' because it is referenced in past student orders. Set its availability to 'Unavailable' instead so it is hidden from the menu while preserving order receipts.");
        }
    }

    public FoodItemResponse toggleAvailability(Long id, Boolean available) {
        FoodItem foodItem = findFoodEntityById(id);
        foodItem.setAvailable(available != null ? available : !foodItem.getAvailable());
        FoodItem updatedFood = foodItemRepository.save(foodItem);
        return FoodItemResponse.fromEntity(updatedFood);
    }

    public FoodItem findFoodEntityById(Long id) {
        return foodItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FoodItem", "id", id));
    }
}
