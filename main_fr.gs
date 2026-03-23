/**
 * --------------------------------------------------------------------------
 * Local Weather Bid Adjuster — Script Google Ads pour PME
 * --------------------------------------------------------------------------
 * Ajuste les budgets de campagne selon la meteo en temps reel.
 * Utilise l API OpenWeatherMap pour detecter pluie/neige et augmenter
 * les budgets des entreprises locales sensibles a la meteo.
 *
 * Auteur :  Thibault Fayol — Consultant SEA PME
 * Site :    https://thibaultfayol.com
 * Licence : MIT
 * --------------------------------------------------------------------------
 */

var CONFIG = {
  // -- General --
  TEST_MODE: true,                          // Passer a false pour appliquer
  EMAIL: 'contact@votredomaine.com',        // Destinataire des alertes

  // -- API Meteo --
  OPENWEATHER_API_KEY: 'VOTRE_CLE_API_ICI',
  CITY: 'Montpellier,FR',                  // Nom de ville + code pays

  // -- Ciblage campagnes --
  CAMPAIGN_NAME_CONTAINS: 'Local',          // Ne touche que les campagnes correspondantes

  // -- Ajustement budget --
  BASE_BUDGET: 50.00,                       // Budget quotidien par temps normal
  WEATHER_THRESHOLD: ['Rain', 'Snow', 'Drizzle', 'Thunderstorm'],
  BUDGET_MULTIPLIER: 1.3                    // Multiplicateur en cas de mauvais temps
};

function main() {
  try {
    if (CONFIG.OPENWEATHER_API_KEY === 'VOTRE_CLE_API_ICI') {
      Logger.log('ERREUR : Veuillez configurer votre cle API OpenWeatherMap dans CONFIG.');
      return;
    }

    var weather = fetchWeather_();
    if (!weather) return;

    var condition = weather.weather[0].main;
    var temp = (weather.main.temp - 273.15).toFixed(1);
    Logger.log('Meteo a ' + CONFIG.CITY + ' : ' + condition + ' (' + temp + ' C)');

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
        Logger.log(camp.getName() + ' : budget ' + currentBudget + ' -> ' + targetBudget);
        if (!CONFIG.TEST_MODE) {
          camp.getBudget().setAmount(targetBudget);
        }
        adjusted.push(camp.getName() + ' (' + currentBudget + ' -> ' + targetBudget + ')');
      }
    }

    if (adjusted.length > 0) {
      var subject = 'Ajustement Meteo Budget — ' + condition + ' a ' + CONFIG.CITY;
      var body = 'Date : ' + today + '\n'
        + 'Meteo : ' + condition + ' (' + temp + ' C)\n'
        + 'Multiplicateur : ' + (isBadWeather ? CONFIG.BUDGET_MULTIPLIER : '1.0 (normal)') + '\n\n'
        + 'Campagnes ajustees :\n- ' + adjusted.join('\n- ');

      if (!CONFIG.TEST_MODE && CONFIG.EMAIL !== 'contact@votredomaine.com') {
        MailApp.sendEmail(CONFIG.EMAIL, subject, body);
      }
      Logger.log(subject + '\n' + body);
    } else {
      Logger.log('Aucun changement de budget necessaire.');
    }

  } catch (e) {
    Logger.log('ERREUR FATALE : ' + e.message);
    if (!CONFIG.TEST_MODE && CONFIG.EMAIL !== 'contact@votredomaine.com') {
      MailApp.sendEmail(CONFIG.EMAIL, 'Weather Bid Adjuster — Erreur', e.message);
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
      Logger.log('Erreur API meteo : HTTP ' + response.getResponseCode());
      return null;
    }
    return JSON.parse(response.getContentText());
  } catch (e) {
    Logger.log('Impossible de recuperer la meteo : ' + e.message);
    return null;
  }
}
