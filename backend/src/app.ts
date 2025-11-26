import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import { setupSwagger } from "../swagger";
import config from "./config/config";
import helmet from "helmet";
import morgan from "morgan";
import lyricsRoutes from "./routes/audioRoutes";
import videoRoutes from "./routes/videoRoutes"

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "https://core-backend-1735.postman.co",
  "http://localhost:3000", 
  "*", 
];

app.use(cors({
  origin: function (origin: any, callback: any) {
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

if (process.env.NODE_ENV !== "test") {
  app.use(morgan(config.morgan.format));
}

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/api/v1", lyricsRoutes);
app.use("/api/video", videoRoutes);
setupSwagger(app);

app.get("/health", (_req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use(
  (
    error: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {

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
