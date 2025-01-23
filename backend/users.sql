CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY, 
    name VARCHAR(100) UNIQUE NOT NULL,
    create_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (name, email) VALUES
('Lev Starman', 'lev.starman1@gmail.com'),
('Max Starman', 'maxs@gmail.com'),\i backend/users.sql
('Maria Starman','eles@gmail.com');

-- list all tables
\dt

--view tabel structure
\d users

-- view data inside a table
SELECT * FROM users;