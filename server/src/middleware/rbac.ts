import { Request, Response, NextFunction } from 'express';
import { UserRole, ApiResponse } from '../types';

/**
 * Factory function that returns middleware restricting access to the
 * specified roles. Must be placed AFTER the `authenticate` middleware.
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const body: ApiResponse = { success: false, error: 'Authentication required.' };
      res.status(401).json(body);
      return;
    }

    if (!roles.includes(req.user.role)) {
      const body: ApiResponse = {
        success: false,
        error: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}.`,
      };
      res.status(403).json(body);
      return;
    }

    next();
  };
};
