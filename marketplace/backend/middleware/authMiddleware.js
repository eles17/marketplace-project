const jwt = require('jsonwebtoken');

module.exports = function(req, res, next){
    const authHeader = req.header("Authorization"); // Read token from request headers

    if (!authHeader){
        return res.status(401).json({message: "Access denied. No token provided."});
    } 
    
    try{ // Verify token -- expected "Beatet <token>"
        const token = authHeader.split(" ")[1];//extract token after "Bearer"

        if (!token){
            return res.statur(400).json({ message: "Invalid token format"});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        //check if user is banned
        if (decoded.is_banned){
            return res.status(403).json({message: "our account has been banned."});
        }

        req.user = decoded; // Attach user data to request
        next(); // proceed to next middleware or route handlar ---continues processing the request
    } catch (err){
        res.status(400).json({ message: "Invalid token"});
    }
};