const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const pool = require('../config/db');

const router = express.Router();


// ban a user
router.put('/users/:id/ban', authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;

    try{
        const result = await pool.query("UPDATE users SET is_banned = TRUE WHERE id = $1 RETURNING id, email, is_banned", [id]);

        if (result.rowCount === 0) {
            return next({ statusCode: 404, message: "User not found." }); 
        }

        res.json({ message: "User banned successfully.", user: result.rows[0] });
    } catch (err) {
        next(err)
    }
});

// unban user
router.put('/users/:id/unban', authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;

    try{
        const result = await pool.query("UPDATE users SET is_banned = FALSE WHERE id = $1 RETURNING id, email, is_banned", [id]);

        if (result.rowCount === 0) {
            return next({ statusCode: 404, message: "User not found." });
        }

        res.json({ message: "User unbanned successfully.", user: result.rows[0] });
    } catch (err) {
        next(err);
    }
});

// get all users that are admins --> ADMINS ONLY
router.get('/users', authMiddleware, adminMiddleware, async(req, res) => {
    try{
        const users = await pool.query("SELECT id, email, full_name, is_admin, is_banned FROM users");
        res.json(users.rows);
    }catch (err){
        next(err);
    }
});

// update user role ---> MAKE AN ADMIN 
router.put('/users/:id/make-admin', authMiddleware, adminMiddleware, async(req,res) =>{
    const {id} = req.params;

    try{
        const result = await pool.query("UPDATE users SET is_admin = TRUE WHERE id = $1 RETURNING id, email, is_admin", [id]);
        
        if (result.rowCount === 0){
            return next({ statusCode: 404, message: "User not found." });
        }

        res.json({message: "User promoted to admin.", user: result.rows[0]});
    }catch (err){
        next(err);
    }
});

// DELETE USER
router.delete('/users/:id', authMiddleware, adminMiddleware, async(req,res) =>{
    const {id} = req.params;

    try{
        const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);

        if (result.rowCount === 0){
            return next({ statusCode: 404, message: "User not found." });
        }

        res.json({message: "User deleted."});
    }catch (err){
        next(err);
    }
});


// GET ALL LISTINGS --> Admins only
router.get('/listings', authMiddleware, adminMiddleware, async(req, res) => {    
    try{
    const listings = await pool.query("SELECT * FROM products ORDER BY created_at DESC");
    res.json(listings.rows);
}catch (err){
        next(err);
    }
});

// DELETE a listing
router.delete('/listings/:id', authMiddleware, adminMiddleware, async(req,res) =>{
    const {id} = req.params;

    try{
        const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING id", [id]);

        if (result.rowCount === 0) {
            return next({ statusCode: 404, message: "User not found." });
        }

        res.json({ message: "Listing deleted successfully." });
    } catch (err) {
        next(err);
    }
});

module.exports = router;