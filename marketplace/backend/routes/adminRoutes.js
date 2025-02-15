const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const pool = require('../config/db');

const router = express.Router();


// ban a user
router.put('/users/:id/ban', authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;

    try{
        await pool.query("UPDATE users SET is_banned = TRUE WHERE id = $1", [id]);
        res.json({message: "User has been banned."});
    } catch (err){
        console.error("Ban User Error:", err);
        res.status(500).json({ error: "Server error"})
    }
});

// unban user
router.put('/users/:id/unban', authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;

    try{
        await pool.query("UPDATE users SET is_banned = FALSE WHERE id = $1", [id]);
        res.json({message: "User has been unbanned."});
    } catch (err){
        console.error("Unban User Error:", err);
        res.status(500).json({ error: "Server error"})
    }
});

// get all users that are admins --> ADMINS ONLY
router.get('/users', authMiddleware, adminMiddleware, async(req, res) => {
    try{
        const users = await pool.query("SELECT id, email, full_name, is_admin, created_at FROM users");
        res.json(users.rows);
    }catch (err){
        console.error("Fetch Users Error:", err);
        res.status(500).json({ error:"Server error"});
    }
});

// update user role ---> MAKE AN ADMIN 
router.put('/users/:id/make-admin', authMiddleware, adminMiddleware, async(req,res) =>{
    const {id} = req.params;

    try{
        await pool.query("UPDATE users SET is_admin = TRUE WHERE id= $1", [id]);
        res.json({message: "User promoted to admin."});
    }catch (err){
        console.error("Update User Role Error:", err);
        res.status(500).json({ error:"Server error"});
    }
});

// DELETE USER
router.delete('/users/:id', authMiddleware, adminMiddleware, async(req,res) =>{
    const {id} = req.params;

    try{
        await pool.query("DELETE FROM users WHERE id = $1", [id]);
        res.json({message: "User deleted."});
    }catch (err){
        console.error("Delete User Error:", err);
        res.status(500).json({ error:"Server error"});
    }
});


// GET ALL LISTINGS --> Admins only
router.get('/listings', authMiddleware, adminMiddleware, async(req, res) => {    
    try{
    const listings = await pool.query("SELECT * FROM products ORDER BY created_at DESC");
    res.json(listings.rows);
}catch (err){
        console.error("Fetch Listings Error:", err);
        res.status(500).json({ error:"Server error"});
    }
});

// DELETE a listing
router.delete('/listings/:id', authMiddleware, adminMiddleware, async(req,res) =>{
    const {id} = req.params;

    try{
        await pool.query("DELETE FROM products WHERE id = $1", [id]);
        res.json({message: "Listing deleted."});
    }catch (err){
        console.error("Delete Listing Error:", err);
        res.status(500).json({ error:"Server error"});
    }
});

module.exports = router;