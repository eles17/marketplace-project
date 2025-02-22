const express = require('express');
const pool = require('../../config/db');
const router = express.Router();

// Get all Real Estate Listings
router.get('/', async (req, res) => {
    try {
        const realEstate = await pool.query("SELECT * FROM real_estate ORDER BY created_at DESC");
        res.json(realEstate.rows);
    } catch (err) {
        console.error("Error fetching real estate listings:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;