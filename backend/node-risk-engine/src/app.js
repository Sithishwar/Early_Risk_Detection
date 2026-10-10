const express = require("express");
const cors = require("cors");
const axios = require("axios");

const env = require("./config/env");
const zoneRoutes = require("./routes/zone.routes");
const riskRoutes = require("./routes/risk.routes");
const alertRoutes = require("./routes/alert.routes");
const videoRoutes = require("./routes/video.routes");

const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

/**
 * Core middlewares
 */
app.use(
  cors({
    // Dev-friendly: allow dashboard opened via localhost or LAN IP (phone).
    // If you want to lock down, set CORS_ORIGIN env to a comma-separated list.
    origin: (origin, cb) => {
      const allow = String(process.env.CORS_ORIGIN || "").trim();
      if (!allow) return cb(null, true);
      const allowed = allow
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (!origin) return cb(null, true);
      return cb(null, allowed.includes(origin));
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * API routes
 */
app.use("/api/zones", zoneRoutes);
app.use("/api/risk", riskRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/video", videoRoutes);

/**
 * Health check
 */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

/**
 * ML service reachability (for mobile / dashboard pairing checks)
 */
app.get("/health/ml", async (req, res) => {
  const base = String(env.ML_SERVICE_URL || "http://localhost:8000").replace(
    /\/+$/,
    ""
  );
  try {
    const r = await axios.get(`${base}/health`, { timeout: 4000 });
    return res.status(200).json({ ok: true, ml: r.data, url: base });
  } catch (e) {
    return res.status(503).json({
      ok: false,
      url: base,
      error: e.response?.data || e.message || "ML unreachable",
    });
  }
});

/**
 * Global error handler (must be last)
 */
app.use(errorMiddleware);

module.exports = app;
