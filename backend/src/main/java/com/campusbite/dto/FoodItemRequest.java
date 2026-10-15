package com.campusbite.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * FoodItemRequest DTO
 * 
 * Used when adding or editing a food item in the canteen catalog.
 */
public class FoodItemRequest {

    @NotBlank(message = "Food item name is required")
    @Size(max = 100, message = "Food name cannot exceed 100 characters")
    private String name;

    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be at least ₹0.01")
    @DecimalMax(value = "10000.00", message = "Price cannot exceed ₹10,000")
    private BigDecimal price;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    private String imageUrl;

    private Boolean available;

    @Min(value = 1, message = "Preparation time must be at least 1 minute")
    private Integer preparationTime;

    public FoodItemRequest() {}

    public FoodItemRequest(String name, String description, BigDecimal price, Long categoryId, String imageUrl, Boolean available, Integer preparationTime) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.categoryId = categoryId;
        this.imageUrl = imageUrl;
        this.available = available != null ? available : true;
        this.preparationTime = preparationTime != null ? preparationTime : 10;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }

    public Integer getPreparationTime() { return preparationTime; }
    public void setPreparationTime(Integer preparationTime) { this.preparationTime = preparationTime; }
}
