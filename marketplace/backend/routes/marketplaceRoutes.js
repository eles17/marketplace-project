const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/my-listings', authMiddleware, async (requestAnimationFrame, res) => {
    try {
        const listings = await pool.query(
            [req.user.id]
        );
        res.json(listings.rows);
    } catch (err){
        console.error("Fetch Listings Error:", err);
        res.status(500).json({ error: "Server error"});
    }
}) ;

//protectcted rout: Add a new listing
router.post('/add-listing', authMiddleware, async (req, res) => {
    const { name, category_id, description, price, delivery_option, condition } = req.body;

    try {
        const newListing = await pool.query(
            "INSERT INTO products (user_id, category_id, name, description, price, delivery_option, condition) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
            [req.user.id, category_id, name, description, price, delivery_option, condition]
        );

        res.status(201).json({ message: "Listing created", listing: newListing.rows[0]});
    } catch (err){
        console.error("Add Listing Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;