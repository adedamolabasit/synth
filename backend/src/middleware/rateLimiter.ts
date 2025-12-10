import { Request, Response, NextFunction } from "express";

interface RateLimitRecord {
  count: number;
  lastRequestTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
 
const WINDOW_MS = 60 * 1000; 
const MAX_REQUESTS = 30; 

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown";
  const currentTime = Date.now();

  const record = rateLimitMap.get(ip);

  if (record) {
    const timeDiff = currentTime - record.lastRequestTime;

    if (timeDiff > WINDOW_MS) {
      rateLimitMap.set(ip, { count: 1, lastRequestTime: currentTime });
      return next();
    }

    if (record.count >= MAX_REQUESTS) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
      });
    }

    record.count++;
    record.lastRequestTime = currentTime;
    return next();
  }

  rateLimitMap.set(ip, { count: 1, lastRequestTime: currentTime });
  next();
};
