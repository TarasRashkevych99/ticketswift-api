const express = require('express');
const geolib = require('geolib');
const { getDbEvents, getDbEvent } = require('../../services/database.service');
const ticketmaster = require('../../services/ticketmaster.service');
const validationService = require('../../services/validation.service');

async function getEvents(req, res){
    //Zod input validation
    let validation = validationService.paramsSchema.safeParse(req.query);
    if (!validation.success) return res.status(400).send(validation.error);

    try {
        if(req.query.local == 'true'){
            let result =  await getLocalEvents(req, res);
            res.status(200).json(result);
        }else{
            let allEvents = [];

            return Promise.allSettled([ticketmaster.getEvents(req.query), getLocalEvents(req, res)]).then((results) =>
                results.forEach((result) => {
                    if(result.value){
                        allEvents.push(...(result.value));
                    }else{
                        console.log(result.reason);    
                    } 
                }
                )).then(() => {
                return res.status(200).json(allEvents);
            });

        }
    } catch (error) {
        console.error('Errore durante il recupero dei dati:', error);
        res.status(500).send('Internal Server Error');
    }
  
}

async function getLocalEvents(req, res) {

    const lat = req.query['lat'];
    const lon = req.query['lon'];
    let radius = req.query['radius'] ?? 100;
    let keyword = req.query['keyword'];
    let genre = req.query['genre'];
    let subgenere = req.query['subgenre'];
    let from = req.query['from'];
    let to = req.query['to'];

    let query = {
        ...(keyword && { name: { $regex: new RegExp(keyword, 'i') } }),
        ...(genre && { genre: { $regex: new RegExp(genre, 'i') } }),
        ...(subgenere && { subgenere: { $regex: new RegExp(subgenere, 'i') } }),
        ...(from && !to && { date: { $gt: new Date(from) } }),
        ...(from &&
            to && { date: { $gte: new Date(from), $lte: new Date(to) } }),
    };
    console.log(query);
    // try {
    let result = await getDbEvents(query);

    if (lat && lon) {
        //filter by position
        const userLocation = {
            latitude: parseFloat(lat),
            longitude: parseFloat(lon),
        };

        result = result.filter((event) => {
            const eventLocation = event['coordinates'];
            const distance = geolib.getDistance(
                userLocation,
                eventLocation
            );
            const distanceInKm = geolib.convertDistance(distance, 'km');
            console.log(
                'DISTANCE => ' + distanceInKm + ' RANGE => ' + radius
            );
            return distanceInKm <= parseFloat(radius);
        });
    }
    return result;
}

async function getEventById(req, res){
    //Zod input validation
    let validation = validationService.idSchema.safeParse(req.params.eventId);
    if (!validation.success) return res.status(400).send(validation.error);

    const eventId = req.params.eventId;
    
    try {
        const result = await Promise.any([ticketmaster.getEvents({id:eventId, locale:'*'}), getDbEvents({ _id: eventId })]);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }

}

async function getTickets(req, res) {
    //Zod input validation
    let validation = validationService.idSchema.safeParse(req.params.eventId);
    if (!validation.success) return res.status(400).send(validation.error);

    const eventId = req.params.eventId;

    try {
        const result = await getDbEvents({ _id: eventId });
        let first = result[0];
        res.status(200).json(first['tickets']);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = function () {
    const router = express.Router();

    router.get('/', getEvents);
    router.get('/:eventId', getEventById);
    router.get('/:eventId/tickets', getTickets);

    return router;
};
