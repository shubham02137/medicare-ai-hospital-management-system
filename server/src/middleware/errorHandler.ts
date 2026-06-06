import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

/**
 * Global error handler – catches unhandled errors from route handlers.
 * Must be registered AFTER all routes.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error('💥 Unhandled error:', err.message);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  const body: ApiResponse = {
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  };

  res.status(500).json(body);
};
