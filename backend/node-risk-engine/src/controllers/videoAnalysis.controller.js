const { analyzeVideoAcrossZones } = require("../services/videoPipeline.service");
const { emitZoneUpdateToAll, getIo } = require("../sockets/live.socket");

/**
 * Full-pipeline video analysis:
 * OpenCV -> YOLO -> ByteTrack -> zones -> density + movement -> LSTM -> risk -> alerts.
 *
 * POST /api/video/analyze   multipart/form-data: file=<video>
 * optional query: ?rows=5&cols=5   grid size override
 *                 ?accumulate=true keep previous zone history
 */
async function analyzeVideoGrid(req, res) {
  const file = req.file;

  if (!file || !file.buffer) {
    return res.status(400).json({ error: "file is required" });
  }

  try {
    const result = await analyzeVideoAcrossZones({
      buffer: file.buffer,
      filename: file.originalname || "video.mp4",
      mimetype: file.mimetype || "video/mp4",
      rows: req.query.rows,
      cols: req.query.cols,
      accumulate: String(req.query.accumulate) === "true",
    });

    // Broadcast the updated heatmap once, then the alerts (highest risk first).
    emitZoneUpdateToAll(result.allZones);
    const io = getIo();
    if (io) for (const alert of result.alertsFired) io.emit("alert", alert);

    const { allZones, ...payload } = result; // eslint-disable-line no-unused-vars
    return res.status(200).json(payload);
  } catch (err) {
    const mlDown = ["ECONNREFUSED", "ENOTFOUND", "ECONNRESET"].includes(err.code);
    const detail = mlDown
      ? "Python ML service is not reachable. Start it on port 8000 (see README)."
      : err.response?.data?.detail ?? err.message;
    return res.status(mlDown ? 503 : err.response?.status || 500).json({
      error: "Grid video analysis failed",
      detail: String(detail),
    });
  }
}

module.exports = { analyzeVideoGrid };
