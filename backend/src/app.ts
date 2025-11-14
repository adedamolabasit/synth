import express from "express";
import cors from "cors";
import { LyricsController } from "./controllers/lyricsController";
import { upload } from "./middleware/upload";
import multer from "multer";
import fs from "fs";
import path from "path";
import { setupSwagger } from "../swagger";
import config from "./config/config";
import helmet from "helmet";
import morgan from "morgan";
import lyricsRoutes from "./routes/lyricsRoutes";

const app = express();
const lyricsController = new LyricsController();

// Load environment variables if needed
// import dotenv from 'dotenv'; dotenv.config();

// Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Whitelist origins
const allowedOrigins = [
  "https://core-backend-1735.postman.co",
  "http://localhost:3000", // your local frontend
  "*", // optionally allow all origins (less secure)
];

app.use(cors({
  origin: function (origin: any, callback: any) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Create uploads directory if it doesn't exist
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(config.morgan.format));
}

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Routes
app.use("/api/v1", lyricsRoutes);
setupSwagger(app);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("App error:", error);

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          error: "File too large. Maximum size is 25MB.",
        });
      }
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
);

export default app;
