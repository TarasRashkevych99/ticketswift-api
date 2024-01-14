const express = require('express');
const usersService = require('../../services/users.service');
const tokenService = require('../../services/token.service');

async function login(req, res) {
    const valUser = Models.validateLoginUser(req.body);
    if (valUser.error) {
        return res.status(400).send(valUser.error);
    } else if (valUser.value) {
        const userInfo = await usersService.login(valUser.value);

        if (!userInfo) {
            return res.status(301).send(LANG.AUTH_WRONG_CREDENTIAL);
        }

        authHelpers.addAuthToResponse(res, {
            username: userInfo.user.username,
            _id: userInfo.id,
        });

        res.status(200).send({
            ...userInfo.user,
            token: res.getHeader('Authentication'),
        });
    }
}

async function signup(req, res) {
    // const valUser = Models.validateSignupUser(req.body);
    // if (valUser.error) {
    //     return res.status(400).send(valUser.error);
    // } else if (valUser.value) {
    //     const userInfo = await usersService.createUser(valUser.value);
    //     if (userInfo) {
    //         authHelpers.addAuthToResponse(res, {
    //             username: userInfo.user.username,
    //             _id: userInfo.id,
    //         });
    //         return res.status(201).send({
    //             ...userInfo.user,
    //             token: res.getHeader('Authentication'),
    //         });
    //     } else {
    //         res.status(403).send(LANG.AUTH_USERNAME_ALREADY_IN_USE);
    //     }
    // }

    const userInfo = await usersService.createUser(req.body);
    const token = tokenService.generateToken(userInfo);
    res.cookie('token', token, { httpOnly: true });
    req.session.user = userInfo;
    res.status(201).send(userInfo);
}

module.exports = function () {
    const router = express.Router();

    // router.post('/login', login);
    router.post('/signup', signup);

    return router;
};
