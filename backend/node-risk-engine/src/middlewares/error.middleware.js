const logger = require("../utils/logger");

/**
 * Global error handler
 */
function errorMiddleware(err, req, res, next) {
  logger.error("Unhandled error", {
    path: req.path,
    method: req.method,
    error: err.message,
  });

  res.status(err.statusCode || 500).json({
    error: "Internal Server Error",
    message: err.message || "Something went wrong",
  });
}

module.exports = errorMiddleware;
