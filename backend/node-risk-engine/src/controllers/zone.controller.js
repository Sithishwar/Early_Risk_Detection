const { MAX_RISK_HISTORY, LEVEL_MEDIUM, LEVEL_HIGH } = require("../config/constants");

/**
 * In-memory zone store (replace with a DB later)
 * Key: zoneId, e.g. "R2C3"
 */
const zones = new Map();

function riskLevelFromScore(score) {
  const s = Number(score ?? 0);
  if (s >= LEVEL_HIGH) return "HIGH";
  if (s >= LEVEL_MEDIUM) return "MEDIUM";
  return "LOW";
}

/**
 * Upsert zone with patch (for video-derived or other updates)
 */
function upsertZone(zoneId, patch) {
  const existing = zones.get(zoneId) || { id: zoneId, densityHistory: [], riskHistory: [] };
  const next = {
    ...existing,
    ...patch,
    id: zoneId,
    densityHistory: existing.densityHistory || [],
    riskHistory: existing.riskHistory || [],
  };
  zones.set(zoneId, next);
  return next;
}

/** Append a point to a zone's bounded risk history. */
function pushRiskHistory(zoneId, point) {
  const zone = zones.get(zoneId);
  if (!zone) return;
  zone.riskHistory.push(point);
  if (zone.riskHistory.length > MAX_RISK_HISTORY) zone.riskHistory.shift();
}

/** Lightweight public view of a zone (no raw frame data). */
function toPublicZone(z) {
  const risk = Number(z.risk ?? z.riskScore ?? 0);
  return {
    id: z.id,
    count: Number(z.peopleCount ?? z.count ?? 0),
    risk,
    level: riskLevelFromScore(risk),
    density: Number(z.density ?? 0),
    speed: Number(z.speed ?? 0),
    forecastDensity: Number(z.forecastDensity ?? 0),
    updatedAt: z.updatedAt || null,
  };
}

/** Zones in the format expected by HeatMap/ZoneTable. */
function getZonesForClient() {
  return Array.from(zones.values()).map(toPublicZone);
}

/** Clears all zone state (each new video is a new scene). */
function resetZones() {
  zones.clear();
}

/** POST /api/zones - manual/simulator zone update */
function updateZone(req, res) {
  const { id, peopleCount, zoneArea, prevPositions, currPositions, deltaTime } = req.body;

  if (!id || !(Number(zoneArea) > 0)) {
    return res.status(400).json({ error: "Invalid zone data" });
  }

  upsertZone(id, { peopleCount, zoneArea, prevPositions, currPositions, deltaTime });
  return res.status(200).json({ message: "Zone updated" });
}

/** GET /api/zones */
function getZones(req, res) {
  return res.status(200).json(getZonesForClient());
}

/** GET /api/zones/:zoneId - detail incl. timeline + risk history */
function getZoneDetail(req, res) {
  const zone = zones.get(req.params.zoneId);
  if (!zone) return res.status(404).json({ error: "Zone not found" });

  return res.status(200).json({
    ...toPublicZone(zone),
    timeline: zone.timeline || [],
    riskHistory: zone.riskHistory || [],
    densityHistory: zone.densityHistory || [],
  });
}

/** DELETE /api/zones - reset all zone state */
function deleteZones(req, res) {
  resetZones();
  const { emitZoneUpdateToAll } = require("../sockets/live.socket");
  emitZoneUpdateToAll([]);
  return res.status(200).json({ message: "Zones reset" });
}

/** Internal access for risk engine */
function getZoneById(zoneId) {
  return zones.get(zoneId);
}

module.exports = {
  updateZone,
  getZones,
  getZoneDetail,
  deleteZones,
  getZoneById,
  upsertZone,
  pushRiskHistory,
  resetZones,
  getZonesForClient,
  riskLevelFromScore,
};
