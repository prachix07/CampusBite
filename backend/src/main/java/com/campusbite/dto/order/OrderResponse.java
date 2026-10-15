package com.campusbite.dto.order;

import com.campusbite.entity.Order;
import com.campusbite.entity.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * OrderResponse
 * 
 * Detailed response DTO returned after order placement or order lookup.
 * Contains unique order number (e.g. CB-2026-00124), items, slot, and status.
 */
public class OrderResponse {

    private Long id;
    private String orderNumber;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private BigDecimal totalAmount;
    private LocalDate pickupDate;
    private String pickupSlot;
    private OrderStatus status;
    private String paymentMethod;
    private String specialInstructions;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;

    public OrderResponse() {}

    public OrderResponse(Long id, String orderNumber, Long studentId, String studentName, String studentEmail,
                         BigDecimal totalAmount, LocalDate pickupDate, String pickupSlot, OrderStatus status,
                         String paymentMethod, String specialInstructions, LocalDateTime createdAt,
                         List<OrderItemResponse> items) {
        this.id = id;
        this.orderNumber = orderNumber;
        this.studentId = studentId;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.totalAmount = totalAmount;
        this.pickupDate = pickupDate;
        this.pickupSlot = pickupSlot;
        this.status = status;
        this.paymentMethod = paymentMethod;
        this.specialInstructions = specialInstructions;
        this.createdAt = createdAt;
        this.items = items;
    }

    public static OrderResponse fromEntity(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems() != null
                ? order.getItems().stream().map(OrderItemResponse::fromEntity).collect(Collectors.toList())
                : List.of();

        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getStudent() != null ? order.getStudent().getId() : null,
                order.getStudent() != null ? order.getStudent().getFullName() : null,
                order.getStudent() != null ? order.getStudent().getEmail() : null,
                order.getTotalAmount(),
                order.getPickupDate(),
                order.getPickupSlot(),
                order.getStatus(),
                order.getPaymentMethod(),
                order.getSpecialInstructions(),
                order.getCreatedAt(),
                itemResponses
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public LocalDate getPickupDate() {
        return pickupDate;
    }

    public void setPickupDate(LocalDate pickupDate) {
        this.pickupDate = pickupDate;
    }

    public String getPickupSlot() {
        return pickupSlot;
    }

    public void setPickupSlot(String pickupSlot) {
        this.pickupSlot = pickupSlot;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getSpecialInstructions() {
        return specialInstructions;
    }

    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<OrderItemResponse> getItems() {
        return items;
    }

    public void setItems(List<OrderItemResponse> items) {
        this.items = items;
    }
}
