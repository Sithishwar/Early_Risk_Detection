const axios = require("axios");
const FormData = require("form-data");

const env = require("../config/env");
const { GRID_ROWS, GRID_COLS, DENSITY_WINDOW_SIZE } = require("../config/constants");
const { mapFrameToZones, allZoneIds } = require("./gridZone.service");
const { computeZoneRisk } = require("./riskEngine.service");
const { addAlerts } = require("./alert.service");
const {
  upsertZone,
  pushRiskHistory,
  resetZones,
  getZonesForClient,
  riskLevelFromScore,
} = require("../controllers/zone.controller");
const PriorityQueue = require("../structures/PriorityQueue");
const Alert = require("../models/Alert.model");

function mlBaseUrl() {
  return String(env.ML_SERVICE_URL || "http://localhost:8000").replace(/\/+$/, "");
}

/**
 * Steps 1-4: send the raw video to the Python ML service (OpenCV -> YOLO ->
 * ByteTrack) and get back per-sampled-frame tracked person centroids
 * {id, x, y}. Pure detection/tracking, no risk math.
 */
async function fetchFrameDetections({ buffer, filename, mimetype }) {
  const form = new FormData();
  form.append("file", buffer, {
    filename: filename || "video.mp4",
    contentType: mimetype || "video/mp4",
  });

  const response = await axios.post(`${mlBaseUrl()}/detect/video/frames`, form, {
    headers: form.getHeaders(),
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    timeout: 15 * 60 * 1000, // tracking a long clip on CPU can take minutes
  });

  return response.data;
}

/**
 * Steps 6-9 for a single zone: density, movement (matched by track id),
 * sliding-window history, LSTM forecast, weighted risk.
 *
 * @param {string} zoneId
 * @param {Array<{timestamp:number, points:Array<{id:number,x:number,y:number}>}>} series
 *   pixel-space points per sampled frame (used for counts)
 * @param {number} speedScale  converts pixels -> % of frame width, so speed is
 *   resolution-independent: units are "% of frame width per second".
 */
async function processZone(zoneId, series, speedScale) {
  const counts = series.map((s) => s.points.length);
  const maxCount = counts.length ? Math.max(...counts) : 0;
  const currentCount = counts.length ? counts[counts.length - 1] : 0;
  const zoneHadActivity = maxCount > 0;

  const timeline = series.map((s) => ({
    t: Number(s.timestamp.toFixed(2)),
    count: s.points.length,
  }));

  const frames = series.map((s) => ({
    timestamp: s.timestamp,
    points: s.points.map((p) => ({ id: p.id, x: p.x * speedScale, y: p.y * speedScale })),
  }));

  // zoneArea is normalised to 1, so density === people per zone.
  const zone = upsertZone(zoneId, { peopleCount: currentCount, zoneArea: 1, frames });

  for (const c of counts) {
    zone.densityHistory.push(c);
    if (zone.densityHistory.length > DENSITY_WINDOW_SIZE) zone.densityHistory.shift();
  }

  const now = Date.now();

  // Nothing ever seen in this zone: skip the forecast round-trip.
  if (!zoneHadActivity && zone.densityHistory.every((v) => v === 0)) {
    upsertZone(zoneId, {
      risk: 0, density: 0, speed: 0, forecastDensity: 0,
      timeline, frames: null, updatedAt: now,
    });
    return {
      zoneId, peopleCount: 0, maxPeopleCount: 0,
      density: 0, speed: 0, forecastDensity: 0, riskScore: 0,
    };
  }

  const r = await computeZoneRisk(zone);

  upsertZone(zoneId, {
    risk: r.riskScore,
    density: r.density,
    speed: r.speed,
    forecastDensity: r.forecastDensity ?? r.density,
    timeline,
    frames: null, // raw frames are not kept after scoring
    updatedAt: now,
  });
  pushRiskHistory(zoneId, { at: now, risk: Number(r.riskScore.toFixed(3)) });

  return {
    zoneId,
    peopleCount: currentCount,
    maxPeopleCount: maxCount,
    density: r.density,
    speed: r.speed,
    forecastDensity: r.forecastDensity ?? r.density,
    riskScore: r.riskScore,
  };
}

/**
 * Full pipeline: video in -> ranked zone risk results + alerts out.
 * Socket.IO broadcast is handled by the caller so this stays testable.
 *
 * @param {boolean} [accumulate=false] keep previous zone history (same camera,
 *   consecutive clips). Default: every upload is a fresh scene.
 */
async function analyzeVideoAcrossZones({
  buffer, filename, mimetype, rows, cols, accumulate = false,
}) {
  const gridRows = Number(rows) > 0 ? Number(rows) : GRID_ROWS;
  const gridCols = Number(cols) > 0 ? Number(cols) : GRID_COLS;

  const mlResponse = await fetchFrameDetections({ buffer, filename, mimetype });
  const { fps, frame_width: frameWidth, frame_height: frameHeight, samples } = mlResponse;

  if (!accumulate) resetZones();

  // Step 5: bucket every sampled frame's tracked people into grid cells.
  const sampleZoneMaps = samples.map(
    (s) => mapFrameToZones(s.people, frameWidth, frameHeight, gridRows, gridCols).byZone
  );

  const speedScale = frameWidth > 0 ? 100 / frameWidth : 1;
  const zoneIds = allZoneIds(gridRows, gridCols);

  const zoneResults = await Promise.all(
    zoneIds.map((zoneId) => {
      const series = samples.map((s, idx) => ({
        timestamp: s.timestamp,
        points: sampleZoneMaps[idx].get(zoneId) || [],
      }));
      return processZone(zoneId, series, speedScale);
    })
  );

  // Rank zones with the max-heap; alerts are emitted in this priority order.
  const pq = new PriorityQueue();
  for (const r of zoneResults) {
    pq.push({ priority: r.riskScore, ...r, level: riskLevelFromScore(r.riskScore) });
  }
  const ranked = [];
  let popped;
  // eslint-disable-next-line no-cond-assign
  while ((popped = pq.pop()) !== null) {
    const { priority, ...rest } = popped; // eslint-disable-line no-unused-vars
    ranked.push(rest);
  }

  const alertsFired = ranked
    .filter((z) => z.riskScore >= env.CRITICAL_RISK_THRESHOLD)
    .map(
      (z) =>
        new Alert({
          zoneId: z.zoneId,
          level: "CRITICAL",
          message: `Zone ${z.zoneId} is in critical condition`,
          riskScore: z.riskScore,
        })
    );
  addAlerts(alertsFired);

  // Video-level summary
  const uniqueTracks = new Set();
  let peak = 0;
  let totalPeople = 0;
  for (const s of samples) {
    peak = Math.max(peak, s.people.length);
    totalPeople += s.people.length;
    for (const p of s.people) if (p.id != null) uniqueTracks.add(p.id);
  }

  return {
    video: {
      fps,
      frameWidth,
      frameHeight,
      totalFrames: mlResponse.total_frames,
      sampledFrames: samples.length,
      sampledEvery: mlResponse.sampled_every,
    },
    summary: {
      uniquePeopleTracked: uniqueTracks.size,
      peakPeople: peak,
      avgPeople: samples.length ? Number((totalPeople / samples.length).toFixed(1)) : 0,
      criticalZones: alertsFired.length,
    },
    grid: { rows: gridRows, cols: gridCols },
    zones: ranked,
    topRiskZone: ranked[0] || null,
    alertsFired,
    allZones: getZonesForClient(),
  };
}

module.exports = { analyzeVideoAcrossZones };
