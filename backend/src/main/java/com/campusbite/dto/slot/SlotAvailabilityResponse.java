package com.campusbite.dto.slot;

import java.time.LocalTime;

/**
 * SlotAvailabilityResponse
 * 
 * Provides live capacity status for a canteen pickup time slot on a specific date.
 */
public class SlotAvailabilityResponse {

    private Long slotId;
    private String startTime;
    private String endTime;
    private String displayLabel;
    private int maxCapacity;
    private int bookedCount;
    private int remainingCount;
    private boolean isFull;
    private boolean isPast;
    private boolean isAvailable;

    public SlotAvailabilityResponse() {}

    public SlotAvailabilityResponse(Long slotId, LocalTime startTime, LocalTime endTime, String displayLabel, 
                                    int maxCapacity, int bookedCount, boolean isPast) {
        this.slotId = slotId;
        this.startTime = startTime != null ? startTime.toString() : "";
        this.endTime = endTime != null ? endTime.toString() : "";
        this.displayLabel = displayLabel;
        this.maxCapacity = maxCapacity;
        this.bookedCount = bookedCount;
        this.remainingCount = Math.max(0, maxCapacity - bookedCount);
        this.isFull = bookedCount >= maxCapacity;
        this.isPast = isPast;
        this.isAvailable = !this.isFull && !this.isPast;
    }

    public Long getSlotId() { return slotId; }
    public void setSlotId(Long slotId) { this.slotId = slotId; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public String getDisplayLabel() { return displayLabel; }
    public void setDisplayLabel(String displayLabel) { this.displayLabel = displayLabel; }

    public int getMaxCapacity() { return maxCapacity; }
    public void setMaxCapacity(int maxCapacity) { this.maxCapacity = maxCapacity; }

    public int getBookedCount() { return bookedCount; }
    public void setBookedCount(int bookedCount) { this.bookedCount = bookedCount; }

    public int getRemainingCount() { return remainingCount; }
    public void setRemainingCount(int remainingCount) { this.remainingCount = remainingCount; }

    public boolean isFull() { return isFull; }
    public void setFull(boolean full) { isFull = full; }

    public boolean isPast() { return isPast; }
    public void setPast(boolean past) { isPast = past; }

    public boolean isAvailable() { return isAvailable; }
    public void setAvailable(boolean available) { isAvailable = available; }
}
