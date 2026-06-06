import { Request, Response, NextFunction } from 'express';
/**
 * Global error handler – catches unhandled errors from route handlers.
 * Must be registered AFTER all routes.
 */
export declare const errorHandler: (err: Error, _req: Request, res: Response, _next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map