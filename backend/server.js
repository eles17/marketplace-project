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
    connectionString: process.env.DATABASE_URL, // Use the DATABASE_URL from .env
});


// Test database connection
pool.connect()
    .then(() => console.log('Connected to the database'))
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

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
