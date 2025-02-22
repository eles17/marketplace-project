require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Improved connection handling
pool.connect()
    .then(() => console.log("Connected to PostgreSQL on port 5432"))
    .catch(err => {
        console.error("Database connection error:", err);
        process.exit(1); // Exit process on DB failure
    });

module.exports = pool; // Exports pool for queries in other files