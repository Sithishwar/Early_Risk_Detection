const { evaluateAndEmitAlert } = require("../../controllers/alert.controller");

/**
 * Initializes socket events
 * @param {import("socket.io").Server} io
 */
function initLiveSocket(io) {
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}

/**
 * Emits zone risk updates to all clients
 */
function emitZoneUpdate(io, zoneRiskData) {
  io.emit("zone_update", zoneRiskData);
}

/**
 * Handles alert evaluation and emission
 */
function handleRiskResult(io, riskResult) {
  emitZoneUpdate(io, riskResult);
  evaluateAndEmitAlert(io, riskResult);
}

module.exports = {
  initLiveSocket,
  emitZoneUpdate,
  handleRiskResult,
};
