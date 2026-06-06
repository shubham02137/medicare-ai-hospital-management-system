"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const aiService_1 = require("../services/aiService");
const auth_1 = require("../middleware/auth");
const rateLimit_1 = require("../middleware/rateLimit");
const env_1 = require("../config/env");
const router = (0, express_1.Router)();
// Apply auth middleware to all AI routes
router.use(auth_1.authenticate);
// Mount the custom memory-based rate limiter (limit to 15 requests per minute)
router.use((0, rateLimit_1.aiRateLimiter)(15, 60000));
// Check if Gemini API is configured before processing any AI requests
router.use((req, res, next) => {
    if (!env_1.env.hasAIKey) {
        const body = {
            success: false,
            error: 'Google Gemini AI is not configured on this server. Please add GEMINI_API_KEY to your server/.env file.'
        };
        res.status(503).json(body);
        return;
    }
    next();
});
// ─── POST /api/ai/symptom-check ─────────────────────────────────────
router.post('/symptom-check', [
    (0, express_validator_1.body)('symptoms').isArray().withMessage('Symptoms must be an array of strings'),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const body = { success: false, error: errors.array().map(e => e.msg).join(', ') };
        res.status(400).json(body);
        return;
    }
    try {
        const { symptoms } = req.body;
        const result = await (0, aiService_1.symptomCheck)(symptoms);
        const responseBody = {
            success: true,
            data: result,
        };
        res.json(responseBody);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message || 'Internal AI error' });
    }
});
// ─── POST /api/ai/summarize ─────────────────────────────────────────
router.post('/summarize', [
    (0, express_validator_1.body)('report_text').notEmpty().withMessage('Report text is required'),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const body = { success: false, error: errors.array().map(e => e.msg).join(', ') };
        res.status(400).json(body);
        return;
    }
    try {
        const { report_text } = req.body;
        const result = await (0, aiService_1.summarizeReport)(report_text);
        const responseBody = {
            success: true,
            data: result,
        };
        res.json(responseBody);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message || 'Internal AI error' });
    }
});
// ─── POST /api/ai/chat ──────────────────────────────────────────────
router.post('/chat', [
    (0, express_validator_1.body)('message').notEmpty().withMessage('Chat message is required'),
    (0, express_validator_1.body)('history').isArray().withMessage('Chat history must be an array of messages'),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const body = { success: false, error: errors.array().map(e => e.msg).join(', ') };
        res.status(400).json(body);
        return;
    }
    try {
        const { message, history } = req.body;
        const reply = await (0, aiService_1.chat)(message, history);
        const responseBody = {
            success: true,
            data: reply,
        };
        res.json(responseBody);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message || 'Internal AI error' });
    }
});
exports.default = router;
//# sourceMappingURL=ai.js.map