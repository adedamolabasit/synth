import { File } from "formdata-node";
(global as any).File = File;
import app from "./app";
import { connectDB } from "./config/db";
import logger from "./utils/logger";

const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;


async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

const gracefulShutdown = async () => {
  try {
    logger.info("Disconnecting Redis client...");
    logger.info("Redis disconnected");
    process.exit(0);
  } catch (err) {
    logger.info("Error disconnecting Redis:", err);
    process.exit(1);
  }
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection:", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception:", err);
  gracefulShutdown();
});
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection:", reason);
  gracefulShutdown();
});

startServer();
