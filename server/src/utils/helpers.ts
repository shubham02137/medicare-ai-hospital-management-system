import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

/** Generate a v4 UUID */
export const generateId = (): string => uuidv4();

/** Hash a password with bcrypt (10 rounds) */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

/** Compare plaintext against bcrypt hash */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/** ISO date string for "now" */
export const nowISO = (): string => new Date().toISOString();

/** Format a Date as YYYY-MM-DD */
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/** Add days to a date and return YYYY-MM-DD */
export const addDays = (date: Date, days: number): string => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return formatDate(result);
};

/** Paginate an array (1-indexed page) */
export const paginate = <T>(items: T[], page = 1, limit = 20): { data: T[]; total: number; page: number; totalPages: number } => {
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
