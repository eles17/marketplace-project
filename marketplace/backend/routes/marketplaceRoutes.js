const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const pool = require('../config/db');
const multer = require('multer'); 
const path = require('path'); 
const { validateUserInput } = require('../middleware/validateMiddleware'); 
const NodeCache = require('node-cache');

// Configure image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });
const cache = new NodeCache({ stdTTL: 600 });
const router = express.Router();

// Fetch all listings with filtering
router.get('/listings', async (req, res) => {
    try {
        let query = `
            SELECT id, title, description, price, category, subcategory, created_at, user_id, image_url 
            FROM listings 
            WHERE 1=1`;

        let queryParams = [];

        // Apply Main Category Filter
        if (req.query.category && !isNaN(parseInt(req.query.category))) {
            query += ` AND category = $${queryParams.length + 1}`;
            queryParams.push(parseInt(req.query.category));
        }

        // Apply Subcategory Filter
        if (req.query.subcategory && !isNaN(parseInt(req.query.subcategory))) {
            query += ` AND subcategory = $${queryParams.length + 1}`;
            queryParams.push(parseInt(req.query.subcategory));
        }

        // Apply Min Price Filter
        if (req.query.min_price) {
            query += ` AND price >= $${queryParams.length + 1}`;
            queryParams.push(parseFloat(req.query.min_price));
        }

        // Apply Max Price Filter
        if (req.query.max_price) {
            query += ` AND price <= $${queryParams.length + 1}`;
            queryParams.push(parseFloat(req.query.max_price));
        }

        // Apply Search Query (title or description)
        if (req.query.search) {
            query += ` AND (title ILIKE $${queryParams.length + 1} OR description ILIKE $${queryParams.length + 2})`;
            queryParams.push(`%${req.query.search}%`, `%${req.query.search}%`);
        }

        // Apply Sorting
        if (req.query.sort === 'lowest_price') {
            query += ` ORDER BY price ASC`;
        } else if (req.query.sort === 'highest_price') {
            query += ` ORDER BY price DESC`;
        } else {
            query += ` ORDER BY created_at DESC`;
        }

        const result = await pool.query(query, queryParams);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching listings with filters:", error);
        res.status(500).json({ error: "Server error fetching listings" });
    }
});

// Fetch categories with subcategories
router.get('/categories', async (req, res) => {
    try {
        const mainCategories = await pool.query(
            "SELECT id, name FROM categories WHERE sub1_id IS NULL"
        );

        const subCategories = await pool.query(
            "SELECT id, name, sub1_id FROM categories WHERE sub1_id IS NOT NULL"
        );

        const structuredCategories = mainCategories.rows.map(main => ({
            id: main.id,
            name: main.name,
            subcategories: subCategories.rows
                .filter(sub => sub.sub1_id === main.id)
                .map(sub => ({ id: sub.id, name: sub.name }))
        }));

        res.json(structuredCategories);
    } catch (err) {
        console.error("Error fetching categories:", err);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});

// Add a new listing with image upload
router.post('/listings', authMiddleware, upload.single('image'), async (req, res) => {
    const { title, description, price, category, subcategory } = req.body;
    const userId = req.user.id;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Convert category and subcategory to integers
    const categoryId = parseInt(category, 10);
    const subcategoryId = subcategory ? parseInt(subcategory, 10) : null;

    // Validate required fields
    if (!title || !description || isNaN(price) || price <= 0 || isNaN(categoryId)) {
        return res.status(400).json({ error: "Missing or invalid required fields." });
    }

    try {
        const newListing = await pool.query(
            `INSERT INTO listings (title, description, price, category, subcategory, user_id, image_url) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [title, description, parseFloat(price), categoryId, subcategoryId, userId, imageUrl]
        );

        res.status(201).json({ message: "Listing created", listing: newListing.rows[0] });
    } catch (err) {
        console.error("Error adding listing:", err);
        res.status(500).json({ error: "Server error adding listing" });
    }
});

// Update a listing
router.patch('/listings/:id', authMiddleware, async (req, res) => {
    const { title, description, price, category, subcategory } = req.body;
    const listingId = req.params.id;
    const userId = req.user.id;

    try {
        const existingListing = await pool.query(
            "SELECT * FROM listings WHERE id = $1 AND user_id = $2", 
            [listingId, userId]
        );

        if (existingListing.rows.length === 0) {
            return res.status(403).json({ error: "Unauthorized: You can only edit your own listings." });
        }

        const updatedListing = await pool.query(
            `UPDATE listings SET title = $1, description = $2, price = $3, category = $4, subcategory = $5 
             WHERE id = $6 AND user_id = $7 RETURNING *`,
            [title, description, parseFloat(price), parseInt(category), parseInt(subcategory), listingId, userId]
        );

        res.json({ message: "Listing updated successfully", listing: updatedListing.rows[0] });
    } catch (err) {
        console.error("Error updating listing:", err);
        res.status(500).json({ error: "Server error updating listing" });
    }
});

// Delete a listing
router.delete('/listings/:id', authMiddleware, async (req, res) => {
    const listingId = req.params.id;
    const userId = req.user.id;

    try {
        const existingListing = await pool.query(
            "SELECT * FROM listings WHERE id = $1 AND user_id = $2", 
            [listingId, userId]
        );

        if (existingListing.rows.length === 0) {
            return res.status(403).json({ error: "Unauthorized: You can only delete your own listings." });
        }

        await pool.query("DELETE FROM listings WHERE id = $1 AND user_id = $2", [listingId, userId]);
        res.json({ message: "Listing deleted successfully" });
    } catch (err) {
        console.error("Error deleting listing:", err);
        res.status(500).json({ error: "Server error deleting listing" });
    }
});

module.exports = router;