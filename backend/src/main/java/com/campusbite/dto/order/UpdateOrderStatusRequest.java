package com.campusbite.dto.order;

import com.campusbite.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;

/**
 * UpdateOrderStatusRequest
 * 
 * Used by canteen staff/admin to update order status along the lifecycle:
 * PLACED -> ACCEPTED -> PREPARING -> READY -> COLLECTED / CANCELLED / REJECTED
 */
public class UpdateOrderStatusRequest {

    @NotNull(message = "Order status is required")
    private OrderStatus status;

    public UpdateOrderStatusRequest() {}

    public UpdateOrderStatusRequest(OrderStatus status) {
        this.status = status;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }
}
