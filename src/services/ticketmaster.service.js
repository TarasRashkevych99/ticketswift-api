function parseEvents(data) {
    let result = [];

    data = data['_embedded'];
    if (!data) return undefined;

    data['events'].forEach((event) => {
        if (event['_embedded']) {
            let id = event['id'];
            //var type = event['type'];
            let url = event['url'];

            //var sales = event['sales'];
            //check for TBA
            try {
                var startSaleTime = event['sales']['public']['startDateTime'];
                var endSaleTime = event['sales']['public']['endDateTime'];
            } catch (error) {
                var startSaleTime = 'TBA';
                var endSaleTime = 'TBA';
            }
            let startEventTime = event['dates']['start']['dateTime'];
            let status = event['dates']['status']['code'];

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

            let evento = {
                id: id,
                url: url,
                sale: {
                    start: startSaleTime,
                    end: endSaleTime,
                    status: status,
                },
                event_start: startEventTime,
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

function parseParams(params) {
    const query = Object.entries(params)
        .map(([key, value]) =>
            value !== undefined ? `${key}=${encodeURIComponent(value)}` : null
        )
        .filter(Boolean)
        .join('&');

    return query;
}

module.exports = { parseEvents, parseParams };
