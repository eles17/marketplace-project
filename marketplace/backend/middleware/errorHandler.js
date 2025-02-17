const logger = require("./logger");

module.exports = (err, req, res, next) => {
    console.error("Server Error:", err);

    logger.error({
        message: err.message || "Internal Server Error",
        status: err.statusCode || 500,
        stack: err.stack
    });

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        error: err.message || "Internal Server Error"
    });
};