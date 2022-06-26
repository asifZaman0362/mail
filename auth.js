const argon2 = require('argon2');
const database = require('./database');
const User = database.models.User;

async function getPasswordHash(password) {
    if (password)
        return argon2.hash(password, argon2.defaults);
    else {
        console.error("Failed to compute hash: No password given!");
        return null;
    }
}

async function verifyPassword(username, user_type, password) {
    if (password) {
        const hash = database.get_user(username, user_type).password;
        return argon2.verify(hash, password, argon2.defaults);
    }
    else {
        console.error("Failed to verify password: Password is empty!");
        return null;
    }
}