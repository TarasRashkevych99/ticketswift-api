const express = require('express');
const token = require('../../middlewares/token.middleware');
const getAuthRouter = require('./auth.router');
const getUserRouter = require('./users.router');
const getEventsRouter = require('./events.router');
const getLocationsRouter = require('./locations.router');
const getArtistsRouter = require('./artists.router');
const getPurchasesRouter = require('./purchases.router');

module.exports = () => {
    const router = express.Router();
    router.use('/auth', getAuthRouter());
    router.use(token);
    router.use('/users', getUserRouter());
    router.use('/events', getEventsRouter());
    router.use('/locations', getLocationsRouter());
    router.use('/artists', getArtistsRouter());
    router.use('/purchases', getPurchasesRouter());

    return router;
};
