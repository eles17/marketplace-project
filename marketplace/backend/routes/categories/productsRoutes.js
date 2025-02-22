const express = require('express');
const pool = require('../../config/db');
const router = express.Router();

// Get all Retail Listings
router.get('/', async (req, res) => {
    try {
        const products = await pool.query("SELECT * FROM products ORDER BY created_at DESC");
        res.json(products.rows);
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;