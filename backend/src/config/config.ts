import dotenv from "dotenv";
import mongoose from "mongoose";
import { validateEnv } from "../utils/envValidator";

dotenv.config();

validateEnv();

interface Config {
  nodeEnv: string;
  port: number;
  cors: {
    origin: string | string[];
    credentials: boolean;
    methods?: string[];
    allowedHeaders?: string[];
  };
  morgan: {
    format: string;
  };
  mongo: {
    uri: string;
    options: mongoose.ConnectOptions;
  };

  isProduction: boolean;
}

const getMongoUri = (): string => {
  const user = encodeURIComponent(process.env.MONGO_USER || "");
  const pass = encodeURIComponent(process.env.MONGO_PASS || "");
  const cluster = process.env.MONGO_CLUSTER || "localhost:27017";
  const db = process.env.MONGO_DB || "synth";

  return `mongodb+srv://${user}:${pass}@${cluster}/${db}?retryWrites=true&w=majority`;
};

const config: Config = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: (process.env.NODE_ENV || "development") === "production",
  port: parseInt(process.env.PORT || "5000"),
  cors: {
    origin: 'http://localhost:5173',
    credentials: process.env.CORS_CREDENTIALS === "true",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  morgan: {
    format: process.env.MORGAN_FORMAT || "dev",
  },

  mongo: {
    uri: getMongoUri(),
    options: {
      autoIndex: !(process.env.NODE_ENV === "production"),
      maxPoolSize: parseInt(process.env.MONGO_POOL_SIZE || "10"),
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 10000,
      family: 4,
      tls: process.env.MONGO_TLS === "true",
      tlsAllowInvalidCertificates: false,
      retryWrites: true,
      w: "majority",
    },
  },
};

export default config;