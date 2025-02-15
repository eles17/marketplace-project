require('dotenv').config();
const authMiddleware = require('./middleware/authMiddleware'); // adds protected route
const express = require('express');
const cors = require('cors');
const pool = require('./config/db'); // import databes connection
const authRoutes = require('./routes/authRoutes'); // import auth routes
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// test route
app.get('/', (req,res) =>{
    res.send('Backend is working! PostgresSQL is connected.');
});

app.get('/api/protected', authMiddleware, (req, res) => {
    res.json({
        message: "This is a protected route!",
        user: req.user 
    })
})

app.use('/api/chat', chatRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/marketplace', marketplaceRoutes);

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
