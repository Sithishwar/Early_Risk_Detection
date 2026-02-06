/**
 * In-memory zone store (replace with DB later)
 * Key: zoneId
 */
const zones = new Map();

/**
 * Update zone state (called by detector / simulator)
 */
function updateZone(req, res) {
  const {
    id,
    peopleCount,
    zoneArea,
    prevPositions,
    currPositions,
    deltaTime,
  } = req.body;

  if (!id || zoneArea <= 0) {
    return res.status(400).json({ error: "Invalid zone data" });
  }

  zones.set(id, {
    id,
    peopleCount,
    zoneArea,
    prevPositions,
    currPositions,
    deltaTime,
    densityHistory: zones.get(id)?.densityHistory || [],
  });

  return res.status(200).json({ message: "Zone updated" });
}

/**
 * Fetch all zones
 */
function getZones(req, res) {
  return res.status(200).json(Array.from(zones.values()));
}

/**
 * Internal access for risk engine
 */
function getZoneById(zoneId) {
  return zones.get(zoneId);
}

module.exports = {
  updateZone,
  getZones,
  getZoneById,
};
