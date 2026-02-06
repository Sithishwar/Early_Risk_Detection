const { calculateDensity } = require("./density.service");
const { calculateAverageSpeed } = require("./speed.service");
const { getDensityForecast } = require("./forecast.service");

/**
 * Computes final risk score for a zone
 * @param {Object} zone
 * @returns {Promise<Object>} zoneRiskResult
 */
async function computeZoneRisk(zone) {
  const {
    id,
    peopleCount,
    zoneArea,
    prevPositions,
    currPositions,
    deltaTime,
    densityHistory,
  } = zone;

  const density = calculateDensity(peopleCount, zoneArea);
  const speed = calculateAverageSpeed(
    prevPositions,
    currPositions,
    deltaTime
  );

  const forecastDensity = await getDensityForecast(id, densityHistory);

  // Weighted risk formula (tunable)
  const riskScore =
    0.5 * normalize(density) +
    0.3 * normalize(speed) +
    0.2 * normalize(forecastDensity ?? density);

  return {
    zoneId: id,
    density,
    speed,
    forecastDensity,
    riskScore: Math.min(riskScore, 1), // clamp
  };
}

/**
 * Normalizes value to 0–1 range
 */
function normalize(value, max = 10) {
  if (!value) return 0;
  return Math.min(value / max, 1);
}

module.exports = {
  computeZoneRisk,
};
