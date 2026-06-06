"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
/**
 * Global error handler – catches unhandled errors from route handlers.
 * Must be registered AFTER all routes.
 */
const errorHandler = (err, _req, res, _next) => {
    console.error('💥 Unhandled error:', err.message);
    if (process.env.NODE_ENV !== 'production') {
        console.error(err.stack);
    }
    const body = {
        success: false,
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message,
    };
    res.status(500).json(body);
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map