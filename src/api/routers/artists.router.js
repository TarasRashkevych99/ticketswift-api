const express = require('express');
const geolib = require('geolib');
const { getDbArtists } = require('../../services/database.service');
const validationService = require('../../services/validation.service');

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
    //Zod input validation
    let validation = validationService.idSchema.safeParse(req.params.eventId);
    if (!validation.success) return res.status(400).send(validation.error);

    const eventId = req.params.eventId;

    try {
        const result = await getDbArtists({ _id: eventId });
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
