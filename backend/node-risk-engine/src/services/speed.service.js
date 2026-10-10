/**
 * Calculates average movement speed between two point sets.
 *
 * When points carry a persistent tracking `id` (from YOLO + ByteTrack on
 * the Python ML service), speed is computed by matching the SAME
 * person's id across the two frames -- that's what makes the number
 * meaningful. Without ids, "prevPositions[i] vs currPositions[i]" only
 * happens to be the same person if detection order never changes between
 * frames, which it doesn't in practice (people enter/leave, YOLO's output
 * order isn't stable) -- id matching removes that weakness entirely.
 *
 * Falls back to positional (index) matching only when no ids are present,
 * so older callers (e.g. the manual zone-update endpoint / simulators
 * that don't have tracking) keep working unchanged.
 *
 * @param {Array<{id?:number, x:number, y:number}>} prevPositions
 * @param {Array<{id?:number, x:number, y:number}>} currPositions
 * @param {number} deltaTimeSeconds
 * @returns {number} averageSpeed (pixels / second)
 */
function calculateAverageSpeed(prevPositions, currPositions, deltaTimeSeconds) {
  if (!prevPositions || !currPositions || deltaTimeSeconds <= 0) {
    return 0;
  }

  const hasIds =
    prevPositions.some((p) => p && p.id != null) &&
    currPositions.some((p) => p && p.id != null);

  let totalDistance = 0;
  let count = 0;

  if (hasIds) {
    const prevById = new Map(
      prevPositions.filter((p) => p && p.id != null).map((p) => [p.id, p])
    );

    for (const curr of currPositions) {
      if (!curr || curr.id == null) continue;
      const prev = prevById.get(curr.id);
      if (!prev) continue; // this person wasn't tracked yet in the earlier frame

      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      totalDistance += Math.sqrt(dx * dx + dy * dy);
      count++;
    }
  } else {
    // Legacy fallback: no track ids available, match by array position.
    count = Math.min(prevPositions.length, currPositions.length);
    for (let i = 0; i < count; i++) {
      const dx = currPositions[i].x - prevPositions[i].x;
      const dy = currPositions[i].y - prevPositions[i].y;
      totalDistance += Math.sqrt(dx * dx + dy * dy);
    }
  }

  if (count === 0) return 0;
  return totalDistance / count / deltaTimeSeconds;
}

/**
 * Same idea as calculateAverageSpeed, but over an entire sampled timeline
 * instead of just two snapshots. It sums per-person displacement between
 * EVERY pair of consecutive frames (matched by track id) and averages the
 * result -- a truer picture of movement than comparing only the first and
 * last frame a zone happened to have people in.
 *
 * @param {Array<{timestamp:number, points:Array<{id?:number,x:number,y:number}>}>} frames
 *   Frames sorted by timestamp ascending.
 * @returns {number} averageSpeed (pixels / second)
 */
function calculateAverageSpeedFromSeries(frames) {
  if (!Array.isArray(frames) || frames.length < 2) return 0;

  let totalSpeed = 0;
  let sampleCount = 0;

  for (let i = 1; i < frames.length; i++) {
    const prev = frames[i - 1];
    const curr = frames[i];
    const dt = curr.timestamp - prev.timestamp;
    if (dt <= 0) continue;

    const speed = calculateAverageSpeed(prev.points, curr.points, dt);
    if (speed > 0) {
      totalSpeed += speed;
      sampleCount++;
    }
  }

  return sampleCount === 0 ? 0 : totalSpeed / sampleCount;
}

module.exports = {
  calculateAverageSpeed,
  calculateAverageSpeedFromSeries,
};
