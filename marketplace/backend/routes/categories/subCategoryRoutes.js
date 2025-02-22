const express = require('express');
const router = express.Router();
const pool = require('../../config/db'); // Ensure database connection

// Get subcategories for a given main category
router.get('/:id', async (req, res) => {
    const mainCategoryId = parseInt(req.params.id, 10);

    if (isNaN(mainCategoryId)) {
        return res.status(400).json({ error: 'Invalid category ID' });
    }

    try {
        const subcategoriesQuery = `
            SELECT id, name 
            FROM categories 
            WHERE sub1_id = $1
            ORDER BY id;
        `;

        const { rows } = await pool.query(subcategoriesQuery, [mainCategoryId]);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching subcategories:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Export the router
module.exports = router;