const express = require("express");
const multer = require("multer");
const { analyzeVideoGrid } = require("../controllers/videoAnalysis.controller");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 300 * 1024 * 1024 }, // 300MB, video uploads are larger than frames
});

/**
 * Full pipeline: video -> person detection -> grid zoning -> density +
 * movement -> LSTM forecast -> weighted risk engine -> alerts.
 * POST /api/video/analyze
 */
router.post("/analyze", upload.single("file"), analyzeVideoGrid);

module.exports = router;
