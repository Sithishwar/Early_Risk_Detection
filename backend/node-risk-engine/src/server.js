const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const env = require("./config/env");
const { connectMongo, connectRedis } = require("./config/db");
const logger = require("./utils/logger");

const {
  initLiveSocket,
} = require("./sockets/live.socket");

/**
 * Initialize external services
 */
(async function bootstrap() {
  try {
    await connectMongo();
    await connectRedis();

    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: "*",
      },
    });

    /**
     * Initialize socket lifecycle
     */
    initLiveSocket(io);

    /**
     * Start server
     */
    server.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`, {
        env: env.NODE_ENV,
      });
    });
  } catch (error) {
    logger.error("Server bootstrap failed", { error: error.message });
    process.exit(1);
  }
})();
