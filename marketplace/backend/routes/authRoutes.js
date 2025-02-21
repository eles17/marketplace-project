const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
require('dotenv').config();
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Import password validator
const passwordValidator = require('password-validator');

// Define password strength rules
const passwordStrength = new passwordValidator();
passwordStrength
    .is().min(8)   // Minimum length 8
    .is().max(100) // Maximum length 100
    .has().uppercase() // Must have uppercase letters
    .has().lowercase() // Must have lowercase letters
    .has().digits(1)  // Must have at least one digit
    .has().not().spaces(); // Should not have spaces

// User Registration
router.post('/register',
    [
        body('email').isEmail().withMessage('Invalid email format'),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    ],
    async (req, res, next) => {  // Added `next` here to fix missing parameter
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, full_name, address } = req.body;

        // Validate password strength
        const passwordCheck = passwordStrength.validate(password);
        if (!passwordCheck) {
            return res.status(400).json({ error: "Weak password. Use a mix of uppercase, lowercase, numbers, and symbols." });
        }

        try {
            await pool.query("BEGIN"); // Start transaction
            const userExists = await pool.query("SELECT 1 FROM users WHERE email = $1", [email]);
            if (userExists.rows.length > 0) {
                return res.status(400).json({ error: "User already exists" });
            }

            // Hash password
            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Insert new user
            const newUser = await pool.query(
                "INSERT INTO users (email, password_hash, full_name, address) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name",
                [email, hashedPassword, full_name, address]
            );
            await pool.query("COMMIT"); // Commit transaction

            res.status(201).json({ message: "User registered successfully", user: newUser.rows[0] });
        } catch (err) {
            await pool.query("ROLLBACK"); // Rollback on error
            next(err);
        }
    }
);

// Rate Limit for Login (5 attempts per 15 min)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 5, // 5 attempts
    message: { error: "Too many login attempts. Please try again later." }
});

// User Login
router.post('/login', loginLimiter,
    [
        body('email').isEmail().withMessage('Invalid email format'),
        body('password').exists().withMessage('Password is required')
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            const user = await pool.query("SELECT id, email, password_hash, is_admin, is_banned FROM users WHERE email = $1", [email]);
            if (user.rows.length === 0) {
                return res.status(400).json({ error: "Invalid email or password" });
            }

            // Check if user is banned
            if (user.rows[0].is_banned) {
                return res.status(403).json({ error: "Your account has been banned. Contact support for assistance." });
            }

            // Compare passwords
            const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
            
            console.log("Entered Password:", password);
            console.log("Stored Hash:", user.rows[0].password_hash);
            console.log("Password Match:", validPassword);

            if (!validPassword) {
                return res.status(400).json({ error: "Invalid email or password" });
            }

            // Generate JWT token
            const token = jwt.sign(
                { 
                    id: user.rows[0].id,
                    email: user.rows[0].email,
                    is_admin: user.rows[0].is_admin,
                    is_banned: user.rows[0].is_banned
                },
                process.env.JWT_SECRET,
                { expiresIn: "24h" }
            );

            res.json({ message: "Login successful", token });
        } catch (err) {
            next(err);
        }
    }
);

// Fetch user profile
router.get('/profile', async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await pool.query(
            "SELECT id, email, full_name, address FROM users WHERE id = $1",
            [decoded.id]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ user: user.rows[0] });
    } catch (err) {
        next(err);
    }
});

module.exports = router;