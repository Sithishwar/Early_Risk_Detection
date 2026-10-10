require("dotenv").config();

function required(key) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return process.env[key];
}

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5000,

  // Database
  MONGO_URI: process.env.MONGO_URI || null,
  REDIS_URL: process.env.REDIS_URL || null,

  // ML Service
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || "http://localhost:8000",

  // Risk thresholds
  CRITICAL_RISK_THRESHOLD: Number(process.env.CRITICAL_RISK_THRESHOLD || 0.75),
};

module.exports = env;
