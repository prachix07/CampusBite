package com.campusbite.controller;

import com.campusbite.dto.slot.SlotAvailabilityResponse;
import com.campusbite.dto.slot.ValidateSlotRequest;
import com.campusbite.dto.slot.ValidateSlotResponse;
import com.campusbite.entity.PickupSlot;
import com.campusbite.service.PickupSlotService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * PickupSlotController
 * 
 * Exposes REST APIs for canteen pickup slots, real-time slot capacity,
 * and authoritative server-side slot booking validation.
 */
@RestController
@RequestMapping("/api/pickup-slots")
public class PickupSlotController {

    private final PickupSlotService pickupSlotService;

    public PickupSlotController(PickupSlotService pickupSlotService) {
        this.pickupSlotService = pickupSlotService;
    }

    /**
     * GET /api/pickup-slots
     * Retrieve all configured active canteen pickup slots.
     */
    @GetMapping
    public ResponseEntity<List<PickupSlot>> getAllSlots() {
        List<PickupSlot> slots = pickupSlotService.getAllActiveSlots();
        return ResponseEntity.ok(slots);
    }

    /**
     * GET /api/pickup-slots/availability?date=YYYY-MM-DD
     * Retrieve live slot booking capacity, remaining seats, and availability for a date.
     */
    @GetMapping("/availability")
    public ResponseEntity<List<SlotAvailabilityResponse>> getSlotAvailability(
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        LocalDate targetDate = date != null ? date : LocalDate.now();
        List<SlotAvailabilityResponse> availability = pickupSlotService.getSlotAvailability(targetDate);
        return ResponseEntity.ok(availability);
    }

    /**
     * POST /api/pickup-slots/validate
     * Authoritatively validates a slot reservation for a date against real-time MySQL bookings.
     * Throws 400 (Bad Request) if date is in the past or slot is invalid.
     * Throws 409 (Conflict) if slot has reached maximum capacity (SlotFullException).
     * Returns 200 OK with remaining capacity and details when valid.
     */
    @PostMapping("/validate")
    public ResponseEntity<ValidateSlotResponse> validateSlot(
            @Valid @RequestBody ValidateSlotRequest request) {
        
        PickupSlot slot = pickupSlotService.validateSlotReservation(request.getDate(), request.getSlotDisplayLabel());
        long bookedCount = pickupSlotService.getBookedCount(request.getDate(), slot.getDisplayLabel());
        int remaining = Math.max(0, slot.getMaxCapacity() - (int) bookedCount);

        ValidateSlotResponse response = new ValidateSlotResponse(
                true,
                slot.getDisplayLabel(),
                request.getDate().toString(),
                slot.getMaxCapacity(),
                (int) bookedCount,
                remaining,
                "Pickup slot is valid and has " + remaining + " spots available."
        );
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/pickup-slots
     * Admin: Add a new pickup slot
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<PickupSlot> createSlot(@Valid @RequestBody PickupSlot slot) {
        PickupSlot created = pickupSlotService.createSlot(slot);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * PUT /api/pickup-slots/{id}
     * Admin: Update an existing pickup slot
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<PickupSlot> updateSlot(@PathVariable Long id, @Valid @RequestBody PickupSlot slot) {
        PickupSlot updated = pickupSlotService.updateSlot(id, slot);
        return ResponseEntity.ok(updated);
    }

    /**
     * PATCH /api/pickup-slots/{id}/toggle?active=true|false
     * Admin: Toggle slot active status
     */
    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<PickupSlot> toggleSlotActive(
            @PathVariable Long id, 
            @RequestParam boolean active) {
        PickupSlot updated = pickupSlotService.toggleActive(id, active);
        return ResponseEntity.ok(updated);
    }
}
