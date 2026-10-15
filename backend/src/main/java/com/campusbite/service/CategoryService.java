package com.campusbite.service;

import com.campusbite.dto.CategoryRequest;
import com.campusbite.dto.CategoryResponse;
import com.campusbite.entity.Category;
import com.campusbite.exception.BadRequestException;
import com.campusbite.exception.ResourceNotFoundException;
import com.campusbite.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * CategoryService
 * 
 * Contains business logic for managing food categories.
 * Controllers delegate to this service; no SQL or entities are exposed to controllers.
 */
@Service
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAllByOrderByDisplayOrderAsc()
                .stream()
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        Category category = findCategoryEntityById(id);
        return CategoryResponse.fromEntity(category);
    }

    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new BadRequestException("Category with name '" + request.getName().trim() + "' already exists.");
        }

        Category category = new Category();
        category.setName(request.getName().trim());
        category.setDescription(request.getDescription());
        category.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);

        Category savedCategory = categoryRepository.save(category);
        return CategoryResponse.fromEntity(savedCategory);
    }

    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = findCategoryEntityById(id);

        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(request.getName().trim(), id)) {
            throw new BadRequestException("Another category with name '" + request.getName().trim() + "' already exists.");
        }

        category.setName(request.getName().trim());
        category.setDescription(request.getDescription());
        if (request.getDisplayOrder() != null) {
            category.setDisplayOrder(request.getDisplayOrder());
        }

        Category updatedCategory = categoryRepository.save(category);
        return CategoryResponse.fromEntity(updatedCategory);
    }

    public void deleteCategory(Long id) {
        Category category = findCategoryEntityById(id);
        if (category.getFoodItems() != null && !category.getFoodItems().isEmpty()) {
            throw new BadRequestException("Cannot delete category '" + category.getName() + "' because it still has " 
                    + category.getFoodItems().size() + " food items assigned to it. Please reassign or delete them first.");
        }
        categoryRepository.delete(category);
    }

    public Category findCategoryEntityById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }
}
