import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { symptomCheck, summarizeReport, chat } from '../services/aiService';
import { authenticate } from '../middleware/auth';
import { aiRateLimiter } from '../middleware/rateLimit';
import { env } from '../config/env';
import { ApiResponse } from '../types';

const router = Router();

// Apply auth middleware to all AI routes
router.use(authenticate);

// Mount the custom memory-based rate limiter (limit to 15 requests per minute)
router.use(aiRateLimiter(15, 60000));

// Check if Gemini API is configured before processing any AI requests
router.use((req: Request, res: Response, next): void => {
  if (!env.hasAIKey) {
    const body: ApiResponse = {
      success: false,
      error: 'Google Gemini AI is not configured on this server. Please add GEMINI_API_KEY to your server/.env file.'
    };
    res.status(503).json(body);
    return;
  }
  next();
});

// ─── POST /api/ai/symptom-check ─────────────────────────────────────
router.post(
  '/symptom-check',
  [
    body('symptoms').isArray().withMessage('Symptoms must be an array of strings'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const body: ApiResponse = { success: false, error: errors.array().map(e => e.msg).join(', ') };
      res.status(400).json(body);
      return;
    }

    try {
      const { symptoms } = req.body;
      const result = await symptomCheck(symptoms);
      const responseBody: ApiResponse = {
        success: true,
        data: result,
      };
      res.json(responseBody);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal AI error' });
    }
  }
);

// ─── POST /api/ai/summarize ─────────────────────────────────────────
router.post(
  '/summarize',
  [
    body('report_text').notEmpty().withMessage('Report text is required'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const body: ApiResponse = { success: false, error: errors.array().map(e => e.msg).join(', ') };
      res.status(400).json(body);
      return;
    }

    try {
      const { report_text } = req.body;
      const result = await summarizeReport(report_text);
      const responseBody: ApiResponse = {
        success: true,
        data: result,
      };
      res.json(responseBody);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal AI error' });
    }
  }
);

// ─── POST /api/ai/chat ──────────────────────────────────────────────
router.post(
  '/chat',
  [
    body('message').notEmpty().withMessage('Chat message is required'),
    body('history').isArray().withMessage('Chat history must be an array of messages'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const body: ApiResponse = { success: false, error: errors.array().map(e => e.msg).join(', ') };
      res.status(400).json(body);
      return;
    }

    try {
      const { message, history } = req.body;
      const reply = await chat(message, history);
      const responseBody: ApiResponse = {
        success: true,
        data: reply,
      };
      res.json(responseBody);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal AI error' });
    }
  }
);

export default router;
