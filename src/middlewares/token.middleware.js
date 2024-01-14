const jwt = require('jsonwebtoken');
const tokenService = require('../services/token.service');
const e = require('express');

function token(req, res, next) {
    if (req.method === 'OPTIONS') {
        next();
        return;
    }
    const token = req.cookies['token'];
    if (token) {
        try {
            res.locals = tokenService.verifyToken(token);
            next();
            return;
        } catch (err) {
            res.status(301).send(err.message);
        }
    } else {
        res.status(301).send('No token provided');
    }
}

module.exports = token;
