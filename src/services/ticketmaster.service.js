

function parseEvents(data){
    let result = [];
    
    data = data['_embedded'];
    if(!data)
      return undefined;
  
    data['events'].forEach(event => {
        if(event['_embedded']){
            let id = event['id'];
            let url = event['url'];
            let name = event['name'];

            let startSaleTime
            let endSaleTime
            try{
                startSaleTime = event['sales']['public']['startDateTime'];
                endSaleTime = event['sales']['public']['endDateTime'];
            }catch(error){
                startSaleTime = "TBA";
                endSaleTime = "TBA";
            }
            let startEventTime = event['dates']['start']['dateTime'];
            //var status = event['dates']['status']['code'];
    
            //get classifications
            let classifications = event['classifications'];
            let genre = classifications[0]?.['segment']?.['name'] ?? undefined;
            let subgenere = [classifications[0]?.['genre']?.['name'] ?? undefined]
            
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
                "id": id,
                "name": name,
                "url": url,
                "saleStart": startSaleTime,
                "saleEnd": endSaleTime,
                "date": startEventTime,
                "genre": genre,
                "subgenre": subgenere,
                "location":{
                "id": lid,
                "name": lname,
                //"locale": locale,
                ...postalCode && {"postal_code": postalCode},
                "city": city,
                ...state && {"state": state},
                "country": country,
                ...address && {"address": address},
                "pos": pos
                }
            };
            result.push(evento);
        }

    });
    //console.log(result);
    return result;
}

function parseGenre(data){
    //console.log(data['_embedded']?.classifications[0]?.segment?.id);
    return data['_embedded']?.classifications[0]?.segment?.id ?? undefined;
}

function parseSubgenre(data, target){
    //console.log(data['_embedded']?.classifications[0]?.segment?._embedded?.genres);
    try {
        let d = data['_embedded']?.classifications[0]?.segment?._embedded?.genres;
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

function parseParams(params) {
    const query = Object.entries(params)
      .map(([key, value]) => (value !== undefined ? `${key}=${encodeURIComponent(value)}` : null))
      .filter(Boolean)
      .join('&');
  
    return query;
  }

module.exports = { parseEvents, parseParams, parseGenre, parseSubgenre };