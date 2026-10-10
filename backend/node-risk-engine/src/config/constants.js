module.exports = {
  // Grid configuration (rows x cols zones over the video frame)
  GRID_ROWS: 5,
  GRID_COLS: 5,

  // Sliding window size for per-zone density history (LSTM input)
  DENSITY_WINDOW_SIZE: 20,

  // Risk weighting: Risk = 0.5*density + 0.3*movement + 0.2*forecast
  RISK_WEIGHTS: {
    density: 0.5,
    speed: 0.3,
    forecast: 0.2,
  },

  // Normalisation ceilings (value at/above this counts as "maximum" = 1.0)
  MAX_DENSITY: 10, // people per zone
  MAX_SPEED: 10, // % of frame width travelled per second

  // Risk level bands
  LEVEL_MEDIUM: 0.3,
  LEVEL_HIGH: 0.7,

  // Bounded in-memory stores
  MAX_ALERTS: 200,
  MAX_RISK_HISTORY: 30,

  // Alert levels
  ALERT_LEVELS: {
    INFO: "INFO",
    WARNING: "WARNING",
    CRITICAL: "CRITICAL",
  },
};
