'use strict';
const rp = require('request-promise');
const ENDPOINT = 'http://api.songkick.com/api/3.0';

function Songkick() {
}

function processSongkickResponse(response) {
  return new Promise((resolve, reject) => {
    if (!response.body || !response.body.resultsPage) {
      return reject('Something went wrong connecting to Songkick');     
    }
    
    resolve(response.body.resultsPage.results);
  });
}

const centralEuropeLatLong = '49.6053670,13.7578640';
  
Songkick.prototype.searchSongkickForMetroArea = function(cityName) {
  return new Promise((resolve, reject) => {
    rp({
      method: 'GET',
      uri: `${ENDPOINT}/search/locations.json?query=${cityName}&location=geo:${centralEuropeLatLong}&apikey=${process.env.SONGKICK_API_KEY}`,
      resolveWithFullResponse: true,
      json: true
    })
    .then(processSongkickResponse)
    .then(response => response.location)
    .then(results => {
      if (!results || results.length <= 0) {
        return reject(`Couldnt find a match for the city name ${cityName} on Songkick`);
      }
        
      const allowedCountries = [
        'Albania',
        'Andorra',
        'Armenia',
        'Austria',
        'Azerbaijan',
        'Belarus',
        'Belgium',
        'Bosnia and Herzegovina',
        'Bulgaria',
        'Croatia',
        'Cyprus',
        'Czech Republic',
        'Denmark',
        'Estonia',
        'Finland',
        'France',
        'Georgia',
        'Germany',
        'Greece',
        'Hungary',
        'Iceland',
        'Ireland',
        'Italy',
        'Kazakhstan',
        'Latvia',
        'Liechtenstein',
        'Lithuania',
        'Luxembourg',
        'Macedonia',
        'Malta',
        'Moldova',
        'Monaco',
        'Montenegro',
        'Netherlands',
        'Norway',
        'Poland',
        'Portugal',
        'Romania',
        'San Marino',
        'Serbia',
        'Slovakia',
        'Slovenia',
        'Spain',
        'Sweden',
        'Switzerland',
        'Turkey',
        'Ukraine',
        'United Kingdom',
        'UK'
      ];
      
      // filter out only EU cities
      results = results.filter(item => allowedCountries.includes(item.metroArea.country.displayName));
      
      return resolve(results[0].metroArea);
    })
    .catch(error => {
      console.error(error);
      return reject(`Couldnt find a match for the city name ${cityName} on Songkick`)
    });
  });
}

Songkick.prototype.getSongkickEventForMetroArea = function(metroArea) {
  return new Promise((resolve, reject) => {
    rp({
      method: 'GET',
      uri: `${ENDPOINT}/metro_areas/${metroArea.id}/calendar.json?&apikey=${process.env.SONGKICK_API_KEY}`,
      resolveWithFullResponse: true,
      json: true
    })
    .then(processSongkickResponse)
    .then(response => response.event)
    .then(results => {
      if (!results || results.length <= 0) {
        return reject(`Couldnt find a match for the city name ${metroArea.displayName} on Songkick`);
      }
            
      return resolve(results);
    })
    .catch(error => {
      console.error(error);
      return reject(`Couldnt find a match for the city name ${metroArea.displayName} on Songkick`)
    });
  });
};

Songkick.prototype.getEventsByCity = function(cityName) {
  return this.searchSongkickForMetroArea(cityName).then(this.getSongkickEventForMetroArea);
};

module.exports = Songkick;