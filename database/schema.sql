-- Vehicle Rental Management System - MySQL Schema
-- For Indian Market

-- Create Database
CREATE DATABASE IF NOT EXISTS vehicle_rental_db;
USE vehicle_rental_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    aadhaar_number VARCHAR(12),
    driving_license VARCHAR(20),
    address TEXT,
    city VARCHAR(50),
    verified BOOLEAN DEFAULT FALSE,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_role (role)
);

-- Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type ENUM('Car', 'Bike', 'Scooter') NOT NULL,
    fuel_type ENUM('Petrol', 'Diesel', 'Electric') NOT NULL,
    price_per_day DECIMAL(10, 2) NOT NULL,
    location VARCHAR(50) NOT NULL,
    availability_status BOOLEAN DEFAULT TRUE,
    description TEXT,
    image_url VARCHAR(255),
    registration_number VARCHAR(20) UNIQUE,
    capacity INT DEFAULT 1,
    kilometers_run INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_fuel_type (fuel_type),
    INDEX idx_location (location),
    INDEX idx_availability (availability_status)
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    gst_amount DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('Pending', 'Confirmed', 'Ongoing', 'Completed', 'Cancelled') DEFAULT 'Pending',
    pickup_location VARCHAR(100),
    dropoff_location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_status (status),
    INDEX idx_start_date (start_date),
    INDEX idx_end_date (end_date),
    UNIQUE KEY unique_booking (vehicle_id, start_date, end_date)
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    user_id INT NOT NULL,
    payment_method VARCHAR(30) NOT NULL DEFAULT 'Razorpay',
    amount DECIMAL(10, 2) NOT NULL,
    transaction_id VARCHAR(100) UNIQUE,
    status ENUM('Pending', 'Success', 'Failed') DEFAULT 'Pending',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_booking_id (booking_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);

-- Create Admin User (default credentials for demo)
-- Password: admin123
INSERT INTO users (full_name, email, phone, password, role, verified) 
VALUES ('Admin User', 'admin@driveindia.com', '9999999999', '$2a$10$9GUFZ7w5eBfsQuDeFqRcIOjpfAcyEXthUQZpOpC.8R1hH5/5vxhXq', 'admin', TRUE)
ON DUPLICATE KEY UPDATE id=id;

-- Sample Vehicles Data
INSERT INTO vehicles (name, type, fuel_type, price_per_day, location, availability_status, image_url, registration_number, capacity, description)
VALUES
('Maruti Swift', 'Car', 'Petrol', 1500, 'Mumbai', TRUE, 'https://placehold.co/300x200?text=Maruti+Swift', 'MH01AB1234', 5, 'Compact car, automatic transmission'),
('Hyundai Creta', 'Car', 'Diesel', 2500, 'Delhi', TRUE, 'https://placehold.co/300x200?text=Hyundai+Creta', 'DL01CD5678', 5, 'SUV, spacious interior, excellent mileage'),
('Hero Honda CB Shine', 'Bike', 'Petrol', 800, 'Pune', TRUE, 'https://placehold.co/300x200?text=Hero+Honda', 'MH02EF9101', 2, 'Fuel efficient bike'),
('TVS Jupiter', 'Scooter', 'Petrol', 500, 'Mumbai', TRUE, 'https://placehold.co/300x200?text=TVS+Jupiter', 'MH03GH1121', 2, 'Stylish scooter, automatic transmission'),
('Tata Nexon EV', 'Car', 'Electric', 3000, 'Bangalore', TRUE, 'https://placehold.co/300x200?text=Tata+Nexon+EV', 'KA01IJ3141', 5, 'Electric vehicle, eco-friendly'),
('Bajaj Avenger', 'Bike', 'Petrol', 900, 'Delhi', TRUE, 'https://placehold.co/300x200?text=Bajaj+Avenger', 'DL02KL5161', 2, 'Cruiser motorcycle'),
('Honda Activa', 'Scooter', 'Petrol', 600, 'Pune', TRUE, 'https://placehold.co/300x200?text=Honda+Activa', 'MH04MN7181', 2, 'Popular automatic scooter'),
('Mahindra XUV500', 'Car', 'Diesel', 3500, 'Mumbai', TRUE, 'https://placehold.co/300x200?text=Mahindra+XUV', 'MH05OP9201', 7, 'Premium SUV with all features');

-- GST Calculation (18% for vehicle rental in India)
-- Note: GST is calculated at booking time as per Indian tax regulations

-- Add profile_photo column to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo VARCHAR(255) DEFAULT NULL;

-- Plans Table
CREATE TABLE IF NOT EXISTS plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    duration_type ENUM('daily', 'weekly', 'monthly') NOT NULL,
    duration_days INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    discount_percent INT DEFAULT 0,
    features TEXT,
    roadside_assistance BOOLEAN DEFAULT FALSE,
    unlimited_km BOOLEAN DEFAULT FALSE,
    priority_support BOOLEAN DEFAULT FALSE,
    free_cancellation BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    plan_id INT NOT NULL,
    plan_name VARCHAR(100),
    amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    payment_method VARCHAR(30) DEFAULT 'Razorpay',
    transaction_id VARCHAR(100),
    status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);

-- Default Plans
INSERT INTO plans (name, duration_type, duration_days, price, discount_percent, features, roadside_assistance, unlimited_km, priority_support, free_cancellation)
VALUES 
    ('Daily Explorer', 'daily', 1, 0, 0, 'Basic vehicle access,Standard support,100 KM/day limit', FALSE, FALSE, FALSE, FALSE),
    ('Weekly Rider', 'weekly', 7, 499, 10, 'All daily features,10% discount on bookings,Roadside assistance,200 KM/day limit', TRUE, FALSE, FALSE, TRUE),
    ('Monthly Pro', 'monthly', 30, 1499, 25, 'All weekly features,25% discount on bookings,Priority 24/7 support,Unlimited kilometers,Free cancellations', TRUE, TRUE, TRUE, TRUE)
ON DUPLICATE KEY UPDATE id=id;
