const {Pool} = require('pg');
require('dotenv').config({ path: __dirname + '/.env' }); // force load .env file from the same directory as dbConfig.js
console.log('DEBUGGING ENVIRONMENT VARIABLES:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);
// enhances reusability and maintainability of the code by creating a separate file for the database configuration

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'marketplace',
    password: String(process.env.DB_PASSWORD || 'yourpassword'), 
    port: process.env.DB_PORT || 5432,
});

pool.connect()
    .then(() => console.log('Connected to the database / dbConfig'))
    .catch((err) => console.error('Database connection error:', err.stack));

module.exports = pool;

