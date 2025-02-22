const express = require('express');
const pool = require('../../config/db');
const router = express.Router();

// Get all Vehicle Listings
router.get('/', async (req, res) => {
    try {
        const vehicles = await pool.query("SELECT * FROM vehicles ORDER BY created_at DESC");
        res.json(vehicles.rows);
    } catch (err) {
        console.error("Error fetching vehicles:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;