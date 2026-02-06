const express = require("express");

const router = express.Router();

/**
 * Health check for alert system
 * GET /api/alerts/health
 */
router.get("/health", (req, res) => {
  return res.status(200).json({
    status: "Alert system active",
    timestamp: Date.now(),
  });
});

module.exports = router;
