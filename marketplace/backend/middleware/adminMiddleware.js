module.exports = function (req, res, next) {
    if (!req.user) { // Handle missing user case
        return res.status(401).json({ message: "Unauthorized: No user data." });
    }
    if (!req.user.is_admin) {
        return res.status(403).json({ message: "Access denied. Admins only."});
    }
    next(); // if user is admin, continue
}