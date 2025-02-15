const express = require('express');
const authMiddleware= require('../middleware/authMiddleware');
const pool = require('../config/db');

const router = express.Router();

// send a message
router.post('/send', authMiddleware, async(req, res)=>{
    const {receiver_id, listing_id, message} = req.body;

    try{
        const newMessage = await pool.query(
            "INSERT INTO messages (sender_id, receiver_id, listing_id, message) VALUES ($1, $2, $3, $4) RETURNING *",
            [req.user.id, receiver_id, listing_id, message]
        );
        res.status(201).json({message: "Message sent.", chat: newMessage.rows[0]});
    }catch (err){
        console.error("Send Message Error:", err);
        res.status(500).json({error: "Server error"});
    }
});

//get message between two users
router.get('/conversation/:receiver_id', authMiddleware, async (req, res) =>{
    const { receiver_id} = req.params;

    try{
        const chatHistory = await pool.query(
            "SELECT * FROM messages WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1) ORDER BY created_at ASC",
            [req.user.id, receiver_id]
        );
        res.json(chatHistory.rows);
    } catch (err) {
        console.error("Fetch Conversation Error:", err);
        res.status(500).json({ error:"Server error"});
    }
});

//get messages for a specific listing
router.get('/listing/:listing_id', authMiddleware, async(req, res) =>{
    const {listing_id} = req.params;

    try{
        const listingMessages = await pool.query(
            "SELECT * FROM messages WHERE listing_id = $1 ORDER BY created_at ASC",
            [listing_id]
        );
    } catch (err){
        console.error("Fatch Listing Messages Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;