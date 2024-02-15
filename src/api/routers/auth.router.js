const express = require('express');
const usersService = require('../../services/users.service');
const tokenService = require('../../services/tokens.service');
const validationService = require('../../services/validation.service');

async function login(req, res) {
    //Zod input validation
    let validation = validationService.signupSchema.safeParse(req.body);
    //if (!validation.success) return res.status(400).send(validation.error);
    const userInfo = await usersService.getAuthenticatedUser(req.body);

    if (!userInfo) {
        return res.status(401).send('Invalid username or password');
    }

    const token = tokenService.generateToken(userInfo);

    res.cookie('token', token, { httpOnly: true, maxAge: 30 * 60 * 1000 });
    req.session.user = userInfo;

    res.status(200).send(userInfo);
}

async function signup(req, res) {
    //Zod input validation
    let validation = validationService.signupSchema.safeParse(req.body);
    //if (!validation.success) return res.status(400).send(validation.error);
    try {
        const userInfo = await usersService.createUser(req.body);

        if (!userInfo) {
            return res.status(400).send('Username already in use');
        }

        const token = tokenService.generateToken(userInfo);

        res.cookie('token', token, { httpOnly: true, maxAge: 1000 * 60 * 60 });
        req.session.user = userInfo;
        res.status(201).send(userInfo);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = function () {
    const router = express.Router();

    router.post('/login', login);
    router.post('/signup', signup);

    return router;
};
