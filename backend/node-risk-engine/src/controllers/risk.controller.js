const { computeZoneRisk } = require("../services/riskEngine.service");
const { getZoneById, pushRiskHistory } = require("./zone.controller");
const { DENSITY_WINDOW_SIZE } = require("../config/constants");

/**
 * Compute risk for a zone (on-demand, e.g. after a manual /api/zones update)
 */
async function computeRisk(req, res) {
  const { zoneId } = req.params;

  const zone = getZoneById(zoneId);
  if (!zone) {
    return res.status(404).json({ error: "Zone not found" });
  }

  try {
    const result = await computeZoneRisk(zone);

    zone.densityHistory.push(result.density);
    if (zone.densityHistory.length > DENSITY_WINDOW_SIZE) {
      zone.densityHistory.shift();
    }
    pushRiskHistory(zoneId, { at: Date.now(), risk: Number(result.riskScore.toFixed(3)) });

    return res.status(200).json(result);
  } catch (err) {
    console.error("Risk computation failed:", err.message);
    return res.status(500).json({ error: "Risk computation failed" });
  }
}

module.exports = {
  computeRisk,
};
