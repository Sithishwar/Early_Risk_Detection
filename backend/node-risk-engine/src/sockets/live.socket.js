const { evaluateAndEmitAlert } = require("../controllers/alert.controller");
const { getZonesForClient } = require("../controllers/zone.controller");

let _io = null;

/**
 * Initializes socket events
 * @param {import("socket.io").Server} io
 */
function initLiveSocket(io) {
  _io = io;

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    socket.emit("zone_update", getZonesForClient());

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}

function getIo() {
  return _io;
}

/**
 * Emits zone risk updates to all clients
 */
function emitZoneUpdate(io, zoneRiskData) {
  io.emit("zone_update", zoneRiskData);
}

function emitZoneUpdateToAll(zoneRiskData) {
  if (!_io) return;
  emitZoneUpdate(_io, zoneRiskData);
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
  getIo,
  emitZoneUpdate,
  emitZoneUpdateToAll,
  handleRiskResult,
};
