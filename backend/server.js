require('dotenv').config(); // Load environment variables

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg'); // Import pg (PostgreSQL client)
const {body, validationResult} = require('express-validator');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());


console.log('Attempting to connect to the database...');
// Database Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});


// Test database connection
pool.connect()
    .then(() => console.log('Connected to the database'))
    .catch((err) => console.error('Database connection error:', err.stack));


// Middleware
app.post('/api/register', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Enter a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')],

    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const result = await pool.query(
                'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
                [name, email, hashedPassword]
            );
            res.json({ message: 'User registered successfully', user: result.rows[0] });
        } catch (error) {
            console.error('Error registering user:', error);
            res.status(500).json({ error: 'User registration failed' });
        }
    });
  
// User Login route
app.post('/api/login',
    [
    body('email').isEmail().withMessage('Enter a valid email address'),
    body('password').notEmpty().withMessage('Password is required')
],

    async(req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const{ email, password } = req.body;
        try{
            const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            if(result.rows.length === 0) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }
            const user = result.rows[0];
            const isMatch = await bcrypt.compare(password, user.password);
            if(!isMatch) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ message: 'Login successfull', token });
        } catch (error) {
            console.error('Error logging in user:', error);
            res.status(500).json({ error: 'Failed to log in' });
        }
    });

    
app.get('api/proteced', async (req, res) => {
    const token = req.header('Authorization');
        if(!token) {
            return res.status(401).json({ error: 'Access denied' });
        }try{
            const verified = jwt.verify(token, process.env.JWT_SECRET);
            res.json({ message: 'Protected route accessed', userId: verified.id });
        }catch(error) {
            res.status(401).json({ error: 'Invalid token' });
        }
    });

    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });

