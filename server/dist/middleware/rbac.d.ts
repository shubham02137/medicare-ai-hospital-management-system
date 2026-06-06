import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';
/**
 * Factory function that returns middleware restricting access to the
 * specified roles. Must be placed AFTER the `authenticate` middleware.
 */
export declare const authorize: (...roles: UserRole[]) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=rbac.d.ts.map