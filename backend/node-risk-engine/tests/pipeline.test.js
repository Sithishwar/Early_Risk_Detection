/**
 * End-to-end test of the Node pipeline against a mock Python ML service:
 * upload -> /detect/video/frames (mock) -> zones -> speed -> /forecast (mock)
 * -> risk -> alerts -> REST + Socket.IO.
 */
const test = require("node:test");
const assert = require("node:assert");
const http = require("http");
const express = require("express");
const { io: ioClient } = require("socket.io-client");

function startMockMl() {
  const app = express();
  app.use(express.json());
  app.get("/health", (req, res) => res.json({ status: "ML service running" }));
  // 2 tracked people walking right in zone R0C0 (big frame 1000x1000, 5x5 => 200px cells)
  // + 12 people standing in R4C4 -> dense & critical
  app.post("/detect/video/frames", (req, res) => {
    const samples = [];
    for (let i = 1; i <= 6; i++) {
      const people = [
        { id: 1, x: 20 + i * 20, y: 50 },
        { id: 2, x: 30 + i * 20, y: 90 },
      ];
      for (let k = 0; k < 12; k++) people.push({ id: 100 + k, x: 800 + (k % 4) * 15 + i * 20, y: 800 + Math.floor(k / 4) * 15 });
      samples.push({ frame_index: i * 30, timestamp: i, people });
    }
    res.json({ fps: 30, frame_width: 1000, frame_height: 1000, total_frames: 180, sampled_every: 30, samples });
  });
  app.post("/forecast/", (req, res) => {
    const h = req.body.history;
    res.json({ zoneId: req.body.zoneId, predictedDensity: h[h.length - 1] });
  });
  return new Promise((resolve) => {
    const server = app.listen(0, () => resolve(server));
  });
}

test("full pipeline: video -> zones -> risk -> alerts -> socket", async (t) => {
  const ml = await startMockMl();
  process.env.ML_SERVICE_URL = `http://localhost:${ml.address().port}`;
  process.env.PORT = "0";
  process.env.CRITICAL_RISK_THRESHOLD = "0.75";

  const { Server } = require("socket.io");
  const app = require("../src/app");
  const { initLiveSocket } = require("../src/sockets/live.socket");
  const server = http.createServer(app);
  initLiveSocket(new Server(server, { cors: { origin: "*" } }));
  await new Promise((r) => server.listen(0, r));
  const base = `http://localhost:${server.address().port}`;

  t.after(() => { server.close(); ml.close(); });

  const socket = ioClient(base, { transports: ["websocket"] });
  const gotAlert = new Promise((resolve) => socket.on("alert", resolve));
  const gotZones = new Promise((resolve) =>
    socket.on("zone_update", (z) => z.length > 0 && resolve(z))
  );

  const fd = new FormData();
  fd.append("file", new Blob([Buffer.from("fake")], { type: "video/mp4" }), "clip.mp4");
  const res = await fetch(`${base}/api/video/analyze`, { method: "POST", body: fd });
  const body = await res.json();
  assert.strictEqual(res.status, 200, JSON.stringify(body));

  // 25 zones, dense one ranked first
  assert.strictEqual(body.zones.length, 25);
  assert.strictEqual(body.topRiskZone.zoneId, "R4C4");
  assert.strictEqual(body.topRiskZone.peopleCount, 12);
  assert.ok(body.topRiskZone.riskScore >= 0.75, "dense zone should be critical");
  assert.strictEqual(body.summary.uniquePeopleTracked, 14);

  // id-matched walkers: 20px/s on a 1000px frame = 2 % of frame width per second
  const walkers = body.zones.find((z) => z.zoneId === "R0C0");
  assert.ok(Math.abs(walkers.speed - 2) < 1e-6, `speed was ${walkers.speed}`);

  // alerts stored + broadcast
  const alert = await gotAlert;
  assert.strictEqual(alert.zoneId, "R4C4");
  const zones = await gotZones;
  assert.ok(zones.some((z) => z.id === "R4C4" && z.risk >= 0.75));

  const stored = await (await fetch(`${base}/api/alerts`)).json();
  assert.strictEqual(stored[0].zoneId, "R4C4");

  // zone detail endpoint powers the detail page
  const detail = await (await fetch(`${base}/api/zones/R4C4`)).json();
  assert.strictEqual(detail.timeline.length, 6);
  assert.strictEqual(detail.riskHistory.length, 1);

  // ML health passthrough
  const health = await (await fetch(`${base}/health/ml`)).json();
  assert.strictEqual(health.ok, true);

  socket.close();
});
