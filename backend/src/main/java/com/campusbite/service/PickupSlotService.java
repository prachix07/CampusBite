package com.campusbite.service;

import com.campusbite.dto.slot.SlotAvailabilityResponse;
import com.campusbite.entity.OrderStatus;
import com.campusbite.entity.PickupSlot;
import com.campusbite.exception.BadRequestException;
import com.campusbite.exception.ResourceNotFoundException;
import com.campusbite.exception.SlotFullException;
import com.campusbite.repository.OrderRepository;
import com.campusbite.repository.PickupSlotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * PickupSlotService
 * 
 * Manages canteen 15-minute pickup time windows, live booking counts,
 * and capacity validation. Enforces that no slot can exceed its capacity (default: 10 orders).
 * Employs pessimistic row-level locking and transaction isolation to prevent concurrent race conditions.
 */
@Service
@Transactional
public class PickupSlotService {

    private final PickupSlotRepository pickupSlotRepository;
    private final OrderRepository orderRepository;

    private static final List<OrderStatus> EXCLUDED_STATUSES = 
            Arrays.asList(OrderStatus.CANCELLED, OrderStatus.REJECTED);

    public PickupSlotService(PickupSlotRepository pickupSlotRepository, OrderRepository orderRepository) {
        this.pickupSlotRepository = pickupSlotRepository;
        this.orderRepository = orderRepository;
    }

    /**
     * Retrieve all configured active pickup slots
     */
    @Transactional(readOnly = true)
    public List<PickupSlot> getAllActiveSlots() {
        return pickupSlotRepository.findByActiveTrueOrderByStartTimeAsc();
    }

    /**
     * Retrieve a slot by ID
     */
    @Transactional(readOnly = true)
    public PickupSlot getSlotById(Long id) {
        return pickupSlotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PickupSlot", "id", id));
    }

    /**
     * Count live active bookings for a specific slot on a specific date
     */
    @Transactional(readOnly = true)
    public long getBookedCount(LocalDate date, String slotDisplayLabel) {
        return orderRepository.countBookedOrdersForSlot(date, slotDisplayLabel, EXCLUDED_STATUSES);
    }

    /**
     * Compute live capacity and remaining slots for a specific date
     */
    @Transactional(readOnly = true)
    public List<SlotAvailabilityResponse> getSlotAvailability(LocalDate date) {
        LocalDate today = LocalDate.now();

        // 1. Validate date is not in the past
        if (date.isBefore(today)) {
            throw new BadRequestException("Pickup date cannot be in the past: " + date);
        }

        List<PickupSlot> slots = pickupSlotRepository.findByActiveTrueOrderByStartTimeAsc();
        LocalTime now = LocalTime.now();
        boolean isToday = date.isEqual(today);

        return slots.stream().map(slot -> {
            // Check if slot has already passed today
            boolean isPast = isToday && slot.getEndTime().isBefore(now);

            // Count actual confirmed/active orders in MySQL
            long bookedCount = orderRepository.countBookedOrdersForSlot(date, slot.getDisplayLabel(), EXCLUDED_STATUSES);

            return new SlotAvailabilityResponse(
                    slot.getId(),
                    slot.getStartTime(),
                    slot.getEndTime(),
                    slot.getDisplayLabel(),
                    slot.getMaxCapacity(),
                    (int) bookedCount,
                    isPast
            );
        }).collect(Collectors.toList());
    }

    /**
     * Authoritative Backend Validation:
     * Validates that the requested pickup date and slot are valid, not in the past,
     * and strictly have remaining capacity before an order can be created.
     */
    @Transactional(readOnly = true)
    public PickupSlot validateSlotReservation(LocalDate date, String slotDisplayLabel) {
        LocalDate today = LocalDate.now();

        // 1. Date cannot be in the past
        if (date.isBefore(today)) {
            throw new BadRequestException("Cannot pre-order for a past date: " + date);
        }

        // 2. Slot must exist
        PickupSlot slot = pickupSlotRepository.findByDisplayLabelIgnoreCase(slotDisplayLabel.trim())
                .orElseThrow(() -> new BadRequestException("Invalid pickup slot: '" + slotDisplayLabel + "'"));

        // 3. Time cannot be in the past for today's orders
        if (date.isEqual(today) && slot.getEndTime().isBefore(LocalTime.now())) {
            throw new BadRequestException("Pickup slot '" + slotDisplayLabel + "' has already ended for today. Please choose an upcoming slot.");
        }

        // 4. Strict Database Capacity Check (Cannot exceed max_capacity, default 10)
        long currentBookings = orderRepository.countBookedOrdersForSlot(date, slot.getDisplayLabel(), EXCLUDED_STATUSES);
        if (currentBookings >= slot.getMaxCapacity()) {
            throw new SlotFullException(slot.getDisplayLabel(), date.toString(), slot.getMaxCapacity());
        }

        return slot;
    }

    /**
     * Concurrency-Safe Slot Reservation:
     * Executes inside a SERIALIZABLE / REPEATABLE_READ isolation boundary with a pessimistic lock.
     * Prevents race conditions where two simultaneous checkouts could both slip past the capacity limit.
     */
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public synchronized PickupSlot validateAndLockSlotReservation(LocalDate date, String slotDisplayLabel) {
        LocalDate today = LocalDate.now();

        if (date.isBefore(today)) {
            throw new BadRequestException("Cannot pre-order for a past date: " + date);
        }

        // Acquire row-level pessimistic write lock on the slot
        PickupSlot slot = pickupSlotRepository.findByDisplayLabelWithLock(slotDisplayLabel.trim())
                .orElseThrow(() -> new BadRequestException("Invalid pickup slot: '" + slotDisplayLabel + "'"));

        if (date.isEqual(today) && slot.getEndTime().isBefore(LocalTime.now())) {
            throw new BadRequestException("Pickup slot '" + slotDisplayLabel + "' has already ended for today.");
        }

        long currentBookings = orderRepository.countBookedOrdersForSlot(date, slot.getDisplayLabel(), EXCLUDED_STATUSES);
        if (currentBookings >= slot.getMaxCapacity()) {
            throw new SlotFullException(slot.getDisplayLabel(), date.toString(), slot.getMaxCapacity());
        }

        return slot;
    }

    /**
     * Admin: Add a new pickup slot
     */
    public PickupSlot createSlot(PickupSlot slot) {
        if (pickupSlotRepository.existsByDisplayLabelIgnoreCase(slot.getDisplayLabel())) {
            throw new BadRequestException("A pickup slot with label '" + slot.getDisplayLabel() + "' already exists.");
        }
        return pickupSlotRepository.save(slot);
    }

    /**
     * Admin: Update an existing pickup slot
     */
    public PickupSlot updateSlot(Long id, PickupSlot updated) {
        PickupSlot existing = getSlotById(id);
        existing.setStartTime(updated.getStartTime());
        existing.setEndTime(updated.getEndTime());
        existing.setDisplayLabel(updated.getDisplayLabel());
        existing.setMaxCapacity(updated.getMaxCapacity());
        existing.setActive(updated.isActive());
        return pickupSlotRepository.save(existing);
    }

    /**
     * Admin: Toggle slot active status
     */
    public PickupSlot toggleActive(Long id, boolean active) {
        PickupSlot existing = getSlotById(id);
        existing.setActive(active);
        return pickupSlotRepository.save(existing);
    }
}
