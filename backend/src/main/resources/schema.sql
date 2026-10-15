-- ==============================================================================
-- CampusBite: College Canteen Pre-Order System
-- Database Schema Definition (MySQL 8.0+)
-- ==============================================================================

-- 1. Create Database if not exists and switch to it
CREATE DATABASE IF NOT EXISTS campusbite_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE campusbite_db;

-- Disable foreign key checks during table drop/creation
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS food_items;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS pickup_slots;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- Table: users
-- Stores both Students and Canteen Administrators with secure password hashes
-- ==============================================================================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_STUDENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================================================================
-- Table: categories
-- Organizes canteen menu items (e.g., Breakfast, Snacks, Meals, Beverages, Desserts)
-- ==============================================================================
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_categories_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================================================================
-- Table: food_items
-- Food items available on the canteen menu
-- ==============================================================================
CREATE TABLE food_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category_id BIGINT NOT NULL,
    image_url VARCHAR(500),
    available BOOLEAN NOT NULL DEFAULT TRUE,
    preparation_time INT NOT NULL DEFAULT 10 COMMENT 'Estimated prep time in minutes',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_food_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT,
    INDEX idx_food_category (category_id),
    INDEX idx_food_available (available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================================================================
-- Table: pickup_slots
-- Predefined canteen 15-minute pickup time windows with capacity limit
-- ==============================================================================
CREATE TABLE pickup_slots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    display_label VARCHAR(50) NOT NULL UNIQUE COMMENT 'e.g. 12:00 PM - 12:15 PM',
    max_capacity INT NOT NULL DEFAULT 10 COMMENT 'Maximum concurrent orders allowed per slot',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slots_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================================================================
-- Table: orders
-- Pre-orders placed by students with selected pickup slot and tracking status
-- ==============================================================================
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(30) NOT NULL UNIQUE COMMENT 'Formatted as CB-YYYY-XXXXX',
    student_id BIGINT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    pickup_date DATE NOT NULL,
    pickup_slot VARCHAR(50) NOT NULL COMMENT 'Display label of pickup slot',
    status VARCHAR(20) NOT NULL DEFAULT 'PLACED',
    payment_method VARCHAR(30) NOT NULL DEFAULT 'PAY_AT_CANTEEN',
    special_instructions VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_student FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE RESTRICT,
    INDEX idx_orders_student (student_id),
    INDEX idx_orders_pickup (pickup_date, pickup_slot),
    INDEX idx_orders_status (status),
    INDEX idx_orders_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================================================================
-- Table: order_items
-- Line items inside an order with locked purchase price for historical accuracy
-- ==============================================================================
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    food_item_id BIGINT NOT NULL,
    food_name VARCHAR(100) NOT NULL COMMENT 'Preserved name at purchase time',
    price_at_purchase DECIMAL(10, 2) NOT NULL COMMENT 'Preserved price at purchase time',
    quantity INT NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_items_food FOREIGN KEY (food_item_id) REFERENCES food_items (id) ON DELETE RESTRICT,
    INDEX idx_order_items_order (order_id),
    INDEX idx_order_items_food (food_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
