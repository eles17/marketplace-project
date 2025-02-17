-- Drop existing tables if they exist (for resetting the database)
DROP TABLE IF EXISTS messages, requests, real_estate, vehicles, products, categories, users CASCADE;

-- Create Users Table (Now Includes Admin & Ban Status)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255),
    address TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    is_banned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for email (faster login lookups)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create Categories Table (for hierarchical organization)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id INT REFERENCES categories(id) ON DELETE SET NULL
);

-- Create Products Table (Retail Listings)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    delivery_option VARCHAR(50) CHECK (delivery_option IN ('Self-Pickup', 'Postal Delivery', 'Both', 'Courier', 'Express')),
    condition VARCHAR(50) CHECK (condition IN ('New', 'Used', 'Broken')),
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster product queries
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_user ON products(user_id);

-- Create Vehicles Table
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    model VARCHAR(255),
    vehicle_type VARCHAR(255),
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    first_registration DATE,
    mileage INT CHECK (mileage >= 0),
    fuel_type VARCHAR(50),
    color VARCHAR(50),
    condition VARCHAR(50) CHECK (condition IN ('New', 'Used', 'Broken')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for vehicles filtering
CREATE INDEX IF NOT EXISTS idx_vehicles_category ON vehicles(category_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_user ON vehicles(user_id);

-- Create Real Estate Table
CREATE TABLE real_estate (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255),
    description TEXT,
    address TEXT,
    price_per_month DECIMAL(10,2) NOT NULL CHECK (price_per_month > 0),
    rental_period VARCHAR(50),
    advance_payment DECIMAL(10,2) CHECK (advance_payment >= 0),
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for real estate filtering
CREATE INDEX IF NOT EXISTS idx_real_estate_category ON real_estate(category_id);
CREATE INDEX IF NOT EXISTS idx_real_estate_user ON real_estate(user_id);


-- Create Requests Table (Buy/Rent Requests)
CREATE TABLE requests (
    id SERIAL PRIMARY KEY,
    sender_id INT REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INT REFERENCES users(id) ON DELETE CASCADE,
    listing_id INT NOT NULL,
    listing_type VARCHAR(50) CHECK (listing_type IN ('Product', 'Vehicle', 'RealEstate')),
    message TEXT NOT NULL,
    status VARCHAR(50) CHECK (status IN ('Pending', 'Accepted', 'Declined')) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster request handling
CREATE INDEX IF NOT EXISTS idx_requests_sender ON requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_requests_receiver ON requests(receiver_id);

-- Create Messages Table (Chat Between Users)
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INT REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INT REFERENCES users(id) ON DELETE CASCADE,
    listing_id INT REFERENCES products(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for message retrieval
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_listing ON messages(listing_id);