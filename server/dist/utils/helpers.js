"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginate = exports.addDays = exports.formatDate = exports.nowISO = exports.comparePassword = exports.hashPassword = exports.generateId = void 0;
const uuid_1 = require("uuid");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
/** Generate a v4 UUID */
const generateId = () => (0, uuid_1.v4)();
exports.generateId = generateId;
/** Hash a password with bcrypt (10 rounds) */
const hashPassword = async (password) => {
    return bcryptjs_1.default.hash(password, 10);
};
exports.hashPassword = hashPassword;
/** Compare plaintext against bcrypt hash */
const comparePassword = async (password, hash) => {
    return bcryptjs_1.default.compare(password, hash);
};
exports.comparePassword = comparePassword;
/** ISO date string for "now" */
const nowISO = () => new Date().toISOString();
exports.nowISO = nowISO;
/** Format a Date as YYYY-MM-DD */
const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};
exports.formatDate = formatDate;
/** Add days to a date and return YYYY-MM-DD */
const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return (0, exports.formatDate)(result);
};
exports.addDays = addDays;
/** Paginate an array (1-indexed page) */
const paginate = (items, page = 1, limit = 20) => {
    const total = items.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    return {
        data: items.slice(start, start + limit),
        total,
        page,
        totalPages,
    };
};
exports.paginate = paginate;
//# sourceMappingURL=helpers.js.map