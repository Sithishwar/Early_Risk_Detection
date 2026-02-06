/**
 * Calculates average movement speed
 * @param {Array<{x:number,y:number}>} prevPositions
 * @param {Array<{x:number,y:number}>} currPositions
 * @param {number} deltaTimeSeconds
 * @returns {number} averageSpeed
 */
function calculateAverageSpeed(prevPositions, currPositions, deltaTimeSeconds) {
  if (!prevPositions || !currPositions || deltaTimeSeconds <= 0) {
    return 0;
  }

  const count = Math.min(prevPositions.length, currPositions.length);
  if (count === 0) return 0;

  let totalDistance = 0;

  for (let i = 0; i < count; i++) {
    const dx = currPositions[i].x - prevPositions[i].x;
    const dy = currPositions[i].y - prevPositions[i].y;
    totalDistance += Math.sqrt(dx * dx + dy * dy);
  }

  return totalDistance / count / deltaTimeSeconds;
}

module.exports = {
  calculateAverageSpeed,
};
