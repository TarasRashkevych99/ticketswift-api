const express = require('express');

function isUserAuthenticated(req, res) {
    res.status(200).send({ isAuthenticated: true });
}

module.exports = function () {
    const router = express.Router();

    router.get('/authenticated', isUserAuthenticated);

    return router;
};
