package com.campusbite.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Order Entity
 * 
 * Maps to the 'orders' table in MySQL.
 * Represents a student's pre-order with selected pickup slot and tracking status.
 */
@Entity
@Table(
    name = "orders",
    indexes = {
        @Index(name = "idx_orders_student", columnList = "student_id"),
        @Index(name = "idx_orders_pickup", columnList = "pickup_date, pickup_slot"),
        @Index(name = "idx_orders_status", columnList = "status"),
        @Index(name = "idx_orders_created_at", columnList = "created_at")
    }
)
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Order number is required")
    @Size(max = 30)
    @Column(name = "order_number", nullable = false, unique = true, length = 30)
    private String orderNumber; // e.g. "CB-2026-00124"

    // Many orders belong to one Student
    @NotNull(message = "Student reference is required")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false, foreignKey = @ForeignKey(name = "fk_orders_student"))
    private User student;

    @NotNull(message = "Total amount is required")
    @DecimalMin(value = "0.0", message = "Total amount cannot be negative")
    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @NotNull(message = "Pickup date is required")
    @Column(name = "pickup_date", nullable = false)
    private LocalDate pickupDate;

    @NotBlank(message = "Pickup slot is required")
    @Size(max = 50)
    @Column(name = "pickup_slot", nullable = false, length = 50)
    private String pickupSlot; // e.g. "12:00 PM - 12:15 PM"

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private OrderStatus status = OrderStatus.PLACED;

    @Column(name = "payment_method", nullable = false, length = 30)
    private String paymentMethod = "PAY_AT_CANTEEN";

    @Size(max = 255)
    @Column(name = "special_instructions", length = 255)
    private String specialInstructions;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // One order has many order items (Cascade all operations and delete orphans)
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<OrderItem> items = new ArrayList<>();

    public Order() {}

    public Order(String orderNumber, User student, BigDecimal totalAmount, LocalDate pickupDate, String pickupSlot) {
        this.orderNumber = orderNumber;
        this.student = student;
        this.totalAmount = totalAmount;
        this.pickupDate = pickupDate;
        this.pickupSlot = pickupSlot;
        this.status = OrderStatus.PLACED;
        this.paymentMethod = "PAY_AT_CANTEEN";
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Bidirectional helper methods
    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public LocalDate getPickupDate() { return pickupDate; }
    public void setPickupDate(LocalDate pickupDate) { this.pickupDate = pickupDate; }

    public String getPickupSlot() { return pickupSlot; }
    public void setPickupSlot(String pickupSlot) { this.pickupSlot = pickupSlot; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getSpecialInstructions() { return specialInstructions; }
    public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
}
