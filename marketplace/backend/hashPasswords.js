const bcrypt = require('bcrypt');

async function generateHash(password) {
    const saltRounds = 10; // Must match your backend bcrypt configuration
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log(`Hashed password for "${password}": ${hashedPassword}`);
}

// Replace with the passwords you need to hash
generateHash("admin123");
generateHash("seller123");
generateHash("buyer123");
