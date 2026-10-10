const { MAX_ALERTS } = require("../config/constants");

/** Bounded in-memory alert log, newest first. */
let alerts = [];

function addAlerts(list) {
  if (!list || !list.length) return;
  alerts = [...list, ...alerts].slice(0, MAX_ALERTS);
}

function listAlerts() {
  return alerts;
}

function clearAlerts() {
  alerts = [];
}

module.exports = { addAlerts, listAlerts, clearAlerts };
