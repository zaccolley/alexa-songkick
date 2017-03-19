'use strict';
module.change_code = 1;
var Alexa = require('alexa-app');
var app = new Alexa.app('songkickconcertinfo');
var Songkick = require('./songkick');

function isEmpty(value) {
  if (value == null) {
    return true;
  }
  for (var key in value) {
    if (hasOwnProperty.call(value, key)) {
      return false;
    }
  }
  return true;
}

app.launch(function(req, res) {
  var prompt = 'For upcoming concerts, tell me a city name.';
  res.say(prompt).reprompt(prompt).shouldEndSession(false);
});

app.intent('songkickconcertinfo', {
  'slots': {
    'CITY': 'AMAZON.EUROPE_CITY'
  },
  'utterances': [
    '{|for} {events|gigs|concerts} in {-|CITY}'
  ]
},
  function(req, res) {
    console.log(req.data.request.intent);
    //get the slot
    var cityName = req.slot('CITY');
    var reprompt = 'Tell me a city name to get upcoming concerts.';
    if (isEmpty(cityName)) {
      var prompt = 'I didn\'t hear a city name. Tell me a city name.';
      res.say(prompt).reprompt(reprompt).shouldEndSession(false);
      return true;
    } else {
      const songkick = new Songkick();
      
      songkick.getEventsByCity(cityName).then(events => {
        // console.log(events);
        res.say(`The next upcoming gig in ${cityName} is ${events[0].displayName}`).send();
      }).catch(error => {
        console.error(error);
        var prompt = `I didn't have data for the city name ${cityName}. Tell me another city name.`;
        // https://github.com/matt-kruse/alexa-app/blob/master/index.js#L171
        res.say(prompt).reprompt(reprompt).shouldEndSession(false).send();
      });

      return false;
    }
  }
);

module.exports = app;