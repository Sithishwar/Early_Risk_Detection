const axios = require("axios");
const env = require("../config/env");

function forecastUrl() {
  return `${String(env.ML_SERVICE_URL).replace(/\/+$/, "")}/forecast/`;
}

/**
 * Fetches a future crowd-density prediction from the Python ML service.
 * @param {string} zoneId
 * @param {Array<number>} historicalDensities
 * @returns {Promise<number|null>} predictedDensity (null = degrade gracefully)
 */
async function getDensityForecast(zoneId, historicalDensities) {
  if (!Array.isArray(historicalDensities) || historicalDensities.length === 0) {
    return null;
  }
  try {
    const response = await axios.post(
      forecastUrl(),
      { zoneId, history: historicalDensities },
      { timeout: 8000 }
    );
    return response.data.predictedDensity;
  } catch (error) {
    console.error("Forecast service error:", error.message);
    return null;
  }
}

module.exports = { getDensityForecast };
