"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
exports.env = {
    PORT: parseInt(process.env.PORT || '5001', 10),
    DATABASE_URL: process.env.DATABASE_URL || '',
    JWT_SECRET: process.env.JWT_SECRET || 'medicare-ai-default-secret-change-me',
    JWT_EXPIRY: process.env.JWT_EXPIRY || '7d',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
    NODE_ENV: process.env.NODE_ENV || 'development',
    get isDemoMode() {
        return !this.DATABASE_URL;
    },
    get hasAIKey() {
        return !!this.GEMINI_API_KEY;
    },
};
//# sourceMappingURL=env.js.map