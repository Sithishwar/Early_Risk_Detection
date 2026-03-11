const express = require("express");
const multer = require("multer");
const {
  updateZone,
  getZones,
} = require("../controllers/zone.controller");
const { analyzeVideoForZone } = require("../controllers/video.controller");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Update zone state
 * POST /api/zones
 */
router.post("/", updateZone);

/**
 * Analyze video for a specific zone — updates zone risk and broadcasts to heatmap
 * POST /api/zones/:zoneId/video
 */
router.post("/:zoneId/video", upload.single("file"), analyzeVideoForZone);

/**
 * Get all zones
 * GET /api/zones
 */
router.get("/", getZones);

module.exports = router;
