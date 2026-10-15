package com.campusbite.controller;

import com.campusbite.dto.FoodItemRequest;
import com.campusbite.dto.FoodItemResponse;
import com.campusbite.dto.food.AvailabilityRequest;
import com.campusbite.service.FoodService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * FoodController
 * 
 * Exposes REST APIs for menu items.
 * - Public access: GET /api/foods (Search, Category Filter, Price, Availability)
 * - Admin-only access: POST, PUT, DELETE, PATCH /api/foods (Role-based security)
 */
@RestController
@RequestMapping("/api/foods")
public class FoodController {

    private final FoodService foodService;

    public FoodController(FoodService foodService) {
        this.foodService = foodService;
    }

    /**
     * GET /api/foods
     * Public endpoint: Accessible by Students, Guests, and Admins.
     * Supports search query, category filtering, and available-only toggling.
     */
    @GetMapping
    public ResponseEntity<List<FoodItemResponse>> getAllFoods(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean availableOnly) {
        
        List<FoodItemResponse> foods = foodService.getAllFoods(categoryId, search, availableOnly);
        return ResponseEntity.ok(foods);
    }

    /**
     * GET /api/foods/{id}
     * Public endpoint: Retrieve details of a specific food item.
     */
    @GetMapping("/{id}")
    public ResponseEntity<FoodItemResponse> getFoodById(@PathVariable Long id) {
        FoodItemResponse food = foodService.getFoodById(id);
        return ResponseEntity.ok(food);
    }

    /**
     * POST /api/foods
     * Admin-only: Create a new food item in the canteen catalog.
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<FoodItemResponse> createFood(@Valid @RequestBody FoodItemRequest request) {
        FoodItemResponse createdFood = foodService.createFood(request);
        return new ResponseEntity<>(createdFood, HttpStatus.CREATED);
    }

    /**
     * PUT /api/foods/{id}
     * Admin-only: Update an existing food item by ID.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<FoodItemResponse> updateFood(
            @PathVariable Long id, 
            @Valid @RequestBody FoodItemRequest request) {
        FoodItemResponse updatedFood = foodService.updateFood(id, request);
        return ResponseEntity.ok(updatedFood);
    }

    /**
     * DELETE /api/foods/{id}
     * Admin-only: Delete a food item by ID.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> deleteFood(@PathVariable Long id) {
        foodService.deleteFood(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Food item deleted successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /api/foods/{id}/availability
     * Admin-only: Toggle or update availability status (available / unavailable).
     * Accepts either a query parameter '?available=true/false' or a JSON body '{"available": true}'.
     */
    @PatchMapping("/{id}/availability")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<FoodItemResponse> toggleAvailability(
            @PathVariable Long id,
            @RequestParam(required = false) Boolean available,
            @RequestBody(required = false) AvailabilityRequest body) {
        
        Boolean targetAvailability = available;
        if (targetAvailability == null && body != null) {
            targetAvailability = body.getAvailable();
        }

        FoodItemResponse updatedFood = foodService.toggleAvailability(id, targetAvailability);
        return ResponseEntity.ok(updatedFood);
    }
}

