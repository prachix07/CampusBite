package com.campusbite.dto.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

/**
 * CreateOrderRequest
 * 
 * Payload received when a student places a pre-order.
 * Includes items (IDs and quantities), desired pickup date and 15-minute slot.
 */
public class CreateOrderRequest {

    @NotEmpty(message = "Order must contain at least one food item")
    @Valid
    private List<OrderItemRequest> items;

    @NotNull(message = "Pickup date is required (YYYY-MM-DD)")
    @FutureOrPresent(message = "Pickup date cannot be in the past")
    private LocalDate pickupDate;

    @NotBlank(message = "Pickup slot is required (e.g., '12:15 PM - 12:30 PM')")
    private String pickupSlot;

    @Size(max = 255, message = "Special instructions cannot exceed 255 characters")
    private String specialInstructions;

    private String paymentMethod = "PAY_AT_CANTEEN";

    public CreateOrderRequest() {}

    public CreateOrderRequest(List<OrderItemRequest> items, LocalDate pickupDate, String pickupSlot, String specialInstructions) {
        this.items = items;
        this.pickupDate = pickupDate;
        this.pickupSlot = pickupSlot;
        this.specialInstructions = specialInstructions;
        this.paymentMethod = "PAY_AT_CANTEEN";
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
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

    public String getSpecialInstructions() {
        return specialInstructions;
    }

    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod != null ? paymentMethod : "PAY_AT_CANTEEN";
    }
}
