const { getEvents } = require("../../TicketmasterInterface");
const ngeohash = require('ngeohash');

// getEvents({ keyword:"bulls", size:"20"}).then(data => {
//     console.log(data);
// });

//Aggiungere provenienza dati

async function fetchFromAPI(params = {}) {
    const url  = "http://localhost:5000/api/events?" + parseParams(params);
    console.log(url);
    const response = await fetch(url);
    const data = await response.json();
    return data;
}



async function getAllEvents(params = {}){

    

    try {
        const external = await getEvents(paramsAdapter(params));
        //console.log(external);

        const local = await fetchFromAPI(params);
        //console.log(local);

        return [external, local];

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

function paramsAdapter(params){
    let newParams = {
        ...(params['lon'] && params['lat']) && {"locale=*&geoPoint": ngeohash.encode(params['lat'], params['lon'])},
        ...(params['radius']) && {"radius":params['radius']},
    }

    console.log(newParams);
    return newParams;
}

// paramsAdapter({lat: 45, lon:12});

getAllEvents({lat: 45, lon:12, radius:30}).then(result => {
    console.log(result);
});
