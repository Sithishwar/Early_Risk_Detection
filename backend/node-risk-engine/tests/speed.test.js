const test = require("node:test");
const assert = require("node:assert");
const {
  calculateAverageSpeed,
  calculateAverageSpeedFromSeries,
} = require("../src/services/speed.service");

const f1 = [{ id: 17, x: 100, y: 200 }, { id: 23, x: 400, y: 200 }];
const f2 = [{ id: 23, x: 410, y: 200 }, { id: 17, x: 110, y: 200 }]; // order swapped

test("matches the same person by track id, not array position", () => {
  assert.strictEqual(calculateAverageSpeed(f1, f2, 1), 10);
});

test("ignores newly appearing track ids", () => {
  assert.strictEqual(calculateAverageSpeed(f1, [...f2, { id: 99, x: 900, y: 900 }], 1), 10);
});

test("falls back to index matching when no ids are present", () => {
  assert.strictEqual(calculateAverageSpeed([{ x: 0, y: 0 }], [{ x: 5, y: 0 }], 1), 5);
});

test("series speed averages every consecutive frame pair", () => {
  const series = [
    { timestamp: 0, points: f1 },
    { timestamp: 1, points: f2 },
    { timestamp: 2, points: [{ id: 17, x: 130, y: 200 }, { id: 23, x: 430, y: 200 }] },
  ];
  assert.strictEqual(calculateAverageSpeedFromSeries(series), 15);
});

test("returns 0 for empty/invalid input", () => {
  assert.strictEqual(calculateAverageSpeed(null, [], 1), 0);
  assert.strictEqual(calculateAverageSpeedFromSeries([]), 0);
  assert.strictEqual(calculateAverageSpeed(f1, f2, 0), 0);
});
