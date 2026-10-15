-- ==============================================================================
-- CampusBite: Initial Seed Data for Categories and Pickup Slots
-- Used during development and initial database setup
-- ==============================================================================

USE campusbite_db;

-- 1. Default Categories
INSERT INTO categories (name, description, display_order) VALUES
('Breakfast', 'Morning quick bites, sandwiches, and hot snacks', 1),
('Meals', 'Hearty thalis, rice bowls, combos, and curries', 2),
('Snacks', 'Crispy evening snacks, samosas, rolls, and fries', 3),
('Beverages', 'Cold coffees, milkshakes, fresh juices, and teas', 4),
('Desserts', 'Sweet treats, ice creams, and pastries', 5)
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- 2. Standard 15-Minute College Pickup Slots (Lunch & Break Periods)
INSERT INTO pickup_slots (start_time, end_time, display_label, max_capacity, active) VALUES
('11:30:00', '11:45:00', '11:30 AM - 11:45 AM', 10, TRUE),
('11:45:00', '12:00:00', '11:45 AM - 12:00 PM', 10, TRUE),
('12:00:00', '12:15:00', '12:00 PM - 12:15 PM', 10, TRUE),
('12:15:00', '12:30:00', '12:15 PM - 12:30 PM', 10, TRUE),
('12:30:00', '12:45:00', '12:30 PM - 12:45 PM', 10, TRUE),
('12:45:00', '13:00:00', '12:45 PM - 01:00 PM', 10, TRUE),
('13:00:00', '13:15:00', '01:00 PM - 01:15 PM', 10, TRUE),
('13:15:00', '13:30:00', '01:15 PM - 01:30 PM', 10, TRUE),
('13:30:00', '13:45:00', '01:30 PM - 01:45 PM', 10, TRUE),
('13:45:00', '14:00:00', '01:45 PM - 02:00 PM', 10, TRUE)
ON DUPLICATE KEY UPDATE max_capacity=VALUES(max_capacity);
