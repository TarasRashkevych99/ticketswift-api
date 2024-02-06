const express = require('express');
const getRouters = require('./routers');

module.exports = () => {
    const router = express.Router();
    router.use('/', getRouters());
    return router;
};
