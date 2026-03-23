/**
 * --------------------------------------------------------------------------
 * Local Weather Bid Adjuster — Google Ads Script for SMBs
 * --------------------------------------------------------------------------
 * Adjusts campaign budgets based on real-time weather conditions.
 * Uses OpenWeatherMap API to detect rain/snow and boost budgets
 * for weather-sensitive local businesses.
 *
 * Author:  Thibault Fayol — Consultant SEA PME
 * Website: https://thibaultfayol.com
 * License: MIT
 * --------------------------------------------------------------------------
 */

var CONFIG = {
  // -- General --
  TEST_MODE: true,                          // Set to false to apply changes
  EMAIL: 'contact@yourdomain.com',          // Alert recipient

  // -- Weather API --
  OPENWEATHER_API_KEY: 'INSERT_API_KEY_HERE',
  CITY: 'Montpellier,FR',                  // City name + country code

  // -- Campaign targeting --
  CAMPAIGN_NAME_CONTAINS: 'Local',          // Only touch campaigns matching this

  // -- Budget adjustment --
  BASE_BUDGET: 50.00,                       // Daily budget when weather is normal
  WEATHER_THRESHOLD: ['Rain', 'Snow', 'Drizzle', 'Thunderstorm'],
  BUDGET_MULTIPLIER: 1.3                    // Multiply budget by this during bad weather
};

function main() {
  try {
    if (CONFIG.OPENWEATHER_API_KEY === 'INSERT_API_KEY_HERE') {
      Logger.log('ERROR: Please set your OpenWeatherMap API key in CONFIG.');
      return;
    }

    var weather = fetchWeather_();
    if (!weather) return;

    var condition = weather.weather[0].main;
    var temp = (weather.main.temp - 273.15).toFixed(1); // Kelvin to Celsius
    Logger.log('Weather in ' + CONFIG.CITY + ': ' + condition + ' (' + temp + ' C)');

    var isBadWeather = CONFIG.WEATHER_THRESHOLD.indexOf(condition) >= 0;
    var targetBudget = isBadWeather
      ? CONFIG.BASE_BUDGET * CONFIG.BUDGET_MULTIPLIER
      : CONFIG.BASE_BUDGET;

    var today = Utilities.formatDate(new Date(), AdsApp.currentAccount().getTimeZone(), 'yyyy-MM-dd');
    var adjusted = [];

    var campIter = AdsApp.campaigns()
      .withCondition("Name CONTAINS_IGNORE_CASE '" + CONFIG.CAMPAIGN_NAME_CONTAINS + "'")
      .withCondition('Status = ENABLED')
      .get();

    while (campIter.hasNext()) {
      var camp = campIter.next();
      var currentBudget = camp.getBudget().getAmount();

      if (currentBudget !== targetBudget) {
        Logger.log(camp.getName() + ': budget ' + currentBudget + ' -> ' + targetBudget);
        if (!CONFIG.TEST_MODE) {
          camp.getBudget().setAmount(targetBudget);
        }
        adjusted.push(camp.getName() + ' (' + currentBudget + ' -> ' + targetBudget + ')');
      }
    }

    if (adjusted.length > 0) {
      var subject = 'Weather Budget Adjustment — ' + condition + ' in ' + CONFIG.CITY;
      var body = 'Date: ' + today + '\n'
        + 'Weather: ' + condition + ' (' + temp + ' C)\n'
        + 'Budget multiplier: ' + (isBadWeather ? CONFIG.BUDGET_MULTIPLIER : '1.0 (normal)') + '\n\n'
        + 'Campaigns adjusted:\n- ' + adjusted.join('\n- ');

      if (!CONFIG.TEST_MODE && CONFIG.EMAIL !== 'contact@yourdomain.com') {
        MailApp.sendEmail(CONFIG.EMAIL, subject, body);
      }
      Logger.log(subject + '\n' + body);
    } else {
      Logger.log('No budget changes needed.');
    }

  } catch (e) {
    Logger.log('FATAL ERROR: ' + e.message);
    if (!CONFIG.TEST_MODE && CONFIG.EMAIL !== 'contact@yourdomain.com') {
      MailApp.sendEmail(CONFIG.EMAIL, 'Weather Bid Adjuster — Error', e.message);
    }
  }
}

function fetchWeather_() {
  var url = 'https://api.openweathermap.org/data/2.5/weather?q='
    + encodeURIComponent(CONFIG.CITY)
    + '&appid=' + CONFIG.OPENWEATHER_API_KEY;
  try {
    var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (response.getResponseCode() !== 200) {
      Logger.log('Weather API error: HTTP ' + response.getResponseCode());
      return null;
    }
    return JSON.parse(response.getContentText());
  } catch (e) {
    Logger.log('Failed to fetch weather: ' + e.message);
    return null;
  }
}
