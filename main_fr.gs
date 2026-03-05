/**
 * --------------------------------------------------------------------------
 * local-weather-bid-adjuster - Google Ads Script for SMBs
 * --------------------------------------------------------------------------
 * Author: Thibault Fayol - Consultant SEA PME
 * Website: https://thibaultfayol.com
 * License: MIT
 * --------------------------------------------------------------------------
 */
var CONFIG = { TEST_MODE: true, WEATHER_API_KEY: "VOTRE_CLE_API", LOCATION: "Paris", BAD_WEATHER_MULTIPLIER: 1.2 };
function main() {
    Logger.log("Weather Bid Adjuster: Nécessite une clé API valide pour la météo de " + CONFIG.LOCATION);
    Logger.log("[TEST] Application d'un multiplicateur de " + CONFIG.BAD_WEATHER_MULTIPLIER + " pendant la pluie/neige.");
}
