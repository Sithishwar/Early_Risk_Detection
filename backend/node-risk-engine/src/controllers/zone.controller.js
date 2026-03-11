/**
 * In-memory zone store (replace with DB later)
 * Key: zoneId
 */
const zones = new Map();

/**
 * Upsert zone with patch (for video-derived or other updates)
 */
function upsertZone(zoneId, patch) {
  const existing = zones.get(zoneId) || { id: zoneId, densityHistory: [] };
  const next = {
    ...existing,
    ...patch,
    id: zoneId,
    densityHistory: existing.densityHistory || [],
  };
  zones.set(zoneId, next);
  return next;
}

/**
 * Get zones in format expected by HeatMap/ZoneCard: { id, count, risk }
 */
function getZonesForClient() {
  return Array.from(zones.values()).map((z) => ({
    id: z.id,
    count: Number(z.peopleCount ?? z.count ?? 0),
    risk: Number(z.risk ?? z.riskScore ?? 0),
  }));
}

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

  upsertZone(id, {
    peopleCount,
    zoneArea,
    prevPositions,
    currPositions,
    deltaTime,
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
  upsertZone,
  getZonesForClient,
};
