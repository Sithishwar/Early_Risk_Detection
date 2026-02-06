const levels = {
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
};

function log(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const payload = {
    timestamp,
    level,
    message,
    ...meta,
  };

  // For now, log to stdout (replace with Winston later)
  console.log(JSON.stringify(payload));
}

module.exports = {
  info: (msg, meta) => log(levels.INFO, msg, meta),
  warn: (msg, meta) => log(levels.WARN, msg, meta),
  error: (msg, meta) => log(levels.ERROR, msg, meta),
};
