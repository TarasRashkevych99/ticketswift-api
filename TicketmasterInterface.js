const ngeohash = require('ngeohash');
const axios = require('axios');
const cheerio = require('cheerio');

KEY = "znz4DMFouSRplIg0cgL6LU3jI5sshoqI";

// Price's scraping
async function getEventPrice(link){
  //scrape
  let tickets = {
    "list": []
  };
  c = 0;

  axios.get(link)
  .then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);

    let temp = $('tbody[id="item"]');
    temp.find('tr').each(function (index, element) {
      if(c != 0){
        let seat = $(element).find('h3').html();
        let status = $(element).find('span').html();
        let price = $(element).children('td').last().text();
        tickets["list"].push({"seat":seat, "status":status, "price":price});
        console.log({"seat":seat, "status":status, "price":price})
      }
      c++;    
      return tickets;
    });
  })
  .catch((error) => {
    console.error('Error:', error.message);
  });
}

function parseEvents(data){
  var result = [];
  
  data = data['_embedded'];
  if(!data)
    return undefined;

  data['events'].forEach(event => {
    if(event['sales'] || event['_embedded']){
      var id = event['id'];
      var type = event['type'];
      var url = event['url'];

      //var sales = event['sales'];
      //check for TBA

      var startSaleTime = event['sales']['public']['startDateTime']
      var endSaleTime = event['sales']['public']['endDateTime'];
      var startEventTime = event['dates']['start']['dateTime'];
      var status = event['dates']['status']['code'];

      //get classifications
      var classifications = event['classifications'];

      //get location
      location = event['_embedded']['venues'][0];
      var lid = location['id'];
      var lname = location['name'];
      var locale = location['locale'];
      var postalCode = location['postalCode'];
      var city = location['city'];
      var state = location['state'];
      var country = location['country'];
      var address = location['address'];
      var pos = location['location'];


      var evento = {
          "id": id,
          "type": type,
          "url": url,
          "sale": {
              "start": startSaleTime,
              "end": endSaleTime,
              "status": status
          },
          "event_start": startEventTime,
          "classifications": classifications,
          "location":{
            "id": lid,
            "name": lname,
            "locale": locale,
            ...postalCode && {"postal_code": postalCode},
            "city": city,
            ...state && {"state": state},
            "country": country,
            ...address && {"address": address},
            "pos": pos
          }
      };
      //console.log(evento);
      result.push(evento);
    }else{
      //console.log("skip");
    }
  });

  return result;
}

function getEvents(keyword = "laura pausini", limit="20"){
  var url = "https://app.ticketmaster.com/discovery/v2/events.json?keyword=" + keyword + "&size=" + limit + "&apikey=" + KEY + "&locale=*&countryCode=" + countryCode;
  console.log(url);
  fetch(url)
    .then(response => {
      // Verifica se la risposta è OK (status code 200-299)
      if (!response.ok) {
        throw new Error(`Errore nella richiesta: ${response.status}`);
      }
      // Parsifica la risposta come JSON e restituiscila
      return response.json();
    })
    .then(data => {
      // Usa i dati ottenuti dalla chiamata API
      console.log(parseEvents(data));

    })
    .catch(error => {
      // Gestisci eventuali errori durante la chiamata
      console.error('Errore durante la chiamata API:', error.message);
    });
}

function getEventsByCountry(keyword = "laura pausini", countryCode="", limit="20"){
    var url = "https://app.ticketmaster.com/discovery/v2/events.json?keyword=" + keyword + "&size=" + limit + "&apikey=" + KEY + "&locale=*&countryCode=" + countryCode;
    console.log(url);
    fetch(url)
      .then(response => {
        // Verifica se la risposta è OK (status code 200-299)
        if (!response.ok) {
          throw new Error(`Errore nella richiesta: ${response.status}`);
        }
        // Parsifica la risposta come JSON e restituiscila
        return response.json();
      })
      .then(data => {
        // Usa i dati ottenuti dalla chiamata API
        console.log(parseEvents(data));

      })
      .catch(error => {
        // Gestisci eventuali errori durante la chiamata
        console.error('Errore durante la chiamata API:', error.message);
      });
}

function getEventsByLatLon(keyword, lat, lon, radius = 100){
  geoPoint = ngeohash.encode(lat, lon);
  console.log(geoPoint);
  var url = "https://app.ticketmaster.com/discovery/v2/events.json?keyword=" + keyword + "&apikey=" + KEY + "&unit=km&radius="+ radius +"&locale=*&geoPoint="+geoPoint;
  console.log(url);
  fetch(url)
    .then(response => {
      // Verifica se la risposta è OK (status code 200-299)
      if (!response.ok) {
        throw new Error(`Errore nella richiesta: ${response.status}`);
      }
      // Parsifica la risposta come JSON e restituiscila
      return response.json();
    })
    .then(data => {
      // Usa i dati ottenuti dalla chiamata API
      console.log(parseEvents(data));

    })
    .catch(error => {
      // Gestisci eventuali errori durante la chiamata
      console.error('Errore durante la chiamata API:', error.message);
    });
}

//getEventsByLatLon("laura pausini", 46, 11, 100);
// let res = getEventPrice("https://shop.ticketmaster.it/biglietti/acquista-biglietti-laura-pausini-world-tour-2023-2024-06-gennaio-2024-arena-spettacoli-fiera-di-padova-padova-5950.html")
// console.log(res);
