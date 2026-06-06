import { Request, Response, NextFunction } from 'express';
/**
 * Custom memory-based rate limiting middleware.
 * @param limit Maximum number of requests allowed in the window
 * @param windowMs Time window in milliseconds
 */
export declare const aiRateLimiter: (limit: number, windowMs: number) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=rateLimit.d.ts.map