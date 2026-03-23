# Local Weather Bid Adjuster

> Google Ads Script for SMBs — Adjust campaign budgets based on real-time weather conditions.

## What it does

This script fetches current weather data from the OpenWeatherMap API and adjusts campaign daily budgets accordingly. When bad weather is detected (rain, snow, drizzle, thunderstorm), it multiplies the base budget by a configurable factor. When weather is normal, it restores budgets to their base value. An email alert is sent whenever budgets are changed.

## Setup

1. Open Google Ads > Tools > Scripts
2. Create a new script and paste the code from `main_en.gs` (or `main_fr.gs` for French)
3. Update the `CONFIG` block at the top (API key, city, campaign filter, budgets)
4. Authorize and run a preview first
5. Schedule: **Every hour** (weather changes frequently)

## CONFIG reference

| Parameter | Default | Description |
|-----------|---------|-------------|
| `TEST_MODE` | `true` | When true, logs changes without applying them |
| `EMAIL` | `contact@yourdomain.com` | Email address for budget change alerts |
| `OPENWEATHER_API_KEY` | `INSERT_API_KEY_HERE` | Your free OpenWeatherMap API key |
| `CITY` | `Montpellier,FR` | City and country code for weather lookup |
| `CAMPAIGN_NAME_CONTAINS` | `Local` | Only adjust campaigns whose name contains this string |
| `BASE_BUDGET` | `50.00` | Normal daily budget (currency units) |
| `WEATHER_THRESHOLD` | `['Rain','Snow','Drizzle','Thunderstorm']` | Weather conditions that trigger a budget boost |
| `BUDGET_MULTIPLIER` | `1.3` | Budget multiplier during bad weather (1.3 = +30%) |

## How it works

1. Calls the OpenWeatherMap current weather API for the configured city
2. Checks if the main weather condition matches any value in `WEATHER_THRESHOLD`
3. Calculates the target budget: `BASE_BUDGET * BUDGET_MULTIPLIER` (bad weather) or `BASE_BUDGET` (normal)
4. Iterates over enabled campaigns matching `CAMPAIGN_NAME_CONTAINS` and adjusts their daily budget
5. Sends an email summary of all adjusted campaigns

**Note:** This script adjusts the campaign daily budget (not bid modifiers), which is the reliable approach in Google Ads Scripts.

## Requirements

- Google Ads account with Scripts access
- Free OpenWeatherMap API key ([get one here](https://openweathermap.org/api))

## License

MIT — Thibault Fayol Consulting
