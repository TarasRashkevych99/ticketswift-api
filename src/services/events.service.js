require('dotenv').config();
const { getEvents, parseParams } = require('./ticketmaster.service');
const ngeohash = require('ngeohash');


async function fetchFromAPI(params = {}) {
    try {
        const url  = process.env.LOCAL_URL + '/events?' + parseParams(params);
        console.log(params);
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}

async function fetchById(id) {
    try {
        const url  = process.env.LOCAL_URL + '/events/' + id;
        console.log(url);
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}

async function getAllEvents(params = {}){
    try {
        let allEvents = [];
        
        return Promise.allSettled([getEvents(params), fetchFromAPI(params)]).then((results) =>
            results.forEach((result) => {
                if(result.value){
                    allEvents.push(...(result.value));
                }else{
                    console.log(result.reason);    
                } 
            }
            )).then(() => {
            return allEvents;
        });

    } catch (error) {
        console.error('Errore durante il recupero dei dati:', error);
        throw error;
    }
}

async function getEventById(id){
    try {
        const result = await Promise.any([getEvents({id:id}), fetchById(id)]);
        return result;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getAllEvents: getAllEvents,
    getAllEventById: getEventById,
};

// getAllEvents({lat: 45, lon:12, radius:500, genre:'music', subgenre:'rock', city:'Venice', from:'2024-01-24T13:33:00Z', to:'2024-03-24T13:33:00Z'}).then(result => {
//     console.log(result);
// });

// getEventById("6598050d26ea8961d656ef21").then(result => {
//     console.log(result);
// });

// getEventById("vvG1fZ9sdJAAly").then(result => {
//     console.log(result);
// });