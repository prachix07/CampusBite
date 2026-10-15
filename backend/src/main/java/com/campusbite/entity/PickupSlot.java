package com.campusbite.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * PickupSlot Entity
 * 
 * Maps to the 'pickup_slots' table in MySQL.
 * Represents predefined 15-minute pickup intervals with capacity control
 * (e.g., 10 orders maximum per slot) to prevent long canteen queues.
 */
@Entity
@Table(
    name = "pickup_slots",
    indexes = {
        @Index(name = "idx_slots_active", columnList = "active")
    }
)
public class PickupSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Start time is required")
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @NotBlank(message = "Display label is required")
    @Size(max = 50, message = "Display label cannot exceed 50 characters")
    @Column(name = "display_label", nullable = false, unique = true, length = 50)
    private String displayLabel; // e.g. "12:00 PM - 12:15 PM"

    @Min(value = 1, message = "Max capacity must be at least 1")
    @Column(name = "max_capacity", nullable = false)
    private Integer maxCapacity = 10;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public PickupSlot() {}

    public PickupSlot(LocalTime startTime, LocalTime endTime, String displayLabel, Integer maxCapacity, Boolean active) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.displayLabel = displayLabel;
        this.maxCapacity = maxCapacity != null ? maxCapacity : 10;
        this.active = active != null ? active : true;
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

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public String getDisplayLabel() { return displayLabel; }
    public void setDisplayLabel(String displayLabel) { this.displayLabel = displayLabel; }

    public Integer getMaxCapacity() { return maxCapacity; }
    public void setMaxCapacity(Integer maxCapacity) { this.maxCapacity = maxCapacity; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
