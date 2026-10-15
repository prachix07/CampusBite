package com.campusbite.controller;

import com.campusbite.dto.order.CreateOrderRequest;
import com.campusbite.dto.order.DashboardStatsResponse;
import com.campusbite.dto.order.OrderResponse;
import com.campusbite.dto.order.UpdateOrderStatusRequest;
import com.campusbite.security.UserPrincipal;
import com.campusbite.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * OrderController
 * 
 * Exposes REST endpoints for the Canteen Order Placement and Tracking System:
 * 
 * POST  /api/orders               - Place a new canteen order (Authenticated students)
 * GET   /api/orders/{id}          - Retrieve order by ID (Owner or Admin)
 * GET   /api/orders/number/{num}  - Retrieve order by Order Number (Owner or Admin)
 * GET   /api/orders/my-orders     - Retrieve order history for logged-in student
 * GET   /api/orders               - Retrieve all canteen orders (Admin only)
 * PATCH /api/orders/{id}/status   - Update order status along lifecycle (Admin only)
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * 1. Place a new order
     * 
     * Student submits items (IDs + quantities) & selected pickup date + slot.
     * Backend calculates total using MySQL prices, verifies availability and capacity limits,
     * locks slot, persists order, and returns generated order ID.
     */
    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(
            @Valid @RequestBody CreateOrderRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        OrderResponse response = orderService.placeOrder(request, currentUser.getId());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * 2. Get order details by internal database ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        OrderResponse response = orderService.getOrderById(id, currentUser);
        return ResponseEntity.ok(response);
    }

    /**
     * 3. Get order details by human-friendly unique order number (e.g., CB-2026-00124)
     */
    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<OrderResponse> getOrderByNumber(
            @PathVariable String orderNumber,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        OrderResponse response = orderService.getOrderByOrderNumber(orderNumber, currentUser);
        return ResponseEntity.ok(response);
    }

    /**
     * 4. Get all orders placed by the currently authenticated student
     */
    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        List<OrderResponse> orders = orderService.getStudentOrders(currentUser.getId());
        return ResponseEntity.ok(orders);
    }

    /**
     * 5. Admin: List all orders in the canteen system
     */
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        List<OrderResponse> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    /**
     * 5b. Admin: Retrieve live dashboard statistics (today's orders, pending, preparing, ready, today's revenue)
     */
    @GetMapping("/dashboard-stats")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        DashboardStatsResponse stats = orderService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * 6. Admin: Update order status along the lifecycle:
     * PLACED -> ACCEPTED -> PREPARING -> READY -> COLLECTED
     * (or CANCELLED / REJECTED)
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        
        OrderResponse response = orderService.updateOrderStatus(id, request.getStatus());
        return ResponseEntity.ok(response);
    }

    /**
     * 7. Cancel order (Student owner or Admin)
     */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        OrderResponse response = orderService.cancelOrder(id, currentUser);
        return ResponseEntity.ok(response);
    }
}
