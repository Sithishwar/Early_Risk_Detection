const { generateId } = require("../utils/helpers");

/**
 * A single risk alert. Plain class (in-memory), serialises cleanly to JSON.
 */
class Alert {
  constructor({ zoneId, level = "CRITICAL", message, riskScore = 0, timestamp }) {
    this.id = generateId("alert-");
    this.zoneId = zoneId;
    this.level = level;
    this.message = message || `Zone ${zoneId} is in ${String(level).toLowerCase()} condition`;
    this.riskScore = Number(riskScore) || 0;
    this.timestamp = timestamp || Date.now();
  }
}

module.exports = Alert;
