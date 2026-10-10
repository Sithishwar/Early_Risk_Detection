const express = require("express");
const { getAlerts, deleteAlerts } = require("../controllers/alert.controller");

const router = express.Router();

router.get("/health", (req, res) =>
  res.status(200).json({ status: "Alert system active", timestamp: Date.now() })
);

/** GET /api/alerts - recent alerts, newest first */
router.get("/", getAlerts);

/** DELETE /api/alerts - clear alert log */
router.delete("/", deleteAlerts);

module.exports = router;
