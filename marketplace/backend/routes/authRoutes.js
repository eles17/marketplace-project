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

// Rate Limit for Login (5 attempts per 15 min)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 5, // 5 attempts
    message: { error: "Too many login attempts. Please try again later." }
});

// User Login (FIXED)
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
            // Fetch user details including the password hash
            const userQuery = await pool.query("SELECT id, email, password_hash, full_name, is_admin, is_banned FROM users WHERE email = $1", [email]);
            
            if (userQuery.rows.length === 0) {
                return res.status(400).json({ error: "Invalid email or password" });
            }

            const user = userQuery.rows[0];

            // Check if the user has a password hash in the database
            if (!user.password_hash) {
                console.error("Error: User has no stored password hash.");
                return res.status(500).json({ error: "Server error. Missing password hash." });
            }

            // Validate the password (Ensure both values exist)
            const validPassword = await bcrypt.compare(password, user.password_hash);
            
            console.log("Entered Password:", password);
            console.log("Stored Hash:", user.password_hash);
            console.log("Password Match:", validPassword);

            if (!validPassword) {
                return res.status(400).json({ error: "Invalid email or password" });
            }

            // Check if user is banned
            if (user.is_banned) {
                return res.status(403).json({ error: "Your account has been banned. Contact support for assistance." });
            }

            // Generate JWT token
            const token = jwt.sign(
                { 
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    is_admin: user.is_admin
                },
                process.env.JWT_SECRET,
                { expiresIn: "24h" }
            );

            res.json({
                message: "Login successful",
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name
                }
            });
        } catch (err) {
            console.error("Login Error:", err);
            next(err);
        }
    }
);

// Fetch user profile (Uses Token)
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