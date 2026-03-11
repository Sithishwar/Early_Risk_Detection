const mongoose = require("mongoose");
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
    await mongoose.connect(env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info("MongoDB connected");
  } catch (error) {
    logger.error("MongoDB connection failed", { error: error.message });
    process.exit(1);
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
