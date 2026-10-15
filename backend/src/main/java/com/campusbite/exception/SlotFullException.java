package com.campusbite.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * SlotFullException
 * 
 * Thrown when an order is submitted for a pickup slot that has reached its
 * maximum capacity limit (e.g., 10 orders already placed).
 * Maps to HTTP 409 Conflict.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class SlotFullException extends RuntimeException {

    public SlotFullException(String message) {
        super(message);
    }

    public SlotFullException(String slotLabel, String date, int maxCapacity) {
        super(String.format("Pickup slot '%s' on %s has reached maximum capacity (%d/%d orders). Please choose another slot.",
                slotLabel, date, maxCapacity, maxCapacity));
    }
}
