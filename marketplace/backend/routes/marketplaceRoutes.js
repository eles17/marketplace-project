const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const pool = require('../config/db');
const multer = require('multer');

const router = express.Router();

//protected route: get user's listings
router.get('/my-listings', authMiddleware, async (req, res) => {
    try {
        console.log("User Data from Token:", req.user); //debuging log

        const userId = req.user.id;
        if (!userId){
            return res.status(401).json({ message: "Unauthorized: No user ID found in token." });
        }

        //pagnation
        const page = parseInt(req.query.page) || 1; //default to page 1
        const limit = parseInt(req.query.limit) || 10; // default limit is 10 items per page
        const offset = (page - 1) * limit; // calculate offset for pagination

        //filters
        const {category_id, min_price, max_price, search} = req.query;
        let query = "SELECT * FROM products WHERE user_id = $1";
        let queryParams = [userId];

        if (category_id){
            query += " AND category_id = $" + (queryParams.length + 1);
            queryParams.push(category_id);
        }
        if (min_price){
            query += " AND price >= $" + (queryParams.length + 1);
            queryParams.push(min_price);
        }
        if (max_price){
            query += " AND price <= $" + (queryParams.length + 1);
            queryParams.push(max_price);
        }
        if (search){
            query += " AND (name ILIKE $" + (queryParams.length + 1) + " OR description ILIKE $" + (queryParams.length + 2) + ")";
            queryParams.push('%&{search}%' , '%&{search}%');
        }

        query += " ORDER BY created_at DESC LIMIT $" + (queryParams.length + 1) + " OFFSET $" + (queryParams.length + 2);
        queryParams.push(limit, offset);

        const listings = await pool.query(query, queryParams);
        
        res.json({page, limit, 
            total: listings.rowCount,
            listings: listings.rows
        });

    } catch (err){
        console.error("Fetch Listings Error:", err);
        res.status(500).json({ error: "Server error"});
    }
}) ;

// configuer image uploads
 const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'backend/uploads'); // save images in uplaods folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // unique filename
    }
 });

const upload = multer({ storage });

//protectcted rout: Add a new listing with image upload
router.post('/add-listing', authMiddleware, upload.single('image'), async (req, res) => {
    const { name, category_id, description, price, delivery_option, condition } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const newListing = await pool.query(
            "INSERT INTO products (user_id, category_id, name, description, price, delivery_option, condition, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
            [req.user.id, category_id, name, description, price, delivery_option, condition, imageUrl]
        );

        res.status(201).json({ message: "Listing created", listing: newListing.rows[0]});
    } catch (err){
        console.error("Add Listing Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;