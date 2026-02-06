/**
 * Clamp a number between min and max
 */
function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Safely parse number
 */
function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Generate simple unique ID
 */
function generateId(prefix = "") {
  return `${prefix}${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

module.exports = {
  clamp,
  toNumber,
  generateId,
};
