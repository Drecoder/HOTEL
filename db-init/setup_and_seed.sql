-- =========================
-- 0. Setup / Extensions
-- =========================

-- Enable UUID support if not already available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================
-- 1. ENUMs
-- =========================

DROP TYPE IF EXISTS room_status_type CASCADE;
CREATE TYPE room_status_type AS ENUM (
    'OCCUPIED', 
    'DIRTY', 
    'CLEANING', 
    'READY', 
    'MAINTENANCE'
);

-- =========================
-- 2. Tables
-- =========================

-- Room Types
CREATE TABLE IF NOT EXISTS room_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    capacity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- Rooms
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_type_id INT REFERENCES room_types(id),
    room_number INT UNIQUE NOT NULL,
    status room_status_type NOT NULL DEFAULT 'READY',
    expected_checkout TIMESTAMP WITH TIME ZONE
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    room_id UUID REFERENCES rooms(id),
    user_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Services
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings(id),
    name VARCHAR(50) NOT NULL DEFAULT 'Unnamed Service',
    price DECIMAL(10,2) NOT NULL
);

-- =========================
-- 3. Seed Data
-- =========================

-- Room Types
INSERT INTO room_types (name, capacity, price) VALUES
    ('Single', 1, 100.00),
    ('Double', 2, 150.00),
    ('Suite', 4, 300.00)
ON CONFLICT (id) DO NOTHING;

-- Rooms
INSERT INTO rooms (room_type_id, room_number, status, expected_checkout) VALUES
    (1, 101, 'OCCUPIED', NOW() + INTERVAL '2 day'),
    (2, 102, 'DIRTY', NULL),
    (3, 201, 'READY', NULL),
    (1, 103, 'MAINTENANCE', NULL),
    (2, 104, 'OCCUPIED', NOW() + INTERVAL '5 day')
ON CONFLICT (room_number) DO NOTHING;

-- Bookings
WITH selected_rooms AS (
    SELECT id, room_number FROM rooms WHERE room_number IN (101, 104)
)
INSERT INTO bookings (room_id, user_id, start_date, end_date)
SELECT id, 1, '2025-09-30'::DATE, '2025-10-02'::DATE FROM selected_rooms WHERE room_number = 101
UNION ALL
SELECT id, 2, '2025-10-02'::DATE, '2025-10-05'::DATE FROM selected_rooms WHERE room_number = 104
ON CONFLICT (id) DO NOTHING;

-- Services
WITH latest_bookings AS (
    SELECT b.id AS booking_id, r.room_number
    FROM bookings b
    JOIN rooms r ON b.room_id = r.id
    ORDER BY b.created_at DESC
    LIMIT 2
)
INSERT INTO services (booking_id, name, price)
SELECT booking_id, 'Late Checkout', 25.00 FROM latest_bookings WHERE room_number = 101
UNION ALL
SELECT booking_id, 'Room Service', 15.00 FROM latest_bookings WHERE room_number = 104
ON CONFLICT (id) DO NOTHING;

-- =========================
-- 4. Indexes
-- =========================

CREATE INDEX IF NOT EXISTS idx_rooms_room_number ON rooms (room_number); 
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings (room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date_range ON bookings (end_date, start_date);
CREATE INDEX IF NOT EXISTS idx_services_booking_id ON services (booking_id);
CREATE INDEX IF NOT EXISTS idx_room_types_price ON room_types (price);
CREATE INDEX IF NOT EXISTS idx_room_types_name ON room_types (name);
