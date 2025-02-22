require('dotenv').config();
const authMiddleware = require('./middleware/authMiddleware'); // adds protected route
const express = require('express');
const cors = require('cors');
const pool = require('./config/db'); // import exsisting databes connection (already decleared in db.js)
const authRoutes = require('./routes/authRoutes'); // import auth routes
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');
const http = require('http'); //fro websocket server
const { Server } = require('socket.io'); // import socket.io
const nodemailer = require('nodemailer'); // import nodemailer for emial notifications
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const errorHandler = require("./middleware/errorHandler");
const listingsRoutes = require('./routes/listingsRoutes');
const mainCategoryRoutes = require('./routes/categories/mainCategoryRoutes');
const subCategoryRoutes = require('./routes/categories/subCategoryRoutes');


const app = express();
app.use(express.json());
app.use(cors());
/*app.use(cors({
    origin: 'http://localhost:4200', // Allow requests from your frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed methods
    credentials: true // Allow cookies & authentication headers
}));*/
app.use(compression()); // enable GZIP compression
app.use(errorHandler); // apply global error handling middleware

const apiLimiter = rateLimit({
    windowMS: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later."
});



const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, //your email
        pass: process.env.EMAIL_PASS //your email password (app password for security)
    }
});

// function to send email notification
async function sendEmailNotification(receiver_id, message){
    try{
        //fetch the receiver email
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
    }catch (err){
        console.error("Error sending email notification:", err);
    }
};

//websocket server setup
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // allow frontend connection
        methods: ["GET", "POST"]
    }
});

//handle websocket connections
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    //store user connections
    socket.on('register', (userId) =>{
        socket.userId = userId;
        console.log(`User ${userId} registered for real-time notifications.`);
    });

    // handle incoming messages
    socket.on('send_message', async(data) =>{
        const {sender_id, receiver_id, listing_id, message } = data;

        try{
            // store message in DB
            const newMessage = await pool.query(
                "INSERT INTO messages (sender_id, receiver_id, listing_id, message, is_read) VALUES ($1, $2, $3, $4, FALSE) RETURNING *",
                [sender_id, receiver_id, listing_id, message]
            );
            //emit message to receiver
            io.emit(`receive_message_${receiver_id}`, newMessage.rows[0]);

            //check if user is online before sending email
            const sockets = await io.fetchSockets();
            const isOnline = sockets.some(socket => socket.userId === receiver_id);

            if(!isOnline){
                sendEmailNotification(receiver_id, message);
            }
        }catch (err){
            console.error("WebSocket Message Storage Error:", err);
        }
    });

    socket.on('mark_as_read', async (data) =>{
        const {message_ids} = data;

        try{
            await pool.query(
                "UPDATE messages SET is_read = TRUE WHERE id = ANY($1::int[])",
                [message_ids]
            );
            console.log(`Messages Marked as Read: ${message_ids}`);
        } catch (err){
            console.error("Mark As Read Error:", err);
        }
    });

    //handle disconnection
    socket.on('disconnect', () => {
        console.log(`User Disconnected: ${socket.id}`);
    });
});


// test route
app.get('/', (req,res) =>{
    res.send('Backend is working! PostgresSQL is connected.');
});

app.get('/api/protected', authMiddleware, (req, res) => {
    res.json({
        message: "This is a protected route!",
        user: req.user 
    })
});



app.use('/api/categories', mainCategoryRoutes);

app.use('/api/subcategories', subCategoryRoutes);

app.use('/api', listingsRoutes);

app.use('/api/marketplace', marketplaceRoutes);

app.use('/api/chat', chatRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/auth', authRoutes);

app.use("/api/", apiLimiter);

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

//Start server
const PORT= process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
