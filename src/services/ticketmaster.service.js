

function parseEvents(data){
    var result = [];
    
    data = data['_embedded'];
    if(!data)
      return undefined;
  
    data['events'].forEach(event => {
        if(event['_embedded']){
            var id = event['id'];
            //var type = event['type'];
            var url = event['url'];
    
            //var sales = event['sales'];
            //check for TBA
            try{
                var startSaleTime = event['sales']['public']['startDateTime'];
                var endSaleTime = event['sales']['public']['endDateTime'];
            }catch(error){
                var startSaleTime = "TBA";
                var endSaleTime = "TBA";
            }
            var startEventTime = event['dates']['start']['dateTime'];
            //var status = event['dates']['status']['code'];
    
            //get classifications
            var classifications = event['classifications'];
            var genre = classifications[0]?.['segment']?.['name'] ?? undefined;
            var subgenere = [classifications[0]?.['genre']?.['name'] ?? undefined]
            
            //get location
            location = event['_embedded']['venues'][0];
            
            var lid = location['id'];
            var lname = location['name'];
            var postalCode = location['postalCode'];
            var city = location['city']?.['name'] ?? undefined;
            var state = location['state']?.['name'] ?? undefined;
            var country = location['country']?.['name'] ?? undefined;
            var address = location['address']?.['name'] ?? undefined;
            var pos = location['location'];
    
            var evento = {
                "id": id,
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

function parseParams(params) {
    const query = Object.entries(params)
      .map(([key, value]) => (value !== undefined ? `${key}=${encodeURIComponent(value)}` : null))
      .filter(Boolean)
      .join('&');
  
    return query;
  }

module.exports = { parseEvents, parseParams };