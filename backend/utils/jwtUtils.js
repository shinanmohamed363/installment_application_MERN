const jwt = require('jsonwebtoken');
const secretKey = require('../config/jwtconfig');

function generateToken(user) {
    const payload = {
        id : user.id,
        email : user.email,
        role : user.role
    }
    return jwt.sign(payload, secretKey, { expiresIn: '1h' });
}

module.exports = {
    generateToken
};