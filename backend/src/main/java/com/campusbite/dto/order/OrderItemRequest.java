package com.campusbite.dto.order;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * OrderItemRequest
 * 
 * Line item payload containing the food item ID and selected quantity.
 * Notice: Price is strictly NOT received from the client to prevent tampering.
 */
public class OrderItemRequest {

    @NotNull(message = "Food item ID is required")
    private Long foodItemId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Max(value = 50, message = "Quantity cannot exceed 50 per item")
    private Integer quantity;

    public OrderItemRequest() {}

    public OrderItemRequest(Long foodItemId, Integer quantity) {
        this.foodItemId = foodItemId;
        this.quantity = quantity;
    }

    public Long getFoodItemId() {
        return foodItemId;
    }

    public void setFoodItemId(Long foodItemId) {
        this.foodItemId = foodItemId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
