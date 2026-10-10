const Grid = require("../structures/Grid");
const { GRID_ROWS, GRID_COLS } = require("../config/constants");

/**
 * Maps a person's pixel centroid (x, y) into a grid cell given the source
 * frame dimensions.
 * @returns {{row:number, col:number, zoneId:string}}
 */
function pointToCell(x, y, frameWidth, frameHeight, rows = GRID_ROWS, cols = GRID_COLS) {
  const safeW = frameWidth > 0 ? frameWidth : 1;
  const safeH = frameHeight > 0 ? frameHeight : 1;

  const col = Math.min(cols - 1, Math.max(0, Math.floor((x / safeW) * cols)));
  const row = Math.min(rows - 1, Math.max(0, Math.floor((y / safeH) * rows)));

  return { row, col, zoneId: `R${row}C${col}` };
}

/**
 * Buckets every person point from a single sampled frame into grid cells,
 * using the existing Grid structure for spatial storage.
 * @returns {{grid: Grid, byZone: Map<string, Array<{x:number,y:number}>>}}
 */
function mapFrameToZones(people, frameWidth, frameHeight, rows = GRID_ROWS, cols = GRID_COLS) {
  const grid = new Grid(rows, cols);
  const byZone = new Map();

  for (const person of people || []) {
    const { row, col, zoneId } = pointToCell(
      person.x,
      person.y,
      frameWidth,
      frameHeight,
      rows,
      cols
    );
    grid.addPerson(row, col, person);
    if (!byZone.has(zoneId)) byZone.set(zoneId, []);
    byZone.get(zoneId).push(person);
  }

  return { grid, byZone };
}

/**
 * All zoneIds for a rows x cols grid, e.g. R0C0 .. R4C4 for a 5x5 grid.
 * Used so every zone (even empty ones) shows up on the heatmap.
 */
function allZoneIds(rows = GRID_ROWS, cols = GRID_COLS) {
  const ids = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) ids.push(`R${r}C${c}`);
  }
  return ids;
}

module.exports = {
  pointToCell,
  mapFrameToZones,
  allZoneIds,
};