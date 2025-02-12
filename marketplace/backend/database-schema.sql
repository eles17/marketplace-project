-- Create Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
    price DECIMAL(10,2) NOT NULL,
    delivery_option VARCHAR(50) CHECK (delivery_option IN ('Self-Pickup', 'Postal Delivery', 'Both')),
    condition VARCHAR(50) CHECK (condition IN ('New', 'Used', 'Broken')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Vehicles Table
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    model VARCHAR(255),
    vehicle_type VARCHAR(255),
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    first_registration DATE,
    mileage INT,
    fuel_type VARCHAR(50),
    color VARCHAR(50),
    condition VARCHAR(50) CHECK (condition IN ('New', 'Used', 'Broken')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Real Estate Table
CREATE TABLE real_estate (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255),
    description TEXT,
    address TEXT,
    price_per_month DECIMAL(10,2) NOT NULL,
    rental_period VARCHAR(50),
    advance_payment DECIMAL(10,2),
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

-- Create Messages Table (Chat Between Users)
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INT REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INT REFERENCES users(id) ON DELETE CASCADE,
    request_id INT REFERENCES requests(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);