const express = require("express");
const multer = require("multer");
const {
  updateZone,
  getZones,
  getZoneDetail,
  deleteZones,
} = require("../controllers/zone.controller");
const { analyzeVideoForZone } = require("../controllers/video.controller");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", updateZone); // POST /api/zones
router.get("/", getZones); // GET /api/zones
router.delete("/", deleteZones); // DELETE /api/zones (reset)
router.get("/:zoneId", getZoneDetail); // GET /api/zones/:zoneId

/** Legacy single-zone quick upload (uses the simple /detect/video heuristic). */
router.post("/:zoneId/video", upload.single("file"), analyzeVideoForZone);

module.exports = router;
