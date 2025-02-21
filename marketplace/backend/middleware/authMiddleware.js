const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(400).json({ message: "Invalid token format" });
        }

        const token = parts[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 

        if (decoded.is_banned) {
            return res.status(403).json({ message: "Your account has been banned." });
        }

        req.user = decoded; // Attach user data correctly
        next(); // Allow request to continue
    } catch (err) {
        console.error("JWT Verification Error:", err);
        return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
};