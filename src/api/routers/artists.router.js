const express = require('express');
const geolib = require('geolib');
const {
    client,
    ObjectId,
    getDbArtists,
} = require('../../services/database.service');

async function getArtists(req, res) {
    try {
        const result = await getDbArtists();
        res.status(200).json(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
}

async function getArtistsById(req, res) {
    const eventId = req.params.eventId;
    try {
        const result = await getDbArtists({ _id: new ObjectId(eventId) });
        res.status(200).json(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = function () {
    const router = express.Router();

    router.get('/', getArtists);
    router.get('/:eventId', getArtistsById);

    return router;
};
