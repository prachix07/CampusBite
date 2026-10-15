package com.campusbite.dto.slot;

/**
 * ValidateSlotResponse
 * 
 * Response returned by POST /api/pickup-slots/validate.
 * Confirms whether the requested slot is valid, open, and provides the current capacity numbers.
 */
public class ValidateSlotResponse {

    private boolean valid;
    private String slotDisplayLabel;
    private String date;
    private int maxCapacity;
    private int bookedCount;
    private int remainingCount;
    private String message;

    public ValidateSlotResponse() {}

    public ValidateSlotResponse(boolean valid, String slotDisplayLabel, String date, 
                                int maxCapacity, int bookedCount, int remainingCount, String message) {
        this.valid = valid;
        this.slotDisplayLabel = slotDisplayLabel;
        this.date = date;
        this.maxCapacity = maxCapacity;
        this.bookedCount = bookedCount;
        this.remainingCount = remainingCount;
        this.message = message;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public String getSlotDisplayLabel() {
        return slotDisplayLabel;
    }

    public void setSlotDisplayLabel(String slotDisplayLabel) {
        this.slotDisplayLabel = slotDisplayLabel;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public int getMaxCapacity() {
        return maxCapacity;
    }

    public void setMaxCapacity(int maxCapacity) {
        this.maxCapacity = maxCapacity;
    }

    public int getBookedCount() {
        return bookedCount;
    }

    public void setBookedCount(int bookedCount) {
        this.bookedCount = bookedCount;
    }

    public int getRemainingCount() {
        return remainingCount;
    }

    public void setRemainingCount(int remainingCount) {
        this.remainingCount = remainingCount;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
