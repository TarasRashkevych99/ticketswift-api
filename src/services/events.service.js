const { getEvents, getGenres, getSubgenres, parseParams } = require("./ticketmaster.service");
const ngeohash = require('ngeohash');


async function fetchFromAPI(params = {}) {
    try {
        const url  = "http://localhost:5000/api/events?" + parseParams(params);
        console.log(url);
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}

async function fetchById(id) {
    try {
        const url  = "http://localhost:5000/api/events/" + id;
        console.log(url);
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        throw error
    }
}

async function getAllEvents(params = {}){
    try {
        const external = await getEvents(await paramsAdapter(params));

        const local = await fetchFromAPI(params);

        return local.concat(external);

    } catch (error) {
        console.error('Errore durante il recupero dei dati:', error);
        throw error;
    }
}

async function getEventById(params){
    try {
        // const external = await getEvents(await paramsAdapter(params));

        // const local = await fetchById(params.id);

        //Questo metodo fa cagagare 
        return  await getEvents(await paramsAdapter(params)) ?? await fetchById(params.id);  
        
        // return Promise.any([getEvents(await paramsAdapter(params)), fetchById(params.id)])
        // .then(value => {
        //     return value
        // }).catch(error => {
        //     throw error;
        // });
    } catch (error) {
        throw error;
    }
}

async function paramsAdapter(params){
    let newParams = {
        ...(params['lon'] && params['lat']) && {"locale=*&geoPoint": ngeohash.encode(params['lat'], params['lon'])},
        ...params['radius'] && {"radius":params['radius']},
        ...params['keyword'] && {"keyword":params['keyword']},
        ...params['genre'] && {"segmentId": await getGenres(params['genre'])},
        ...params['subgenre'] && {"genreId": await getSubgenres(params['subgenre'])},
        ...params['id'] && {"id":params['id'] },
    }
    //console.log(newParams);
    return newParams;
}

// getAllEvents({lat: 45, lon:12, radius:500, genre:'music', subgenre:'rock', city:'Venice'}).then(result => {
//     console.log(result);
// });

getEventById({id:"6598050d26ea8961d656ef21"}).then(result => {
    console.log(result);
});

// getEventById({id:"vvG1fZ9sdJAAly"}).then(result => {
//     console.log(result);
// });