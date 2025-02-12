const jwt = require('jsonwebtoken');

module.exports = function(req, res, next){
    const token = req.header("Authorization"); // Read token from request headers

    if (!token){
        return res.status(401).json({message: "Access denied. No token provided."});
    } 
    try{ // Verify token -- expected "Beatet <token>"
        const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
        req.user = decoded; // Attach user data to request
        next(); // proceed to next middleware or route handlar ---continues processing the request
    } catch (err){
        res.status(400).json({ message: "Invalid token"});
    }
};