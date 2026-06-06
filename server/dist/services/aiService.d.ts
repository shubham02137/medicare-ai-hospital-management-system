/**
 * AI Service for MediCare AI.
 * Strictly integrates with Google Gemini API.
 * Throws explicit configuration and runtime errors, and includes timeout protection.
 */
import { SymptomCheckResult, ReportSummary, ChatMessage } from '../types';
export declare const symptomCheck: (symptoms: string[]) => Promise<SymptomCheckResult>;
export declare const summarizeReport: (reportText: string) => Promise<ReportSummary>;
export declare const chat: (message: string, history: ChatMessage[]) => Promise<string>;
//# sourceMappingURL=aiService.d.ts.map