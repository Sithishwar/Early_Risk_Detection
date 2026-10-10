const { calculateDensity } = require("./density.service");
const {
  calculateAverageSpeed,
  calculateAverageSpeedFromSeries,
} = require("./speed.service");
const { getDensityForecast } = require("./forecast.service");
const { RISK_WEIGHTS, MAX_DENSITY, MAX_SPEED } = require("../config/constants");

/** Normalises a value to the 0-1 range against a ceiling. */
function normalize(value, max) {
  if (!value || value < 0) return 0;
  return Math.min(value / max, 1);
}

/**
 * Computes the explainable weighted risk score for a zone:
 *   risk = 0.5*density + 0.3*movement + 0.2*forecast   (each normalised 0-1)
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
    frames,
  } = zone;

  const density = calculateDensity(peopleCount, zoneArea);

  // Prefer the full per-frame, track-id-tagged timeline (YOLO + ByteTrack
  // pipeline): matches the SAME person across every consecutive frame pair.
  // Falls back to the two-snapshot method for the manual/simulator path.
  const speed =
    Array.isArray(frames) && frames.length > 1
      ? calculateAverageSpeedFromSeries(frames)
      : calculateAverageSpeed(prevPositions, currPositions, deltaTime);

  const forecastDensity = await getDensityForecast(id, densityHistory);

  const riskScore =
    RISK_WEIGHTS.density * normalize(density, MAX_DENSITY) +
    RISK_WEIGHTS.speed * normalize(speed, MAX_SPEED) +
    RISK_WEIGHTS.forecast * normalize(forecastDensity ?? density, MAX_DENSITY);

  return {
    zoneId: id,
    density,
    speed,
    forecastDensity,
    riskScore: Math.min(riskScore, 1),
  };
}

module.exports = { computeZoneRisk };
