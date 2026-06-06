import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { ApiResponse } from '../types';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    const body: ApiResponse = { success: false, error: 'Authentication required. Please provide a valid Bearer token.' };
    res.status(401).json(body);
    return;
  }

  const token = header.split(' ')[1];

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    const body: ApiResponse = { success: false, error: 'Invalid or expired token.' };
    res.status(401).json(body);
  }
};
