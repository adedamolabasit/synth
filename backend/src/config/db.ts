import mongoose from "mongoose";
import config from "./config";
import logger from "../utils/logger";

export const connectDB = async () => {
  try {
    logger.info(
      "Connecting to MongoDB with URI:",
      config.mongo.uri.replace(/\/\/.*@/, "//****:****@")
    );

    await mongoose.connect(config.mongo.uri, config.mongo.options);
    logger.info("MongoDB connected successfully");

    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error:", err);
    });
  } catch (err) {
    logger.error("MongoDB initial connection error:", err);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  logger.info("MongoDB disconnected");
};