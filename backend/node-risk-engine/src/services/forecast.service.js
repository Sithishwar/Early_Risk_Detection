const axios = require("axios");

const ML_SERVICE_URL = "http://localhost:8000/forecast";

/**
 * Fetches future crowd density prediction
 * @param {string} zoneId
 * @param {Array<number>} historicalDensities
 * @returns {Promise<number>} predictedDensity
 */
async function getDensityForecast(zoneId, historicalDensities) {
  try {
    const response = await axios.post(ML_SERVICE_URL, {
      zoneId,
      history: historicalDensities,
    });

    return response.data.predictedDensity;
  } catch (error) {
    console.error("Forecast service error:", error.message);
    return null; // graceful degradation
  }
}

module.exports = {
  getDensityForecast,
};
