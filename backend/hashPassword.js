// hashPassword.js
const bcrypt = require('bcryptjs');

const plainPassword = 'password123';
const saltRounds = 10; // This should match the salt rounds used in your registration code

bcrypt.hash(plainPassword, saltRounds, function(err, hash) {
    if (err) {
        console.error("Error hashing password:", err);
        return;
    }
    console.log("Generated Hash:");
    console.log(hash);
});