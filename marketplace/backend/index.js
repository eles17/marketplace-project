require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db'); // import databes connection
const authRoutes = require('./routes/authRoutes'); // import auth routes

const app = express();
app.use(cors());
app.use(express.json());

// test route
app.get('/', (req,res) =>{
    res.send('Backend is working! PostgresSQL is connected.');
});

app.use('/api/auth', authRoutes);

//test databse connection
/*app.get('/test-db', async (req, res) => {
    try{
        const result =await pool.query('SELECT NOW()');
        res.json({ message: "Database is working", time: result.rows[0].now });
    }catch(err){
        console.error("Database error:", err);
        res.status(500).json({ error: "Database connection failed"});
    }
});*/

//Start server
const PORT= process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log('Server running on http://localhost:${PORT}');
});
