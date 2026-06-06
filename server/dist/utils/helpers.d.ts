/** Generate a v4 UUID */
export declare const generateId: () => string;
/** Hash a password with bcrypt (10 rounds) */
export declare const hashPassword: (password: string) => Promise<string>;
/** Compare plaintext against bcrypt hash */
export declare const comparePassword: (password: string, hash: string) => Promise<boolean>;
/** ISO date string for "now" */
export declare const nowISO: () => string;
/** Format a Date as YYYY-MM-DD */
export declare const formatDate: (date: Date) => string;
/** Add days to a date and return YYYY-MM-DD */
export declare const addDays: (date: Date, days: number) => string;
/** Paginate an array (1-indexed page) */
export declare const paginate: <T>(items: T[], page?: number, limit?: number) => {
    data: T[];
    total: number;
    page: number;
    totalPages: number;
};
//# sourceMappingURL=helpers.d.ts.map