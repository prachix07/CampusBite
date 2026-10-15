package com.campusbite.service;

import com.campusbite.dto.order.CreateOrderRequest;
import com.campusbite.dto.order.DashboardStatsResponse;
import com.campusbite.dto.order.OrderItemRequest;
import com.campusbite.dto.order.OrderResponse;
import com.campusbite.entity.*;
import com.campusbite.exception.BadRequestException;
import com.campusbite.exception.ResourceNotFoundException;
import com.campusbite.repository.FoodItemRepository;
import com.campusbite.repository.OrderRepository;
import com.campusbite.repository.UserRepository;
import com.campusbite.security.UserPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * OrderService
 * 
 * Implements Phase 10: Complete Canteen Order Placement System.
 * 
 * Executes inside an ACID transaction with REPEATABLE_READ isolation
 * to ensure atomicity, data integrity, and strict concurrency protection.
 * 
 * Workflow on Order Placement:
 * 1. Receive food IDs and quantities.
 * 2. Authenticate the student.
 * 3. Fetch food details from MySQL.
 * 4. Verify food availability.
 * 5. Verify quantities.
 * 6. Calculate total using database prices (Never trust client prices!).
 * 7. Verify pickup slot availability and lock slot.
 * 8. Create the order with status PLACED and unique order number (e.g., CB-2026-00124).
 * 9. Create order items with snapshot prices and subtotals.
 * 10. Update pickup slot capacity tracking in MySQL.
 * 11. Return the generated order ID and response.
 */
@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final FoodItemRepository foodItemRepository;
    private final PickupSlotService pickupSlotService;

    public OrderService(OrderRepository orderRepository,
                        UserRepository userRepository,
                        FoodItemRepository foodItemRepository,
                        PickupSlotService pickupSlotService) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.foodItemRepository = foodItemRepository;
        this.pickupSlotService = pickupSlotService;
    }

    /**
     * Complete Order Placement Workflow (Phase 10 Core)
     */
    @Transactional(isolation = Isolation.REPEATABLE_READ, rollbackFor = Exception.class)
    public OrderResponse placeOrder(CreateOrderRequest request, Long studentId) {
        // 1. Verify request is not null and has items
        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Order tray is empty. Please select at least one food item.");
        }

        // 2. Validate pickup date
        if (request.getPickupDate() == null) {
            throw new BadRequestException("Pickup date is required.");
        }
        if (request.getPickupDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Pickup date cannot be in the past: " + request.getPickupDate());
        }

        // 3. Validate pickup slot
        if (request.getPickupSlot() == null || request.getPickupSlot().trim().isEmpty()) {
            throw new BadRequestException("Pickup slot is required.");
        }

        // 4. Authenticate and retrieve student from MySQL
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", studentId));

        // 5. Consolidate food items to prevent duplicates and validate quantities
        Map<Long, Integer> consolidatedItems = new LinkedHashMap<>();
        for (OrderItemRequest itemReq : request.getItems()) {
            if (itemReq.getFoodItemId() == null) {
                throw new BadRequestException("Food item ID is required for each order line.");
            }
            if (itemReq.getQuantity() == null || itemReq.getQuantity() < 1) {
                throw new BadRequestException("Quantity for each item must be at least 1.");
            }
            if (itemReq.getQuantity() > 50) {
                throw new BadRequestException("Quantity for item exceeds maximum limit of 50 per order.");
            }
            consolidatedItems.merge(itemReq.getFoodItemId(), itemReq.getQuantity(), Integer::sum);
        }

        // Verify total consolidated quantities
        for (Map.Entry<Long, Integer> entry : consolidatedItems.entrySet()) {
            if (entry.getValue() > 50) {
                throw new BadRequestException("Consolidated quantity for food item #" + entry.getKey() + " exceeds maximum allowed batch limit of 50.");
            }
        }

        // 6. Verify and Lock Pickup Slot Availability first (Fails fast if slot is full or past)
        // This acquires a row-level pessimistic lock and counts active orders against slot max capacity (10)
        PickupSlot lockedSlot = pickupSlotService.validateAndLockSlotReservation(
                request.getPickupDate(), 
                request.getPickupSlot()
        );

        // 7. Generate Unique Order Number: e.g. "CB-2026-00124"
        String orderNumber = generateUniqueOrderNumber();

        // Instantiate Order
        Order order = new Order();
        order.setOrderNumber(orderNumber);
        order.setStudent(student);
        order.setPickupDate(request.getPickupDate());
        order.setPickupSlot(lockedSlot.getDisplayLabel());
        order.setStatus(OrderStatus.PLACED);
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "PAY_AT_CANTEEN");
        order.setSpecialInstructions(request.getSpecialInstructions());

        // 8. Fetch foods from MySQL, verify availability, calculate total using DATABASE prices
        BigDecimal calculatedTotal = BigDecimal.ZERO;

        for (Map.Entry<Long, Integer> entry : consolidatedItems.entrySet()) {
            Long foodId = entry.getKey();
            Integer quantity = entry.getValue();

            // Fetch food details from MySQL
            FoodItem foodItem = foodItemRepository.findById(foodId)
                    .orElseThrow(() -> new ResourceNotFoundException("FoodItem", "id", foodId));

            // Verify food availability
            if (foodItem.getAvailable() == null || !foodItem.getAvailable()) {
                throw new BadRequestException("Item '" + foodItem.getName() + "' is currently unavailable or out of stock.");
            }

            // Calculate subtotal strictly using database price (Client prices ignored)
            BigDecimal unitPrice = foodItem.getPrice();
            if (unitPrice == null || unitPrice.compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Invalid pricing detected for item '" + foodItem.getName() + "'.");
            }

            BigDecimal itemSubtotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
            calculatedTotal = calculatedTotal.add(itemSubtotal);

            // Create OrderItem with price and name snapshot
            OrderItem orderItem = new OrderItem(
                    order,
                    foodItem,
                    foodItem.getName(),
                    unitPrice,
                    quantity
            );
            orderItem.setSubtotal(itemSubtotal);
            order.addItem(orderItem);
        }

        order.setTotalAmount(calculatedTotal);

        // 9. Persist the order to MySQL
        Order savedOrder = orderRepository.save(order);

        // 10. Return the generated Order details
        return OrderResponse.fromEntity(savedOrder);
    }

    /**
     * Retrieve order by ID with access control:
     * Students may only view their own orders; Admins can view any order.
     */
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId, UserPrincipal principal) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (principal != null) {
            boolean isAdmin = principal.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            if (!isAdmin && order.getStudent() != null && !order.getStudent().getId().equals(principal.getId())) {
                throw new AccessDeniedException("Access denied: You do not have permission to view this order.");
            }
        }

        return OrderResponse.fromEntity(order);
    }

    /**
     * Retrieve order by unique order number (e.g. CB-2026-00124)
     */
    @Transactional(readOnly = true)
    public OrderResponse getOrderByOrderNumber(String orderNumber, UserPrincipal principal) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderNumber", orderNumber));

        if (principal != null) {
            boolean isAdmin = principal.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            if (!isAdmin && order.getStudent() != null && !order.getStudent().getId().equals(principal.getId())) {
                throw new AccessDeniedException("Access denied: You do not have permission to view this order.");
            }
        }

        return OrderResponse.fromEntity(order);
    }

    /**
     * Retrieve order history for the currently logged in student
     */
    @Transactional(readOnly = true)
    public List<OrderResponse> getStudentOrders(Long studentId) {
        List<Order> orders = orderRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
        return orders.stream().map(OrderResponse::fromEntity).collect(Collectors.toList());
    }

    /**
     * Admin: Retrieve all orders across the campus canteen
     */
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        List<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc();
        return orders.stream().map(OrderResponse::fromEntity).collect(Collectors.toList());
    }

    /**
     * Admin: Calculate live aggregated statistics for today's dashboard
     * using real database records.
     */
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        LocalDate today = LocalDate.now();
        List<Order> allOrders = orderRepository.findAllByOrderByCreatedAtDesc();

        long todayOrders = allOrders.stream()
                .filter(o -> today.equals(o.getPickupDate()) || (o.getCreatedAt() != null && today.equals(o.getCreatedAt().toLocalDate())))
                .count();

        long pendingOrders = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.PLACED || o.getStatus() == OrderStatus.ACCEPTED)
                .count();

        long preparingOrders = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.PREPARING)
                .count();

        long readyOrders = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.READY)
                .count();

        long collectedOrders = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COLLECTED)
                .count();

        long cancelledOrders = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.CANCELLED)
                .count();

        long rejectedOrders = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.REJECTED)
                .count();

        BigDecimal todayRevenue = allOrders.stream()
                .filter(o -> (today.equals(o.getPickupDate()) || (o.getCreatedAt() != null && today.equals(o.getCreatedAt().toLocalDate()))))
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED && o.getStatus() != OrderStatus.REJECTED)
                .map(Order::getTotalAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<OrderResponse> recentOrders = allOrders.stream()
                .limit(10)
                .map(OrderResponse::fromEntity)
                .collect(Collectors.toList());

        return new DashboardStatsResponse(
                todayOrders,
                pendingOrders,
                preparingOrders,
                readyOrders,
                todayRevenue,
                allOrders.size(),
                collectedOrders,
                cancelledOrders,
                rejectedOrders,
                today,
                recentOrders
        );
    }

    /**
     * Update order status along the lifecycle:
     * PLACED -> ACCEPTED -> PREPARING -> READY -> COLLECTED
     * (or CANCELLED / REJECTED)
     */
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {
        if (newStatus == null) {
            throw new BadRequestException("Target order status is required.");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        // Strict lifecycle transition validation
        validateStatusTransition(order.getStatus(), newStatus);

        order.setStatus(newStatus);
        Order updated = orderRepository.save(order);
        return OrderResponse.fromEntity(updated);
    }

    /**
     * Student or Admin: Cancel an order if it has not yet reached a final state
     */
    public OrderResponse cancelOrder(Long orderId, UserPrincipal principal) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (principal != null) {
            boolean isAdmin = principal.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            if (!isAdmin && order.getStudent() != null && !order.getStudent().getId().equals(principal.getId())) {
                throw new AccessDeniedException("Access denied: You do not have permission to cancel this order.");
            }

            // Student safety guard: Cannot cancel once canteen kitchen has started preparing
            if (!isAdmin && (order.getStatus() == OrderStatus.PREPARING || order.getStatus() == OrderStatus.READY)) {
                throw new BadRequestException("Cannot cancel order once food preparation has begun. Please contact canteen staff directly.");
            }
        }

        // Validate cancellation from current state
        validateStatusTransition(order.getStatus(), OrderStatus.CANCELLED);

        order.setStatus(OrderStatus.CANCELLED);
        Order updated = orderRepository.save(order);
        return OrderResponse.fromEntity(updated);
    }

    /**
     * Validates and enforces legal order status lifecycle transitions:
     * PLACED -> ACCEPTED -> PREPARING -> READY -> COLLECTED
     * Terminal / Exception branches: CANCELLED, REJECTED
     */
    public void validateStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        if (currentStatus == newStatus) {
            throw new BadRequestException("Order is already in " + currentStatus + " status.");
        }

        // Terminal states cannot transition to anything
        if (currentStatus == OrderStatus.COLLECTED) {
            throw new BadRequestException("Order has already been collected and cannot be modified.");
        }
        if (currentStatus == OrderStatus.CANCELLED) {
            throw new BadRequestException("Order has been cancelled and cannot be modified.");
        }
        if (currentStatus == OrderStatus.REJECTED) {
            throw new BadRequestException("Order has been rejected and cannot be modified.");
        }

        boolean valid = false;
        String allowedTransitions = "";
        switch (currentStatus) {
            case PLACED:
                valid = (newStatus == OrderStatus.ACCEPTED || newStatus == OrderStatus.REJECTED || newStatus == OrderStatus.CANCELLED);
                allowedTransitions = "ACCEPTED, REJECTED, CANCELLED";
                break;
            case ACCEPTED:
                valid = (newStatus == OrderStatus.PREPARING || newStatus == OrderStatus.CANCELLED || newStatus == OrderStatus.REJECTED);
                allowedTransitions = "PREPARING, REJECTED, CANCELLED";
                break;
            case PREPARING:
                valid = (newStatus == OrderStatus.READY || newStatus == OrderStatus.CANCELLED);
                allowedTransitions = "READY, CANCELLED";
                break;
            case READY:
                valid = (newStatus == OrderStatus.COLLECTED || newStatus == OrderStatus.CANCELLED);
                allowedTransitions = "COLLECTED, CANCELLED";
                break;
            default:
                valid = false;
                break;
        }

        if (!valid) {
            throw new BadRequestException("Invalid order status transition from " + currentStatus + " to " + newStatus + 
                    ". Valid transitions from " + currentStatus + " are: " + allowedTransitions + ".");
        }
    }

    /**
     * Helper: Generate sequential, collision-free order numbers formatted like "CB-2026-00124"
     */
    private synchronized String generateUniqueOrderNumber() {
        int currentYear = LocalDate.now().getYear();
        long nextIndex = orderRepository.count() + 1;
        String candidate = String.format("CB-%d-%05d", currentYear, nextIndex);

        int attempts = 0;
        while (orderRepository.existsByOrderNumber(candidate)) {
            nextIndex++;
            attempts++;
            candidate = String.format("CB-%d-%05d", currentYear, nextIndex);
            if (attempts > 1000) {
                // Safeguard with millisecond suffix if large sequential overlap occurs
                candidate = String.format("CB-%d-%05d-%03d", currentYear, nextIndex, System.currentTimeMillis() % 1000);
                break;
            }
        }
        return candidate;
    }
}
