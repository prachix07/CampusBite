package com.campusbite.dto.order;

import com.campusbite.entity.OrderItem;

import java.math.BigDecimal;

/**
 * OrderItemResponse
 * 
 * Line item returned to the client showing snapshot price and computed subtotal.
 */
public class OrderItemResponse {

    private Long id;
    private Long foodItemId;
    private String foodName;
    private BigDecimal priceAtPurchase;
    private Integer quantity;
    private BigDecimal subtotal;

    public OrderItemResponse() {}

    public OrderItemResponse(Long id, Long foodItemId, String foodName, BigDecimal priceAtPurchase, Integer quantity, BigDecimal subtotal) {
        this.id = id;
        this.foodItemId = foodItemId;
        this.foodName = foodName;
        this.priceAtPurchase = priceAtPurchase;
        this.quantity = quantity;
        this.subtotal = subtotal;
    }

    public static OrderItemResponse fromEntity(OrderItem item) {
        return new OrderItemResponse(
                item.getId(),
                item.getFoodItem() != null ? item.getFoodItem().getId() : null,
                item.getFoodName(),
                item.getPriceAtPurchase(),
                item.getQuantity(),
                item.getSubtotal()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getFoodItemId() {
        return foodItemId;
    }

    public void setFoodItemId(Long foodItemId) {
        this.foodItemId = foodItemId;
    }

    public String getFoodName() {
        return foodName;
    }

    public void setFoodName(String foodName) {
        this.foodName = foodName;
    }

    public BigDecimal getPriceAtPurchase() {
        return priceAtPurchase;
    }

    public void setPriceAtPurchase(BigDecimal priceAtPurchase) {
        this.priceAtPurchase = priceAtPurchase;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }
}
