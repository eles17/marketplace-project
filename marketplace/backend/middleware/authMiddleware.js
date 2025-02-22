const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const authHeader = req.header("Authorization");

    // No token found in headers
    if (!authHeader) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(400).json({ message: "Invalid token format. Use 'Bearer <token>'" });
        }

        const token = parts[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // If user is banned, deny access
        if (decoded.is_banned) {
            return res.status(403).json({ message: "Your account has been banned. Contact support for assistance." });
        }

        req.user = decoded; // Attach user data
        next(); // Continue request

    } catch (err) {
        console.error("JWT Verification Error:", err);

        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Session expired. Please log in again." });
        } else if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid authentication token." });
        }

        return res.status(500).json({ message: "Internal server error." });
    }
};