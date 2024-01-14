const express = require('express');
const getAuthRouter = require('./auth.router');
const token = require('../../middlewares/token.middleware');
const getUserRouter = require('./users.router');
const getEventsRouter = require('./events.router');
const getLocationsRouter = require('./locations.router');
const getArtistsRouter = require('./artists.router');

module.exports = () => {
    const router = express.Router();
    router.use('/auth', getAuthRouter());
    router.use(token);
    //router.use("/users", getUserRouter());
    router.use('/events', getEventsRouter());
    router.use('/locations', getLocationsRouter());
    router.use('/artists', getArtistsRouter());

    return router;
};
