package com.campusbite.dto;

import com.campusbite.entity.Category;

import java.time.LocalDateTime;

/**
 * CategoryResponse DTO
 * 
 * Sent to the frontend when listing or retrieving categories.
 */
public class CategoryResponse {

    private Long id;
    private String name;
    private String description;
    private Integer displayOrder;
    private LocalDateTime createdAt;

    public CategoryResponse() {}

    public CategoryResponse(Long id, String name, String description, Integer displayOrder, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.displayOrder = displayOrder;
        this.createdAt = createdAt;
    }

    public static CategoryResponse fromEntity(Category category) {
        return new CategoryResponse(
            category.getId(),
            category.getName(),
            category.getDescription(),
            category.getDisplayOrder(),
            category.getCreatedAt()
        );
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
