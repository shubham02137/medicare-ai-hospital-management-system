import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

const ipCache = new Map<string, RateLimitInfo>();

/**
 * Custom memory-based rate limiting middleware.
 * @param limit Maximum number of requests allowed in the window
 * @param windowMs Time window in milliseconds
 */
export const aiRateLimiter = (limit: number, windowMs: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    
    const info = ipCache.get(ip);
    
    if (!info) {
      ipCache.set(ip, {
        count: 1,
        resetTime: now + windowMs
      });
      next();
      return;
    }
    
    if (now > info.resetTime) {
      // Window expired, reset count and time window
      info.count = 1;
      info.resetTime = now + windowMs;
      next();
      return;
    }
    
    info.count++;
    
    if (info.count > limit) {
      const retryAfterSeconds = Math.ceil((info.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      const body: ApiResponse = {
        success: false,
        error: `Too many AI requests. Please try again after ${retryAfterSeconds} seconds.`
      };
      res.status(429).json(body);
      return;
    }
    
    next();
  };
};
