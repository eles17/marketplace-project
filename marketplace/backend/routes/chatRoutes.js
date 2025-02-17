const express = require('express');
const authMiddleware= require('../middleware/authMiddleware');
const pool = require('../config/db');

const router = express.Router();

//fetch uread messages
router.get('/unread', authMiddleware, async (req, res) => {
    try{
        const unreadMessages = await pool.query(
            "SELECT * FROM messages WHERE receiver_id = $1 AND is_read = FALSE ORDER BY created_at ASC",
            [req.user.id]
        );
        res.json(unreadMessages.rows);
    }catch (err) {
        next(err);
    }
});

router.put('/mark-as-read', authMiddleware, async(req,res) => {
    const {message_ids} = req.body;

    if(!message_ids || message_ids.length === 0){
        return res.status(400).json({error: "No messages provided."});
    }

    try{
        await pool.query(
            "UPDATE messages SET is_read = TRUE WHERE id = ANY($1::int[])",
            [message_ids]
        );
        console.log(`Messages marked as read: ${message_ids}`);
        res.json({message: "Messages marked as read."});
    } catch (err) {
        next(err);
    }
})

//get recent messages (optimized)
router.get('/recent/:receiver_id', authMiddleware, async(req, res) => {
    const { receiver_id } = req.params;
    const limit = parseInt(req.query.limit) || 10; // default: fetch last 10 messages

    try{
        const recentMessages = await pool.query(
            "SELECT id, sender_id, receiver_id, message, created_at FROM messages WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1) ORDER BY created_at DESC LIMIT $3",
            [req.user.id, receiver_id, limit]
        );
        res.json(recentMessages.rows);
    }catch (err){
        next(err);
    }
});

// send a message
router.post('/send', authMiddleware, async(req, res)=>{
    const {receiver_id, listing_id, message} = req.body;

    try{
        //validate that receiver exists
        const receiverExists = await pool.query("SELECT id FROM users WHERE id = $1", [receiver_id]); 
        if(receiverExists.rows.length === 0){
            return res.status(400).json({error: "Receiver does not exist."});
        }

        //validate that listing exists
        const listingExists = await pool.query("SELECT id FROM products WHERE id = $1", [listing_id]);
        if(listingExists.rows.length === 0){
            return res.status(400).json({error: "Listing does not exist."});
        }

        //insert message into DB
        const newMessage = await pool.query(
            "INSERT INTO messages (sender_id, receiver_id, listing_id, message) VALUES ($1, $2, $3, $4) RETURNING *",
            [req.user.id, receiver_id, listing_id, message]
        );
        res.status(201).json({message: "Message sent.", chat: newMessage.rows[0]});
    }catch (err){
        next(err);
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
        next(err);
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

        res.json(listingMessages.rows);
    } catch (err){
        next(err);
    }
});

module.exports = router;