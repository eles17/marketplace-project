require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

pool.connect()
    .then(() => console.log("Connected to PostgreSQL on port 5432"))
    .catch(err => console.error("Database connection error", err));

module.exports = pool; // exports pool so they can be used in other files to run queries