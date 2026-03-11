const axios = require("axios");
const FormData = require("form-data");
const env = require("../config/env");
const { upsertZone, getZonesForClient } = require("./zone.controller");
const { emitZoneUpdateToAll } = require("../sockets/live.socket");

function riskFromVideoResult(videoResult) {
  const level = String(videoResult?.risk_level || "").toLowerCase();
  if (level === "high") return 0.9;
  if (level === "medium") return 0.6;
  if (level === "low") return 0.2;
  const maxPeople = Number(videoResult?.max_people_count ?? 0);
  return Math.min(maxPeople / 10, 1);
}

async function analyzeVideoForZone(req, res) {
  const { zoneId } = req.params;
  const file = req.file;

  if (!zoneId) {
    return res.status(400).json({ error: "zoneId is required" });
  }
  if (!file || !file.buffer) {
    return res.status(400).json({ error: "file is required" });
  }

  try {
    const form = new FormData();
    form.append("file", file.buffer, {
      filename: file.originalname || "video.mp4",
      contentType: file.mimetype || "video/mp4",
    });

    const mlUrl = `${env.ML_SERVICE_URL}/detect/video`;
    const response = await axios.post(mlUrl, form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    const payload = response.data;
    const peopleCount = Number(payload.max_people_count ?? 0);
    const risk = riskFromVideoResult(payload);

    upsertZone(zoneId, {
      peopleCount,
      risk,
      zoneArea: 1,
      prevPositions: [],
      currPositions: [],
      deltaTime: 1,
    });

    emitZoneUpdateToAll(getZonesForClient());

    return res.status(200).json({
      zoneId,
      derived: { peopleCount, risk },
      ...payload,
    });
  } catch (err) {
    const detail = err.response?.data?.detail ?? err.message;
    return res.status(err.response?.status || 500).json({
      error: "Video analysis failed",
      detail: String(detail),
    });
  }
}

module.exports = {
  analyzeVideoForZone,
};
