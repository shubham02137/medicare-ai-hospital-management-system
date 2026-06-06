"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const authenticate = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        const body = { success: false, error: 'Authentication required. Please provide a valid Bearer token.' };
        res.status(401).json(body);
        return;
    }
    const token = header.split(' ')[1];
    try {
        const payload = (0, jwt_1.verifyToken)(token);
        req.user = payload;
        next();
    }
    catch {
        const body = { success: false, error: 'Invalid or expired token.' };
        res.status(401).json(body);
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.js.map