const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

function generateToken(userInfo) {
    const privateKey = fs.readFileSync(
        path.join(__dirname, '../../keys/private-key.pem')
    );
    const token = jwt.sign(userInfo, privateKey, {
        algorithm: 'ES384',
        expiresIn: process.env.TOKEN_EXPIRES_IN,
    });
    return token;
}

function verifyToken(token) {
    const publicKey = fs.readFileSync(
        path.join(__dirname, '../../keys/public-key.pem')
    );
    try {
        const userInfo = jwt.verify(token, publicKey, {
            algorithms: ['ES384'],
        });
        return userInfo;
    } catch (error) {
        return null;
    }
}

module.exports = { generateToken, verifyToken };
