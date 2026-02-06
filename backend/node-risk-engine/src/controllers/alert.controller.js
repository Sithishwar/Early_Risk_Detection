/**
 * Emits alert if risk crosses threshold
 * Socket injected from server
 */
function evaluateAndEmitAlert(io, riskResult) {
  const { zoneId, riskScore } = riskResult;

  if (riskScore >= 0.75) {
    io.emit("alert", {
      zoneId,
      level: "CRITICAL",
      message: `Zone ${zoneId} is in critical condition`,
      riskScore,
      timestamp: Date.now(),
    });
  }
}

module.exports = {
  evaluateAndEmitAlert,
};
