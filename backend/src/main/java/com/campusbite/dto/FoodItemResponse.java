package com.campusbite.dto;

import com.campusbite.entity.FoodItem;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * FoodItemResponse DTO
 * 
 * Returned by food endpoints for menu display and cart calculations.
 */
public class FoodItemResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Long categoryId;
    private String categoryName;
    private String imageUrl;
    private Boolean available;
    private Integer preparationTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public FoodItemResponse() {}

    public FoodItemResponse(Long id, String name, String description, BigDecimal price, Long categoryId, String categoryName, String imageUrl, Boolean available, Integer preparationTime, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.imageUrl = imageUrl;
        this.available = available;
        this.preparationTime = preparationTime;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static FoodItemResponse fromEntity(FoodItem food) {
        return new FoodItemResponse(
            food.getId(),
            food.getName(),
            food.getDescription(),
            food.getPrice(),
            food.getCategory() != null ? food.getCategory().getId() : null,
            food.getCategory() != null ? food.getCategory().getName() : null,
            food.getImageUrl(),
            food.getAvailable(),
            food.getPreparationTime(),
            food.getCreatedAt(),
            food.getUpdatedAt()
        );
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }

    public Integer getPreparationTime() { return preparationTime; }
    public void setPreparationTime(Integer preparationTime) { this.preparationTime = preparationTime; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
