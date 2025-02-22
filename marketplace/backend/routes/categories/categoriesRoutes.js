const express = require('express');
const router = express.Router();
const pool = require('../../config/db'); // Database connection

// Get all main categories with their subcategories
router.get('/', async (req, res) => {
    try {
        const categoriesQuery = `
            SELECT c1.id, c1.name, 
                   COALESCE(json_agg(json_build_object('id', c2.id, 'name', c2.name)) FILTER (WHERE c2.id IS NOT NULL), '[]'::json) AS subcategories
            FROM categories c1
            LEFT JOIN categories c2 ON c1.id = c2.sub1_id
            WHERE c1.sub1_id IS NULL
            GROUP BY c1.id, c1.name
            ORDER BY c1.id;
        `;

        const { rows } = await pool.query(categoriesQuery);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get subcategories for a given main category
router.get('/:id/subcategories', async (req, res) => {
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