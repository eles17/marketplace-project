// enhances reusability and maintainability of the code by creating a separate file for the database configuration
const {Pool} = require('pg');
require('dotenv').config(); // Load environment variables

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.connect()
    .then(() => console.log('Connected to the database'))
    .catch((err) => console.error('Database connection error:', err.stack));

module.exports = pool;

