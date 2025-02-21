const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const pool = require('../config/db');
const multer = require('multer'); 
const path = require('path'); 
const { validateUserInput } = require('../middleware/validateMiddleware'); 
const NodeCache = require('node-cache');


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


const cache = new NodeCache({ stdTTL:600}); //cache data for 10 min

const router = express.Router();

 // Fetch all listings
 router.get('/listings', async (req, res) => {
    try {
        let query = "SELECT * FROM listings WHERE 1=1";
        let queryParams = [];

        if (req.query.category) {
            query += " AND category = $1";
            queryParams.push(req.query.category);
        }
        if (req.query.min_price) {
            query += " AND price >= $2";
            queryParams.push(req.query.min_price);
        }
        if (req.query.max_price) {
            query += " AND price <= $3";
            queryParams.push(req.query.max_price);
        }
        if (req.query.search) {
            query += " AND (title ILIKE $4 OR description ILIKE $5)";
            queryParams.push(`%${req.query.search}%`, `%${req.query.search}%`);
        }

        if (req.query.sort === 'lowPrice') {
            query += " ORDER BY price ASC";
        } else if (req.query.sort === 'highPrice') {
            query += " ORDER BY price DESC";
        } else if (req.query.sort === 'oldest') {
            query += " ORDER BY created_at ASC";
        } else {
            query += " ORDER BY created_at DESC";
        }

        const result = await pool.query(query, queryParams);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching listings:", error);
        res.status(500).json({ error: "Server error fetching listings" });
    }
});

router.get('/categories', async (req, res) => {
    try {
        // Fetch categories from DB
        const categoriesResult = await pool.query("SELECT * FROM categories");

        // Separate main categories
        const mainCategories = [
            { id: 1, name: "Vehicles", subcategories: [] },
            { id: 2, name: "Real Estate", subcategories: [] },
            { id: 3, name: "Retail", subcategories: [] }
        ];

        // Map categories into correct subcategories
        categoriesResult.rows.forEach(category => {
            if (["Cars", "Motorcycles"].includes(category.name)) {
                mainCategories[0].subcategories.push({ id: category.id, name: category.name }); // Vehicles
            } else if (["Apartments", "Houses"].includes(category.name)) {
                mainCategories[1].subcategories.push({ id: category.id, name: category.name }); // Real Estate
            } else {
                mainCategories[2].subcategories.push({ id: category.id, name: category.name }); // Retail
            }
        });

        res.json(mainCategories);
    } catch (err) {
        console.error("Error fetching categories:", err);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});


// fetch all products (listings)
router.post('/listings', authMiddleware, upload.single('image'), async (req, res) => {
    const { title, description, price, category } = req.body;
    const userId = req.user.id;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  
    try {
      const newListing = await pool.query(
        `INSERT INTO listings (title, description, price, category, user_id, image_url) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [title, description, price, category, userId, imageUrl]
      );
  
      res.status(201).json({ message: "Listing created", listing: newListing.rows[0] });
    } catch (err) {
      console.error("Error adding listing:", err);
      res.status(500).json({ error: "Server error adding listing" });
    }
  });

  router.get('/listings/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        `SELECT id, title, description, price, category, created_at, user_id FROM listings WHERE id = $1`, 
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Listing not found" });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error fetching listing:", error);
      res.status(500).json({ error: "Server error fetching listing" });
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

router.patch('/listings/:id', authMiddleware, async (req, res) => {
    const { title, description, price, category } = req.body;
    const listingId = req.params.id;
    const userId = req.user.id; // Get logged-in user ID from token

    try {
        const existingListing = await pool.query(
            "SELECT * FROM listings WHERE id = $1 AND user_id = $2", 
            [listingId, userId]
        );

        if (existingListing.rows.length === 0) {
            return res.status(403).json({ error: "Unauthorized: You can only edit your own listings." });
        }

        const updatedListing = await pool.query(
            `UPDATE listings SET title = $1, description = $2, price = $3, category = $4 
             WHERE id = $5 AND user_id = $6 RETURNING *`,
            [title, description, price, category, listingId, userId]
        );

        res.json({ message: "Listing updated successfully", listing: updatedListing.rows[0] });
    } catch (err) {
        console.error("Error updating listing:", err);
        res.status(500).json({ error: "Server error updating listing" });
    }
});

router.delete('/listings/:id', authMiddleware, async (req, res) => {
    const listingId = req.params.id;
    const userId = req.user.id; // Get logged-in user ID from token

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