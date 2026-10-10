const env = require("../config/env");
const Alert = require("../models/Alert.model");
const { addAlerts, listAlerts, clearAlerts } = require("../services/alert.service");

/**
 * Emits (and stores) an alert if a zone's risk crosses the critical threshold.
 */
function evaluateAndEmitAlert(io, riskResult) {
  const { zoneId, riskScore } = riskResult;
  if (riskScore >= env.CRITICAL_RISK_THRESHOLD) {
    const alert = new Alert({ zoneId, level: "CRITICAL", riskScore });
    addAlerts([alert]);
    io.emit("alert", alert);
  }
}

/** GET /api/alerts */
function getAlerts(req, res) {
  return res.status(200).json(listAlerts());
}

/** DELETE /api/alerts */
function deleteAlerts(req, res) {
  clearAlerts();
  return res.status(200).json({ message: "Alerts cleared" });
}

module.exports = { evaluateAndEmitAlert, getAlerts, deleteAlerts };
