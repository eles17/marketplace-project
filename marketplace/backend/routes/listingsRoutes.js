const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// Get all listings
router.get('/listings', async (req, res, next) => {
    try {
        const listings = await pool.query("SELECT * FROM products ORDER BY created_at DESC");
        res.json(listings.rows);
    } catch (err) {
        next(err);
    }
});

// CREATE LISTING - Automatically Add to Listings Table & Category Table
router.post("/create", authMiddleware, async (req, res) => {
    const { user_id, category_id, main_category, name, description, price, delivery_option, condition, image_url } = req.body;

    try {
        let tableName = "";

        // Determine the correct table based on main category
        switch (main_category) {
            case "Retail":
                tableName = "products";
                break;
            case "Vehicles":
                tableName = "vehicles";
                break;
            case "Real Estate":
                tableName = "real_estate";
                break;
            default:
                return res.status(400).json({ error: "Invalid main category" });
        }

        // Insert into main category table
        const categoryInsertQuery = `
            INSERT INTO ${tableName} (user_id, category_id, name, description, price, delivery_option, condition, image_url, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            RETURNING id;
        `;
        const categoryResult = await pool.query(categoryInsertQuery, [user_id, category_id, name, description, price, delivery_option, condition, image_url]);

        // Insert into Listings table for unified view
        const listingInsertQuery = `
            INSERT INTO listings (id, user_id, category_id, main_category, price, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW());
        `;
        await pool.query(listingInsertQuery, [categoryResult.rows[0].id, user_id, category_id, main_category, price]);

        res.json({ message: "Listing successfully created!" });
    } catch (err) {
        console.error("Error creating listing:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// DELETE LISTING - Remove from Listings Table & Main Category Table
router.delete("/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        // Find out the main category first
        const categoryQuery = "SELECT main_category FROM listings WHERE id = $1";
        const categoryResult = await pool.query(categoryQuery, [id]);

        if (categoryResult.rows.length === 0) {
            return res.status(404).json({ error: "Listing not found" });
        }

        let tableName = "";
        switch (categoryResult.rows[0].main_category) {
            case "Retail":
                tableName = "products";
                break;
            case "Vehicles":
                tableName = "vehicles";
                break;
            case "Real Estate":
                tableName = "real_estate";
                break;
            default:
                return res.status(400).json({ error: "Invalid main category" });
        }

        // Delete from main category table first
        await pool.query(`DELETE FROM ${tableName} WHERE id = $1`, [id]);

        // Then delete from Listings table
        await pool.query("DELETE FROM listings WHERE id = $1", [id]);

        res.json({ message: "Listing successfully deleted!" });
    } catch (err) {
        console.error("Error deleting listing:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;