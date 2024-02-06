require('dotenv').config();
const ngeohash = require('ngeohash');
const axios = require('axios');
const cheerio = require('cheerio');
const { v4: uuidv4 } = require('uuid');

KEY = process.env.TICKETMASTER_KEY;

function parseEvents(data) {
    let result = [];

    if (!data['_embedded']) {
        throw new Error('no Ticketmaster events');
    }

    data = data['_embedded'];

    if (!data) return undefined;

    data['events'].forEach((event) => {
        if (event['_embedded']) {
            let id = event['id'];
            let url = event['url'];
            let name = event['name'];

            let image = event['images'].find((image) => {
                return image.width > 1000 && image.height > 500;
            });

            let startSaleTime;
            let endSaleTime;
            try {
                startSaleTime = event['sales']['public']['startDateTime'];
                endSaleTime = event['sales']['public']['endDateTime'];
            } catch (error) {
                startSaleTime = 'TBA';
                endSaleTime = 'TBA';
            }
            let startEventTime = event['dates']['start']['dateTime'];
            //var status = event['dates']['status']['code'];

            //get classifications
            let classifications = event['classifications'];
            let genre = classifications[0]?.['segment']?.['name'] ?? undefined;
            let subgenere = [
                classifications[0]?.['genre']?.['name'] ?? undefined,
            ];

            //get location
            location = event['_embedded']['venues'][0];

            let lid = location['id'];
            let lname = location['name'];
            let postalCode = location['postalCode'];
            let city = location['city']?.['name'] ?? undefined;
            let state = location['state']?.['name'] ?? undefined;
            let country = location['country']?.['name'] ?? undefined;
            let address = location['address']?.['name'] ?? undefined;
            let pos = location['location'];

            //TIcket generation
            let tickets = [];
            standardPrice = Math.floor(Math.random() * 125 + 25);
            tickets.push({
                name: 'Standard Ticket',
                availability: 50,
                price: standardPrice,
                id: uuidv4(),
            });
            if (Math.floor(Math.random() * 3) == 2) {
                tickets.push({
                    name: 'Premium Ticket',
                    availability: 50,
                    price: Math.floor(Math.random() * 125 + standardPrice),
                    id: uuidv4(),
                });
            }

            let evento = {
                id: id,
                name: name,
                url: url,
                image: image.url,
                tickets: tickets,
                saleStart: startSaleTime,
                saleEnd: endSaleTime,
                date: startEventTime,
                genre: genre,
                subgenre: subgenere,
                location: {
                    id: lid,
                    name: lname,
                    //"locale": locale,
                    ...(postalCode && { postal_code: postalCode }),
                    city: city,
                    ...(state && { state: state }),
                    country: country,
                    ...(address && { address: address }),
                    pos: pos,
                },
            };
            result.push(evento);
        }
    });
    //console.log(result);
    return result;
}

function parseGenre(data) {
    //console.log(data['_embedded']?.classifications[0]?.segment?.id);
    return data['_embedded']?.classifications[0]?.segment?.id ?? undefined;
}

function parseSubgenre(data, target) {
    //console.log(data['_embedded']?.classifications[0]?.segment?._embedded?.genres);
    try {
        let d =
            data['_embedded']?.classifications[0]?.segment?._embedded?.genres;
        //console.log(d);
        d = d.filter((item) => {
            //console.log(item?.name);
            return (item?.name).toLowerCase() == target.toLowerCase();
        });
        return d[0]?.id ?? undefined;
    } catch (error) {
        return undefined;
    }
}

async function getEvents(params = {}) {
    const eventRequestData = await paramsAdapter(params);
    const url =
        process.env.TICKETMASTER_URL +
        `/events.json?apikey=${KEY}&${parseParams(eventRequestData)}`;
    console.log(url);
    return fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Errore nella richiesta: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => parseEvents(data))
        .catch((error) => {
            console.error('Errore durante la chiamata API:', error.message);
            throw error;
        });
}

function getGenres(genre) {
    const url =
        process.env.TICKETMASTER_URL +
        '/classifications?apikey=znz4DMFouSRplIg0cgL6LU3jI5sshoqI&keyword=' +
        genre +
        '&locale=*';
    console.log(url);
    return fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Errore nella richiesta: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => parseGenre(data))
        .catch((error) => {
            console.error('Errore durante la chiamata API:', error.message);
            throw error;
        });
}

function getSubgenres(subgenre) {
    const url =
        process.env.TICKETMASTER_URL +
        '/classifications?apikey=znz4DMFouSRplIg0cgL6LU3jI5sshoqI&keyword=' +
        subgenre +
        '&locale=*';
    console.log(url);
    return fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Errore nella richiesta: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => parseSubgenre(data, subgenre))
        .catch((error) => {
            console.error('Errore durante la chiamata API:', error.message);
            throw error;
        });
}

function parseParams(params) {
    const query = Object.entries(params)
        .map(([key, value]) =>
            value !== undefined ? `${key}=${encodeURIComponent(value)}` : null
        )
        .join('&');
    return query;
}

async function paramsAdapter(params) {
    let newParams = {
        ...(params['lon'] &&
            params['lat'] && {
            'locale=*&geoPoint': ngeohash.encode(
                params['lat'],
                params['lon']
            ),
        }),
        ...(params['radius'] && { radius: params['radius'] }),
        ...(params['keyword'] && { keyword: params['keyword'] }),
        ...(params['genre'] && { segmentId: await getGenres(params['genre']) }),
        ...(params['subgenre'] && {
            genreId: await getSubgenres(params['subgenre']),
        }),
        ...(params['id'] && { id: params['id'] }),
        ...(params['from'] &&
            params['to'] && {
            startDateTime: params['from'],
            endDateTime: params['to'],
        }),
    };
    console.log(newParams);
    return newParams;
}

module.exports = { getEvents, parseParams };
