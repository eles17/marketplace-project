require('dotenv').config();
const authMiddleware = require('./middleware/authMiddleware'); // Adds protected route
const express = require('express');
const cors = require('cors');
const pool = require('./config/db'); // Import existing database connection
const authRoutes = require('./routes/authRoutes'); // Import auth routes
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');
const http = require('http'); // For WebSocket server
const { Server } = require('socket.io'); // Import socket.io
const nodemailer = require('nodemailer'); // Import nodemailer for email notifications
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const errorHandler = require("./middleware/errorHandler");

// Updated Routes
const listingsRoutes = require('./routes/listingsRoutes');
const categoriesRoutes = require('./routes/categories/categoriesRoutes'); // Merged Main & Subcategory routes
const productsRoutes = require('./routes/categories/productsRoutes');
const vehiclesRoutes = require('./routes/categories/vehiclesRoutes');
const realEstateRoutes = require('./routes/categories/realEstateRoutes');

const app = express();
app.use(express.json());
app.use(cors());
app.use(compression()); // Enable GZIP compression
app.use(errorHandler); // Apply global error handling middleware

const apiLimiter = rateLimit({
    windowMS: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later."
});

// Email Notifications Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS // Your email password (app password for security)
    }
});

// Function to send email notifications
async function sendEmailNotification(receiver_id, message) {
    try {
        // Fetch the receiver email
        const userQuery = await pool.query("SELECT email FROM users WHERE id = $1", [receiver_id]);
        if (userQuery.rows.length === 0) return;

        const receiverEmail = userQuery.rows[0].email;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: receiverEmail,
            subject: "New Message Notification",
            text: `You have received a new message: "${message}". Login to reply.`
        };
        await transporter.sendMail(mailOptions);
        console.log(`Email notification sent to ${receiverEmail}`);
    } catch (err) {
        console.error("Error sending email notification:", err);
    }
}

// WebSocket Server Setup
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow frontend connection
        methods: ["GET", "POST"]
    }
});

// Handle WebSocket Connections
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // Store user connections
    socket.on('register', (userId) => {
        socket.userId = userId;
        console.log(`User ${userId} registered for real-time notifications.`);
    });

    // Handle incoming messages
    socket.on('send_message', async (data) => {
        const { sender_id, receiver_id, listing_id, message } = data;

        try {
            // Store message in DB
            const newMessage = await pool.query(
                "INSERT INTO messages (sender_id, receiver_id, listing_id, message, is_read) VALUES ($1, $2, $3, $4, FALSE) RETURNING *",
                [sender_id, receiver_id, listing_id, message]
            );
            // Emit message to receiver
            io.emit(`receive_message_${receiver_id}`, newMessage.rows[0]);

            // Check if user is online before sending email
            const sockets = await io.fetchSockets();
            const isOnline = sockets.some(socket => socket.userId === receiver_id);

            if (!isOnline) {
                sendEmailNotification(receiver_id, message);
            }
        } catch (err) {
            console.error("WebSocket Message Storage Error:", err);
        }
    });

    socket.on('mark_as_read', async (data) => {
        const { message_ids } = data;

        try {
            await pool.query(
                "UPDATE messages SET is_read = TRUE WHERE id = ANY($1::int[])",
                [message_ids]
            );
            console.log(`Messages Marked as Read: ${message_ids}`);
        } catch (err) {
            console.error("Mark As Read Error:", err);
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`User Disconnected: ${socket.id}`);
    });
});

// API Routes
app.use('/api/categories', categoriesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/real-estate', realEstateRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/", apiLimiter);

// Error Handling
app.use((err, req, res, next) => {
    if (err.code === "23505") { // Unique constraint violation
        err.message = "Duplicate entry detected.";
    } else if (err.code === "23503") { // Foreign key violation
        err.message = "Invalid reference. Ensure related data exists.";
    } else if (err.code === "23514") { // Check constraint violation
        err.message = "Invalid data format.";
    }

    next(err);
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});