/**
 * --------------------------------------------------------------------------
 * local-weather-bid-adjuster - Google Ads Script for SMBs
 * --------------------------------------------------------------------------
 * Author: Thibault Fayol - Consultant SEA PME
 * Website: https://thibaultfayol.com
 * License: MIT
 * --------------------------------------------------------------------------
 */

var CONFIG = {
  TEST_MODE: true,
  OPENWEATHER_API_KEY: "INSERT_API_KEY_HERE",
  CITY: "Montpellier,FR",
  CAMPAIGN_NAME_CONTAINS: "Local",
  BID_MULTIPLIER_RAIN: 1.2, // +20% during rain
  BID_MULTIPLIER_SUN: 1.0   // Reset to normal
};
function main() {
  if (CONFIG.OPENWEATHER_API_KEY === "INSERT_API_KEY_HERE") {
    Logger.log("Please insert your OpenWeatherMap API Key in CONFIG.");
    return;
  }
  var url = "https://api.openweathermap.org/data/2.5/weather?q=" + encodeURIComponent(CONFIG.CITY) + "&appid=" + CONFIG.OPENWEATHER_API_KEY;
  try {
    var response = UrlFetchApp.fetch(url);
    var weather = JSON.parse(response.getContentText());
    var condition = weather.weather[0].main; // e.g., 'Rain', 'Clear'
    Logger.log("Current weather in " + CONFIG.CITY + ": " + condition);
    
    var multiplier = (condition === "Rain" || condition === "Snow") ? CONFIG.BID_MULTIPLIER_RAIN : CONFIG.BID_MULTIPLIER_SUN;
    
    var campIter = AdsApp.campaigns().withCondition("Name CONTAINS_IGNORE_CASE '" + CONFIG.CAMPAIGN_NAME_CONTAINS + "'").withCondition("Status = ENABLED").get();
    while (campIter.hasNext()) {
        var camp = campIter.next();
        var currentAdj = camp.bidding().getBidModifier();
        if (currentAdj !== multiplier) {
            Logger.log("Adjusting " + camp.getName() + " multiplier to " + multiplier);
            if (!CONFIG.TEST_MODE) camp.bidding().setBidModifier(multiplier);
        }
    }
  } catch (e) {
    Logger.log("Error fetching weather: " + e.message);
  }
}