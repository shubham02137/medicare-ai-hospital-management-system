"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRateLimiter = void 0;
const ipCache = new Map();
/**
 * Custom memory-based rate limiting middleware.
 * @param limit Maximum number of requests allowed in the window
 * @param windowMs Time window in milliseconds
 */
const aiRateLimiter = (limit, windowMs) => {
    return (req, res, next) => {
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
            const body = {
                success: false,
                error: `Too many AI requests. Please try again after ${retryAfterSeconds} seconds.`
            };
            res.status(429).json(body);
            return;
        }
        next();
    };
};
exports.aiRateLimiter = aiRateLimiter;
//# sourceMappingURL=rateLimit.js.map