"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
/**
 * Factory function that returns middleware restricting access to the
 * specified roles. Must be placed AFTER the `authenticate` middleware.
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            const body = { success: false, error: 'Authentication required.' };
            res.status(401).json(body);
            return;
        }
        if (!roles.includes(req.user.role)) {
            const body = {
                success: false,
                error: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}.`,
            };
            res.status(403).json(body);
            return;
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=rbac.js.map