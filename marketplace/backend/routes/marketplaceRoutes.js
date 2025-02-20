const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const pool = require('../config/db');
const multer = require('multer');
const path = require('path');
const { validateUserInput } = require('../middleware/validateMiddleware'); 
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL:600}); //cache data for 10 min

const router = express.Router();

router.get('/categories', async(req,res) => {
    try{
        //check cache first
        const cachedCategories = cache.get("categories");
        if(cachedCategories){
            console.log("Serving catagories from cache");
            return res.json(cachedCategories);
        }

        //fetch from DB if not cached
        console.log("Fetching categories from database...");
        const catagories = await pool.query("SELECT * FROM categories");

        cache.set("categories", catagories.rows); //store in cache
        
        res.json(cachedCategories.rows);
    } catch (err){
        nextTick(err);
    }
});
// fetch all products (listings)
router.get('/listings', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, title, description, price, category, created_at, user_id 
             FROM listings 
             ORDER BY created_at DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching listings:", error);
        res.status(500).json({ error: "Server error fetching listings" });
    }
});

// Protected route: Get user's listings
router.get('/my-listings', authMiddleware, async (req, res) => {
    try {
        console.log("User Data from Token:", req.user); // Debugging log

        const userId = req.user.id;
        if (!userId){
            return res.status(401).json({ message: "Unauthorized: No user ID found in token." });
        }

        // Pagination
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 10; // Default limit is 10 items per page
        const offset = (page - 1) * limit; // Calculate offset for pagination

        // Filters
        const { category, min_price, max_price, search } = req.query;
        let query = `
            SELECT id, title, description, price, category, created_at 
            FROM listings 
            WHERE user_id = $1
        `;
        let queryParams = [userId];

        if (category) {
            query += ` AND category = $${queryParams.length + 1}`;
            queryParams.push(category);
        }
        if (min_price) {
            query += ` AND price >= $${queryParams.length + 1}`;
            queryParams.push(min_price);
        }
        if (max_price) {
            query += ` AND price <= $${queryParams.length + 1}`;
            queryParams.push(max_price);
        }
        if (search) {
            query += ` AND (title ILIKE $${queryParams.length + 1} OR description ILIKE $${queryParams.length + 2})`;
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        query += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
        queryParams.push(limit, offset);

        const listings = await pool.query(query, queryParams);
        
        res.json({
            page,
            limit, 
            total: listings.rowCount,
            listings: listings.rows
        });

    } catch (err){
        next(err);
    }
});

// configuer image uploads
 const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads'); // save images to an accessible path
        cb(null, uploadPath); // save images in uploads folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // unique filename
    }
 });

const upload = multer({ storage });

// Protected route: Add a new listing with image upload
router.post('/add-listing', authMiddleware, upload.single('image'), validateUserInput, async (req, res) => {
    const { title, category, description, price } = req.body;
    
    // Check if image was uploaded
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Ensure price is a valid number
    if (isNaN(price) || price <= 0){
        return res.status(400).json({ error: "Invalid price. Must be a positive number." });
    }

    // Check for missing fields
    if (!title || !category || !description){
        return res.status(400).json({ error: "Missing required fields." });
    }

    try {
        const newListing = await pool.query(
           `INSERT INTO listings (title, description, price, category, user_id, image_url) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [title, description, price, category, req.user.id, imageUrl]
        );
        console.log(`Listing created with ID: ${newListing.rows[0].id}, Image URL: ${imageUrl}`);

        res.status(201).json({ message: "Listing created", listing: newListing.rows[0]});
    } catch (err){
        next(err);
    }
});

module.exports = router;