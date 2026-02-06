/**
 * Calculates crowd density for a zone
 * @param {number} peopleCount
 * @param {number} zoneArea
 * @returns {number} density
 */
function calculateDensity(peopleCount, zoneArea) {
  if (zoneArea <= 0) {
    throw new Error("Zone area must be greater than zero");
  }

  return peopleCount / zoneArea;
}

module.exports = {
  calculateDensity,
};
