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

// Fetch all listings (products, vehicles, real estate)
router.get('/listings', async (req, res) => {
    try {
        const products = await pool.query("SELECT id, name AS title, description, price, category_id AS category, created_at, user_id, image_url FROM products");
        const vehicles = await pool.query("SELECT id, name AS title, description, price, category_id AS category, created_at, user_id FROM vehicles");
        const realEstate = await pool.query("SELECT id, name AS title, description, price_per_month AS price, category_id AS category, created_at, user_id FROM real_estate");

        const listings = [...products.rows, ...vehicles.rows, ...realEstate.rows];
        res.json(listings);
    } catch (err) {
        console.error("Error fetching listings:", err);
        res.status(500).json({ error: "Server error fetching listings" });
    }
});

// Get all users
router.get('/users', authMiddleware, async (req, res) => {
    try {
      const result = await pool.query('SELECT id, name, email, status FROM users');
      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ error: "Server error fetching users" });
    }
  });
  
  // Update user status (e.g., ban/unban)
  router.patch('/users/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // expected status values: 'active', 'banned'
  
    if (!status || !['active', 'banned'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
  
    try {
      const result = await pool.query(
        'UPDATE users SET status = $1 WHERE id = $2 RETURNING id, name, email, status',
        [status, id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res.json({ message: "User status updated", user: result.rows[0] });
    } catch (err) {
      console.error("Error updating user status:", err);
      res.status(500).json({ error: "Server error updating user status" });
    }
  });
  
  // Delete a user
  router.delete('/users/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
  
    try {
      const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res.json({ message: "User deleted successfully" });
    } catch (err) {
      console.error("Error deleting user:", err);
      res.status(500).json({ error: "Server error deleting user" });
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

router.get('/listings/:id', async (req, res) => {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM listings WHERE id = $1', [id]);
    if (result.rows.length === 0) {
        return res.status(404).json({ error: "Listing not found" });
    }
    res.json(result.rows[0]);
});


// Update a listing
// Update a listing
router.patch('/listings/:id', authMiddleware, async (req, res) => {
    const { title, description, price, category, subcategory } = req.body;
    const listingId = req.params.id;
    const userId = req.user.id;

    console.log('Incoming Update Request Data:', req.body); // Log the data

    // Ensure category and subcategory are valid integers
    const categoryId = parseInt(category, 10);
    const subcategoryId = subcategory ? parseInt(subcategory, 10) : null;

    // Validate price and category
    if (isNaN(categoryId) || isNaN(price)) {
        return res.status(400).json({ error: "Invalid category, price, or subcategory value." });
    }

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
            [title, description, parseFloat(price), categoryId, subcategoryId, listingId, userId]
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