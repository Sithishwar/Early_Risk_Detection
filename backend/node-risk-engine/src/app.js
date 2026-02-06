const express = require("express");

const zoneRoutes = require("./routes/zone.routes");
const riskRoutes = require("./routes/risk.routes");
const alertRoutes = require("./routes/alert.routes");

const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

/**
 * Core middlewares
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * API routes
 */
app.use("/api/zones", zoneRoutes);
app.use("/api/risk", riskRoutes);
app.use("/api/alerts", alertRoutes);

/**
 * Health check
 */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

/**
 * Global error handler (must be last)
 */
app.use(errorMiddleware);

module.exports = app;
