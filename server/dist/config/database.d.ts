import { Pool } from 'pg';
export declare const getPool: () => Pool | null;
export declare const query: (text: string, params?: unknown[]) => Promise<import("pg").QueryResult<any>>;
export declare const testConnection: () => Promise<boolean>;
//# sourceMappingURL=database.d.ts.map