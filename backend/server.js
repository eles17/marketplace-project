require('dotenv').config(); // Load environment variables

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg'); // Import pg (PostgreSQL client)

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());


console.log('Attempting to connect to the database...');
// Database Connection
const pool = new Pool({
    user: process.env.DB_USER || 'levstarman',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'marketplace',
    password: process.env.DB_PASSWORD || 'starman',
    port: process.env.DB_PORT || 5433
});


// Test database connection
pool.connect()
    .then(() => {
        console.log('Connected to the database');
        
        // Create 'users' table if it doesn't exist
        pool.query(
            `CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY, 
                name VARCHAR(100), 
                email VARCHAR(100) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            )`, 
            (err, res) => {
                if (err) {
                    console.error('Error creating table:', err);
                } else {
                    console.log('Users table is ready');
                }
            }
        );
    })
    .catch((err) => console.error('Database connection error:', err.stack));




// Root route
app.get('/', (req, res) => {
    res.send('Backend is working!');
});

// Test API route
app.get('/api/test', async (req, res) => {
    try {
        // Test query to check database
        const result = await pool.query('SELECT NOW()');
        res.json({ message: 'Hello from the backend!', time: result.rows[0].now });
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).json({ error: 'Database query failed' });
    }
});
// API route to create a new user
app.post('/api/users', async (req, res) => {
    const { name, email } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
            [name, email]
        );
        res.json(result.rows[0]); // Respond with created user
    } catch (error) {
        console.error('Error inserting user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});


// API route to fetch all users
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows); // Respond with all users
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
