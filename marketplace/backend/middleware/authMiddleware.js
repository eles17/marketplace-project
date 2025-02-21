const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET || 'yourSecretKey'; 

module.exports = function(req, res, next){
    const authHeader = req.header("Authorization"); // Read token from request headers

    if (!authHeader){
        return res.status(401).json({message: "Access denied. No token provided."});
    } 
    
    try{ // Verify token -- expected "Beatet <token>"
        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(400).json({ message: "Invalid token format" }); // Fix typo (statur → status)
        }

        const token = parts[1]; // Extract token after "Bearer"
        const decoded = jwt.verify(token, secretKey); // Verify JWT token

        // Check if user is banned
        if (decoded.is_banned) {
            return res.status(403).json({ message: "Your account has been banned." });
        }

        req.user = decoded; // Attach user data to request
        next(); // Continue request processing
    } catch (err) {
        console.error("JWT Verification Error:", err);
        return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
};