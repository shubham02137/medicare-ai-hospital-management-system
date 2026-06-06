import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '5001', 10),
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'medicare-ai-default-secret-change-me',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '7d',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',

  get isDemoMode(): boolean {
    return !this.DATABASE_URL;
  },

  get hasAIKey(): boolean {
    return !!this.GEMINI_API_KEY;
  },
};
