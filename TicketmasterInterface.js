const ngeohash = require('ngeohash');
const axios = require('axios');
const cheerio = require('cheerio');
const { parseEvents, parseParams, parseGenre, parseSubgenre } = require("./src/services/ticketmaster.service");

KEY = "znz4DMFouSRplIg0cgL6LU3jI5sshoqI";

// Price's scraping
async function getEventPrice(link) {
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


function getEvents(params = {}) {
  const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${KEY}&${parseParams(params)}`;
  console.log(url);
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Errore nella richiesta: ${response.status}`);
      }
      return response.json();
    })
    .then(data => parseEvents(data))
    .catch(error => {
      console.error('Errore durante la chiamata API:', error.message);
      throw error;
    });
}

function getGenres(genre){
  const url = "https://app.ticketmaster.com/discovery/v2/classifications?apikey=znz4DMFouSRplIg0cgL6LU3jI5sshoqI&keyword=" + genre + "&locale=*";
  console.log(url);
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Errore nella richiesta: ${response.status}`);
      }
      return response.json();
    })
    .then(data => parseGenre(data))
    .catch(error => {
      console.error('Errore durante la chiamata API:', error.message);
      throw error;
    }); 
}

function getSubgenres(subgenre){
  const url = "https://app.ticketmaster.com/discovery/v2/classifications?apikey=znz4DMFouSRplIg0cgL6LU3jI5sshoqI&keyword=" + subgenre + "&locale=*";
  console.log(url);
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Errore nella richiesta: ${response.status}`);
      }
      return response.json();
    })
    .then(data => parseSubgenre(data, subgenre))
    .catch(error => {
      console.error('Errore durante la chiamata API:', error.message);
      throw error;
    }); 
}


module.exports = {getEvents, getGenres, getSubgenres};


// getGenres("sport").then(data =>{
//   console.log(data);
// });

// getSubgenres("rock").then(data =>{
//   console.log(data);
// });
