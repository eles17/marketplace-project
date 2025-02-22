-- Drop tables if they exist
DROP TABLE IF EXISTS listings, products, vehicles, real_estate, categories, users, messages, requests CASCADE;

-- USERS TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    address TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    is_banned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- CATEGORIES TABLE
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    sub1_id INTEGER REFERENCES categories(id) ON DELETE CASCADE -- Self-referencing for subcategories
);

-- LISTINGS TABLE (All Listings from Main Categories)
CREATE TABLE listings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    subcategory_id INTEGER REFERENCES categories(id) ON DELETE SET NULL, -- NEW FIELD for subcategories
    main_category VARCHAR(255) NOT NULL,
    price NUMERIC CHECK (price > 0),
    created_at TIMESTAMP DEFAULT NOW()
);

-- PRODUCTS TABLE (Retail Listings)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC CHECK (price > 0) NOT NULL,
    delivery_option VARCHAR(255) CHECK (delivery_option IN ('Self-Pickup', 'Postal Delivery', 'Both', 'Courier', 'Express', 'Shipping Available')),
    condition VARCHAR(50) CHECK (condition IN ('New', 'Used', 'Broken')),
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- VEHICLES TABLE
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    model VARCHAR(255),
    vehicle_type VARCHAR(255),
    description TEXT,
    price NUMERIC CHECK (price > 0) NOT NULL,
    first_registration DATE,
    mileage INTEGER CHECK (mileage >= 0),
    fuel_type VARCHAR(50),
    color VARCHAR(50),
    condition VARCHAR(50) CHECK (condition IN ('New', 'Used', 'Broken')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- REAL ESTATE TABLE
CREATE TABLE real_estate (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255),
    description TEXT,
    address TEXT,
    price_per_month NUMERIC CHECK (price_per_month > 0) NOT NULL,
    advance_payment NUMERIC CHECK (advance_payment >= 0),
    available BOOLEAN DEFAULT TRUE,
    rental_period VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- MESSAGES TABLE
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status VARCHAR(50),
    listing_type VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- REQUESTS TABLE (Future Proof)
CREATE TABLE requests (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- TRIGGERS: Ensure Listings Table Stays Updated
CREATE OR REPLACE FUNCTION sync_listings()
RETURNS TRIGGER AS $$
DECLARE
    main_category TEXT;
BEGIN
    IF TG_TABLE_NAME = 'products' THEN
        main_category := 'Retail';
    ELSIF TG_TABLE_NAME = 'vehicles' THEN
        main_category := 'Vehicles';
    ELSIF TG_TABLE_NAME = 'real_estate' THEN
        main_category := 'Real Estate';
    ELSE
        RETURN NULL;
    END IF;

    INSERT INTO listings (user_id, category_id, subcategory_id, main_category, price, created_at)
    VALUES (NEW.user_id, NEW.category_id, NULL, main_category, NEW.price, NEW.created_at);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER FOR EACH MAIN CATEGORY TABLE
CREATE TRIGGER products_sync_trigger
AFTER INSERT ON products
FOR EACH ROW EXECUTE FUNCTION sync_listings();

CREATE TRIGGER vehicles_sync_trigger
AFTER INSERT ON vehicles
FOR EACH ROW EXECUTE FUNCTION sync_listings();

CREATE TRIGGER real_estate_sync_trigger
AFTER INSERT ON real_estate
FOR EACH ROW EXECUTE FUNCTION sync_listings();