/**
 * --------------------------------------------------------------------------
 * local-weather-bid-adjuster - Google Ads Script for SMBs
 * --------------------------------------------------------------------------
 * Author: Thibault Fayol - Consultant SEA PME
 * Website: https://thibaultfayol.com
 * License: MIT
 * --------------------------------------------------------------------------
 */
var CONFIG = { TEST_MODE: true, WEATHER_API_KEY: "YOUR_API_KEY", LOCATION: "Paris", BAD_WEATHER_MULTIPLIER: 1.2 };
function main() {
    Logger.log("Weather Bid Adjuster: Need valid API Key to fetch weather for " + CONFIG.LOCATION);
    Logger.log("[TEST] Applying bid multiplier of " + CONFIG.BAD_WEATHER_MULTIPLIER + " during rain/snow.");
}
