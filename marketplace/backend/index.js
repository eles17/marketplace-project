require('dotenv').config();
const express = require('express');
const cors = require('cors');
const{Pool} = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

pool.connect()
    .then(() => console.log("Connected to PostgresSQL on port 5432"))
    .catch(err => console.error("Database connection error", err));

app.get('/', (req,res) =>{
    res.send('Backend is working! PostgresSQL is connected.');
});

const PORT= process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('Server running on http://localhost:${process.env.PORT}');
});
