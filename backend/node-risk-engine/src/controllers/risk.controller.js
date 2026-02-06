const { computeZoneRisk } = require("../services/riskEngine.service");
const { getZoneById } = require("./zone.controller");

/**
 * Compute risk for a zone
 */
async function computeRisk(req, res) {
  const { zoneId } = req.params;

  const zone = getZoneById(zoneId);
  if (!zone) {
    return res.status(404).json({ error: "Zone not found" });
  }

  try {
    const result = await computeZoneRisk(zone);

    // Update density history
    zone.densityHistory.push(result.density);
    if (zone.densityHistory.length > 20) {
      zone.densityHistory.shift();
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error("Risk computation failed:", err.message);
    return res.status(500).json({ error: "Risk computation failed" });
  }
}

module.exports = {
  computeRisk,
};
