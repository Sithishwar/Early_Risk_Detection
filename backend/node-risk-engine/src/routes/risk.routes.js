const express = require("express");
const { computeRisk } = require("../controllers/risk.controller");

const router = express.Router();

/**
 * Compute risk for a zone
 * GET /api/risk/:zoneId
 */
router.get("/:zoneId", computeRisk);

module.exports = router;
