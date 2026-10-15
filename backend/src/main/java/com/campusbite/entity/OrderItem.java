package com.campusbite.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * OrderItem Entity
 * 
 * Maps to the 'order_items' table in MySQL.
 * Represents an individual line item inside an Order.
 * 
 * Crucial College Concept:
 * Stores 'priceAtPurchase' and 'foodName' as snapshots so historical receipts
 * remain completely unmodified even if the canteen updates prices later.
 */
@Entity
@Table(
    name = "order_items",
    indexes = {
        @Index(name = "idx_order_items_order", columnList = "order_id"),
        @Index(name = "idx_order_items_food", columnList = "food_item_id")
    }
)
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many order items belong to one Order
    @JsonIgnore
    @NotNull(message = "Order reference is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, foreignKey = @ForeignKey(name = "fk_items_order"))
    private Order order;

    // Many order items reference a FoodItem
    @NotNull(message = "Food item reference is required")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "food_item_id", nullable = false, foreignKey = @ForeignKey(name = "fk_items_food"))
    private FoodItem foodItem;

    @NotBlank(message = "Food name snapshot is required")
    @Size(max = 100)
    @Column(name = "food_name", nullable = false, length = 100)
    private String foodName;

    @NotNull(message = "Purchase price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Purchase price must be positive")
    @Column(name = "price_at_purchase", nullable = false, precision = 10, scale = 2)
    private BigDecimal priceAtPurchase;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @NotNull(message = "Subtotal is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Subtotal must be positive")
    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    public OrderItem() {}

    public OrderItem(Order order, FoodItem foodItem, String foodName, BigDecimal priceAtPurchase, Integer quantity) {
        this.order = order;
        this.foodItem = foodItem;
        this.foodName = foodName;
        this.priceAtPurchase = priceAtPurchase;
        this.quantity = quantity;
        this.subtotal = priceAtPurchase.multiply(BigDecimal.valueOf(quantity));
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public FoodItem getFoodItem() { return foodItem; }
    public void setFoodItem(FoodItem foodItem) { this.foodItem = foodItem; }

    public String getFoodName() { return foodName; }
    public void setFoodName(String foodName) { this.foodName = foodName; }

    public BigDecimal getPriceAtPurchase() { return priceAtPurchase; }
    public void setPriceAtPurchase(BigDecimal priceAtPurchase) { 
        this.priceAtPurchase = priceAtPurchase;
        if (this.quantity != null && priceAtPurchase != null) {
            this.subtotal = priceAtPurchase.multiply(BigDecimal.valueOf(this.quantity));
        }
    }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { 
        this.quantity = quantity; 
        if (this.priceAtPurchase != null && quantity != null) {
            this.subtotal = this.priceAtPurchase.multiply(BigDecimal.valueOf(quantity));
        }
    }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
}
