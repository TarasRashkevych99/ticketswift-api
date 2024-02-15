const express = require('express');
const geolib = require('geolib');
const { getDbArtists } = require('../../services/artists.service');
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
    let validation = validationService.idSchema.safeParse(req.params.artistId);
    if (!validation.success) return res.status(400).send(validation.error);

    const artistId = req.params.artistId;

    try {
        const result = await getDbArtists({ _id: artistId });
        res.status(200).json(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = function () {
    const router = express.Router();

    router.get('/', getArtists);
    router.get('/:artistId', getArtistsById);

    return router;
};
