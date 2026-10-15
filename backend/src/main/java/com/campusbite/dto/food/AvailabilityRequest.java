package com.campusbite.dto.food;

import jakarta.validation.constraints.NotNull;

/**
 * AvailabilityRequest
 * 
 * Payload sent by Canteen Admin to toggle or update a food item's availability.
 */
public class AvailabilityRequest {

    @NotNull(message = "Availability status is required")
    private Boolean available;

    public AvailabilityRequest() {}

    public AvailabilityRequest(Boolean available) {
        this.available = available;
    }

    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }
}
