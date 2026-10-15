package com.campusbite.entity;

/**
 * OrderStatus
 * 
 * Defines the state machine lifecycle for a canteen pre-order:
 * 
 * PLACED -> ACCEPTED -> PREPARING -> READY -> COLLECTED
 *             \
 *              -> REJECTED (e.g. out of ingredients)
 * CANCELLED (student cancels before canteen accepts)
 */
public enum OrderStatus {
    PLACED,
    ACCEPTED,
    PREPARING,
    READY,
    COLLECTED,
    CANCELLED,
    REJECTED
}
