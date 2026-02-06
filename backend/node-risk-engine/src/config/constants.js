module.exports = {
  // Grid configuration
  GRID_ROWS: 5,
  GRID_COLS: 5,

  // Sliding window sizes
  DENSITY_WINDOW_SIZE: 20,

  // Risk weighting
  RISK_WEIGHTS: {
    density: 0.5,
    speed: 0.3,
    forecast: 0.2,
  },

  // Alert levels
  ALERT_LEVELS: {
    INFO: "INFO",
    WARNING: "WARNING",
    CRITICAL: "CRITICAL",
  },
};
