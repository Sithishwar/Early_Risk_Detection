const express = require("express");
const {
  updateZone,
  getZones,
} = require("../../controllers/zone.controller");

const router = express.Router();

/**
 * Update zone state
 * POST /api/zones
 */
router.post("/", updateZone);

/**
 * Get all zones
 * GET /api/zones
 */
router.get("/", getZones);

module.exports = router;
