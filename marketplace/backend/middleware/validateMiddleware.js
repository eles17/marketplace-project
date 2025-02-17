const { body, validationResult } = require("express-validator")


exports.validateUserInput = [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('name').trim().escape(),
    body('description').trim().escape(),
    body('price').isFloat({ min: 0 }).withMessage('Invalid price format'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];