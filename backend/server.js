require('dotenv').config(); // Load environment variables

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
//const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {body, validationResult} = require('express-validator');
const pool = require('./dbConfig'); 


const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());


console.log('Attempting to connect to the database...');


// Test database connection
pool.connect()
    .then(() => console.log('Connected to the database / server.js'))
    .catch((err) => console.error('Database connection error:', err.stack));


    //  Middleware to verify JWT token
    const authenticateUser = (req, res, next) => {
        const token = req.header('Authorization');
        
        console.log("DEBUG: Received Authorization Header:", token); //Print received token
    
        if (!token) {
            return res.status(401).json({ error: 'Access denied - No Token Provided' });
        }
    
        try {
            const tokenParts = token.split(" ");
            if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
                return res.status(401).json({ error: "Invalid token format" });
            }
    
            const actualToken = tokenParts[1];
            console.log("DEBUG: Extracted Token:", actualToken); //Print extracted token
    
            const verified = jwt.verify(actualToken, process.env.JWT_SECRET);
            console.log("DEBUG: Token Verified Successfully:", verified); //Print decoded token
    
            req.user = verified;
            next();
        } catch (error) {
            console.error("DEBUG: Token verification failed:", error);
            return res.status(401).json({ error: 'Invalid token' });
        }
    };

// Middleware to check if the user is an admin
const authorizeAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admins only' });
    }
    next();
};

    //  Example Protected Route
    app.get('/api/protected', authenticateUser, (req, res) => {
        res.json({ message: 'Protected route accessed', userId: req.user.id });
    });

    // Searches products where the title matches the search quer
    app.get('/api/products/search', async (req, res) => {
        try {
            const searchTerm = req.query.query ? String(req.query.query).trim() : '';

            if (!searchTerm) {
                return res.status(400).json({ error: 'Search query is required' });
            }

            const searchQuery = `
                SELECT id, title, description, price, category, views
                FROM products
                WHERE LOWER(title) LIKE LOWER($1)
                ORDER BY views DESC LIMIT 10`;
            
            const values = [`%${searchTerm}%`]; //Uses LIKE with %query% to match partial words

            const result = await pool.query(searchQuery, values);
            console.log('Search results:', result.rows);
            res.json(result.rows);
        } catch (error) {
            console.error('Error searching for products:', error);
            res.status(500).json({ error: 'Failed to search for products' });
        }
    });

// Middleware
const bcrypt = require('bcryptjs');

app.post('/api/register', [
    // Validate input fields
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Enter a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')],
    
    async (req, res) => {
        try {
            // Validate request body
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { name, email, password } = req.body;
            console.log('Registering user:', email);

            // **Check if the user already exists**
            const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
            if (existingUser.rows.length > 0) {
                return res.status(400).json({ error: 'User already exists' });
            }

            // **Hash the password before saving it to the database**
            const hashedPassword = await bcrypt.hash(password, 10);

            // **Insert new user into the database**
            const result = await pool.query(
                'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
                [name, email, hashedPassword, 'user'] // Default role set to 'user'
            );

            // **Generate JWT token for authentication**
            const token = jwt.sign(
                { id: result.rows[0].id, email: result.rows[0].email, role: 'user' }, // Payload
                process.env.JWT_SECRET, // Secret key from .env
                { expiresIn: '2h' } // Token expiration time
            );

            // **Return success response**
            res.status(201).json({ 
                message: 'User registered successfully', 
                user: result.rows[0], 
                token 
            });

        } catch (error) {
            console.error('Error registering user:', error);
            res.status(500).json({ error: 'User registration failed' });
        }
    }
);
  
// User Login route
app.post('/api/login', [
    body('email').isEmail().withMessage('Enter a valid email address'),
    body('password').notEmpty().withMessage('Password is required')],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        try {
            const result = await pool.query('SELECT id, name, email, password, role FROM users WHERE email = $1', [email]);

            if (result.rows.length === 0) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            const user = result.rows[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            // Generate token with role
            const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

            res.json({ message: 'Login successful', token, role: user.role });
        } catch (error) {
            console.error('Error logging in user:', error);
            res.status(500).json({ error: 'Failed to log in' });
        }
    });

    //Protected Route
    //Requires a valid JWT token to access.
app.get('/api/protected', async (req, res) => {
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


   
// fetch top 10 most viewed products
    app.get('/api/products/most-viewed', async (req, res) => { 
        try {
            const { category } = req.query; //get category from query string
            let query;
            let values = [];

            if (category) {
                query = 'SELECT id, title, views, catefory FROM products WHERE category = $1 ORDER BY views DESC LIMIT 10';
                values.push(category);
            } 

            console.log('Fetching most viewed products...');
            const result = await pool.query(query, values);
            console.log('Query successful:', result.rows);
            res.json(result.rows);

        } catch (error) {
            console.error('Error fetching most viewed products:', error);
            res.status(500).json({ error: 'Failed to fatch most viewed products' });
        }
    });

    
    // increase view count of a product 
    app.get('/api/products/:id', async (req, res) => {
        const productId = req.params.id;

        try {
            //Increment views count
            await pool.query('UPDATE products SET views = views + 1 WHERE id = $1', [productId]);
            
            //Fetch product details
            const result = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);
            if(result.rows.length === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error fetching product:', error);
            res.status(500).json({ error: 'Failed to fetch product' });
        }
    });

//MASSAGES
    // API Route to Send a Message
app.post('/api/messages', async (req, res) => {
    try {
        const { sender_id, receiver_id, product_id, message } = req.body;

        // Validate request
        if (!sender_id || !receiver_id || !product_id || !message.trim()) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Insert the message into the database
        const result = await pool.query(
            `INSERT INTO messages (sender_id, receiver_id, product_id, message) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [sender_id, receiver_id, product_id, message]
        );

        res.status(201).json({ message: 'Message sent successfully', data: result.rows[0] });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// API Route to Get Messages Between Two Users
app.get('/api/messages/:user1_id/:user2_id', async (req, res) => {
    try {
        const { user1_id, user2_id } = req.params;

        // Validate input
        if (!user1_id || !user2_id) {
            return res.status(400).json({ error: 'Both user IDs are required' });
        }

        // Fetch messages where user1 and user2 are either sender or receiver
        const result = await pool.query(
            `SELECT * FROM messages 
             WHERE (sender_id = $1 AND receiver_id = $2) 
                OR (sender_id = $2 AND receiver_id = $1) 
             ORDER BY sent_at ASC`,
            [user1_id, user2_id]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});


//ADMIN-ONLY ROUTE: Get all users
app.get('/api/admin/users', authenticateUser, authorizeAdmin, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email, role FROM users');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

//ADMIN-ONLY ROUTE: Delete a user
app.delete('/api/admin/users/:id', authenticateUser, authorizeAdmin, async (req, res) => {
    const userId = req.params.id;

    try {
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });