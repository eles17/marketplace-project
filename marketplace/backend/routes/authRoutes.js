const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } =require('express-validator');
const pool = require('../config/db');
require('dotenv').config();

const router = express.Router();

//user registration
router.post('/register',
    [
        body('email').isEmail().withMessage('Invalid email format'),
        body('password').isLength({ min:8 }).withMessage('Password must be at least 6 characters')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, full_name, address } = req.body;

        //enforce password stength
        const passwordCheck = passwordStrength.test(password);
        if(!passwordCheck.strong){
            return res.status(400).json({ error: "Weak password. Use a mix of upprecase, lowercase, numbers and symbols."});
        }

        try { //check if the user already exists
            const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
            if (userExists.rows.length > 0) {
                return res.status(400).json({ message: "User already exsits"});
            }

            //hash password
            const salt = await bcrypt.genSalt(12); // higher salt rounds
            const hashedPassword = await bcrypt.hash(password, salt);

            //insert new user
            const newUser = await pool.query(
                "INSERT INTO users (email, password_hash, full_name, address) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name",
                [email, hashedPassword, full_name, address]
            );

            res.status(201).json({ message: "User registered successfully", user: newUser.rows[0] });
        }catch (err) {
            console.error("Registration Error:", err);
            res.status(500).json({ error: "Server error"});
        }
    }
);

//User login
router.post('/login',
    [
        body('email').isEmail().withMessage('Invalid email format'),
        body('password').exists().withMessage('Password is required')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try { //check if the user exists
            const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
            if (user.rows.length === 0) {
                return res.status(400).json({ message: "Invalid email or password"});
            }

            //check if user is banned
            if (user.rows[0].is_banned){
                return res.status(403).json({message: "Your account has been banned. Contact support for assistance."});
            }

            //compare passwords
            const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
            if (!validPassword){
                return res.status(400).json({ message: "Invalid email or password"});
            }

            //generate JWT token
            const token = jwt.sign(
                { 
                    id: user.rows[0].id,
                    email: user.rows[0].email,
                    is_admin: user.rows[0].is_admin,
                    is_banned: user.rows[0].is_banned
                 },
                process.env.JWT_SECRET,
                { expiresIn: "1h"}
            );

            res.json({ message: "Login successful", token });
        }catch (err) {
            console.error("Login Error:", err);
            res.status(500).json({ error: "Server error"});
        }
    }
);
module.exports = router; 