const env = require("./env");
const logger = require("../utils/logger");

/**
 * Connect to MongoDB
 */
async function connectMongo() {
  if (!env.MONGO_URI) {
    logger.warn("MongoDB URI not provided. Skipping Mongo connection.");
    return;
  }

  try {
    // Lazy require: mongoose is optional (in-memory store is the default).
    const mongoose = require("mongoose");
    await mongoose.connect(env.MONGO_URI, {
    });

    logger.info("MongoDB connected");
  } catch (error) {
    logger.warn("MongoDB unavailable, continuing with in-memory store", {
      error: error.message,
    });
  }
}

/**
 * Redis placeholder (optional)
 */
async function connectRedis() {
  if (!env.REDIS_URL) {
    logger.warn("Redis URL not provided. Skipping Redis connection.");
    return;
  }

  // Add Redis client here later
  logger.info("Redis connection placeholder initialized");
}

module.exports = {
  connectMongo,
  connectRedis,
};
