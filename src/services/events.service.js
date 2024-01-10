const { getEvents, getGenres, getSubgenres } = require("../../TicketmasterInterface");
const ngeohash = require('ngeohash');


async function fetchFromAPI(params = {}) {
    const url  = "http://localhost:5000/api/events?" + parseParams(params);
    console.log(url);
    const response = await fetch(url);
    const data = await response.json();
    return data;
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

function parseParams(params) {
    const query = Object.entries(params)
      .map(([key, value]) => (value !== undefined ? `${key}=${encodeURIComponent(value)}` : null))
      .filter(Boolean)
      .join('&');
  
    return query;
}

async function paramsAdapter(params){
    let newParams = {
        ...(params['lon'] && params['lat']) && {"locale=*&geoPoint": ngeohash.encode(params['lat'], params['lon'])},
        ...params['radius'] && {"radius":params['radius']},
        ...params['keyword'] && {"keyword":params['keyword']},
        ...params['genre'] && {"segmentId": await getGenres(params['genre'])},
        ...params['subgenre'] && {"genreId": await getSubgenres(params['subgenre'])},
    }

    //console.log(newParams);
    return newParams;
}

getAllEvents({lat: 45, lon:12, radius:500, genre:'music', subgenre:'rock', city:'Venice'}).then(result => {
    console.log(result);
});
