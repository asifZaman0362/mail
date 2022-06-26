const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const database = require('./database');

async function getPasswordHash(password) {
    if (password)
        return argon2.hash(password, argon2.defaults);
    else {
        console.error("Failed to compute hash: No password given!");
        return null;
    }
}

async function verifyPassword(username, usertype, password) {
    if (password) {
        const hash = database.get_user(username, usertype).password;
        return argon2.verify(hash, password, argon2.defaults);
    }
    else {
        console.error("Failed to verify password: Password is empty!");
        return null;
    }
}

async function generateToken(username, usertype) {
    const user = {
        username: username,
        usertype: usertype
    };
    return jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: '5184000s' });
}

async function checkAccess(req, res, next) {
    const token = req.cookies['jsonwebtoken'].split('=')[1];
    const accessLevel = req.session.accessMode;
    const tokenLevel = getAccessLevel(token);
    if (tokenLevel && tokenLevel == accessLevel) return next();
    else return res.status(401).redirect('/login?code=401');
}

async function getAccessLevel(token) {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    if (decoded) return decoded.usertype;
    else return null;
}

module.exports = {
    getAccessLevel,
    getPasswordHash,
    checkAccess,
    generateToken,
    verifyPassword
}