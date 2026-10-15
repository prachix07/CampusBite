package com.campusbite.dto.slot;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

/**
 * ValidateSlotRequest
 * 
 * Payload sent by client or OrderService to authoritatively validate
 * that a pickup date and slot are valid, not expired, and have available capacity.
 */
public class ValidateSlotRequest {

    @NotNull(message = "Pickup date is required")
    @FutureOrPresent(message = "Pickup date cannot be in the past")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate date;

    @NotBlank(message = "Pickup slot is required")
    private String slotDisplayLabel;

    public ValidateSlotRequest() {}

    public ValidateSlotRequest(LocalDate date, String slotDisplayLabel) {
        this.date = date;
        this.slotDisplayLabel = slotDisplayLabel;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getSlotDisplayLabel() {
        return slotDisplayLabel;
    }

    public void setSlotDisplayLabel(String slotDisplayLabel) {
        this.slotDisplayLabel = slotDisplayLabel;
    }
}
