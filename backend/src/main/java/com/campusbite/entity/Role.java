package com.campusbite.entity;

/**
 * Role
 * 
 * Defines the authorization levels in the CampusBite application:
 * - ROLE_STUDENT: Can browse menu, add to cart, choose pickup slots, place pre-orders, and track orders.
 * - ROLE_ADMIN: Canteen manager with rights to manage food, categories, update order workflow, and view revenue.
 */
public enum Role {
    ROLE_STUDENT,
    ROLE_ADMIN
}
