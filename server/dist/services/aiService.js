"use strict";
/**
 * AI Service for MediCare AI.
 * Strictly integrates with Google Gemini API.
 * Throws explicit configuration and runtime errors, and includes timeout protection.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.chat = exports.summarizeReport = exports.symptomCheck = void 0;
const env_1 = require("../config/env");
let geminiModel = null;
/**
 * Lazy-loads the Google Generative AI client and resolves the Model.
 * Throws an error if the GEMINI_API_KEY is not configured.
 */
const getGeminiModel = async () => {
    if (geminiModel)
        return geminiModel;
    if (!env_1.env.hasAIKey) {
        throw new Error('Google Gemini API key is not configured. Please define GEMINI_API_KEY in your server/.env file.');
    }
    try {
        const { GoogleGenerativeAI } = await Promise.resolve().then(() => __importStar(require('@google/generative-ai')));
        const genAI = new GoogleGenerativeAI(env_1.env.GEMINI_API_KEY);
        geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        return geminiModel;
    }
    catch (err) {
        console.error('⚠️ Failed to initialize Google Generative AI client:', err);
        throw new Error('Failed to initialize Google Gemini Generative AI client.');
    }
};
/**
 * Helper function to wrap a promise with a timeout.
 */
const withTimeout = (promise, timeoutMs, errorMessage) => {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(errorMessage)), timeoutMs))
    ]);
};
// ─── Symptom Check ──────────────────────────────────────────────────
const symptomCheck = async (symptoms) => {
    const model = await getGeminiModel();
    const prompt = `You are a medical AI assistant. A patient reports the following symptoms: ${symptoms.join(', ')}.

Your main goal is to map these symptoms to one of these specific departments and recommend a doctor:
- Cardiology (for chest pain, pressure, heart palpitations, cardiovascular issues) -> Recommend: Dr. Priya Sharma
- Neurology (for headaches, migraines, dizziness, vertigo, seizures, numbness, coordination issues) -> Recommend: Dr. Amit Verma
- Dermatology (for skin rashes, eczema, hives, spots, itching) -> Recommend: Dr. Pooja Kapoor
- Ophthalmology (for vision issues, eye pain, blurry vision, sight problems) -> Recommend: Dr. Ritu Malhotra
- Psychiatry (for anxiety, depression, mood changes, panic, insomnia, mental health concerns) -> Recommend: Dr. Sneha Nair
- Orthopedics (for joint pain, bones, back pain, knee, shoulder, fractures, arthritis) -> Recommend: Dr. Vikram Rao
- Gastroenterology (for digestive symptoms, stomach pain, reflux, GERD, acid, nausea, bloating) -> Recommend: Dr. Priya Sharma
- General Medicine (for general issues like fever, cough, cold, flu, minor infections) -> Recommend: Dr. Priya Sharma

Respond ONLY with valid JSON in this exact format (do NOT wrap it in markdown block tags like \`\`\`json, no other explanation or text):
{
  "possibleConditions": [{"condition": "Possible Condition Name", "probability": "High/Medium/Low", "description": "Brief description of condition"}],
  "riskLevel": "low|medium|high|critical",
  "recommendedDepartment": "Name of Department",
  "recommendedDoctor": "Name of Doctor",
  "suggestedAction": "Suggested patient action",
  "disclaimer": "This is an AI-generated assessment and not a substitute for professional medical advice."
}`;
    try {
        const result = await withTimeout(model.generateContent(prompt), 15000, 'Gemini API request timed out after 15 seconds.');
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error('Failed to parse a valid JSON structure from Gemini response.');
    }
    catch (err) {
        throw new Error(`AI Symptom Check failed: ${err.message}`);
    }
};
exports.symptomCheck = symptomCheck;
// ─── Summarize Report ───────────────────────────────────────────────
const summarizeReport = async (reportText) => {
    const model = await getGeminiModel();
    const prompt = `You are a medical AI assistant. Analyze this clinical lab report or medical test text dynamically:

Report: ${reportText}

Identify all values that are abnormal (values that fall outside standard physiological reference ranges or are explicitly flagged as high, low, or abnormal). Detail their normal reference ranges as well.
Provide key insights, a concise summary paragraph, and recommended follow-up actions.

Respond ONLY with valid JSON in this exact format (do NOT wrap it in markdown block tags like \`\`\`json, no other explanation or text):
{
  "keyFindings": ["Finding 1...", "Finding 2..."],
  "abnormalValues": [
    {
      "parameter": "Parameter Name (e.g. Total Cholesterol)",
      "value": "Value (e.g. 265 mg/dL)",
      "normal_range": "Reference Range (e.g. < 200)",
      "status": "High/Low/Abnormal"
    }
  ],
  "summary": "Concise medical summary paragraph...",
  "followUpRecommendations": ["Recommendation 1...", "Recommendation 2..."]
}`;
    try {
        const result = await withTimeout(model.generateContent(prompt), 15000, 'Gemini API request timed out after 15 seconds.');
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                keyFindings: parsed.keyFindings || parsed.key_findings || [],
                abnormalValues: parsed.abnormalValues || parsed.abnormal_values || [],
                summary: parsed.summary || '',
                followUpRecommendations: parsed.followUpRecommendations || parsed.follow_up_recommendations || parsed.follow_up_recommendation || [],
            };
        }
        throw new Error('Failed to parse a valid JSON structure from Gemini response.');
    }
    catch (err) {
        throw new Error(`AI Medical Report Summary failed: ${err.message}`);
    }
};
exports.summarizeReport = summarizeReport;
// ─── Chat ───────────────────────────────────────────────────────────
const chat = async (message, history) => {
    const model = await getGeminiModel();
    const historyText = history
        .map(m => `${m.role === 'user' ? 'Patient' : 'AI Doctor'}: ${m.content}`)
        .join('\n');
    const prompt = `You are a helpful, empathetic medical AI assistant named MediCare AI at MediCare Hospital. 
You provide clear, informative, and general health information. You must NEVER give definitive diagnoses, but instead suggest potential causes and always advise the user to consult a qualified physician for specific medical advice.

Use the conversation history for context to provide personalized responses instead of generic answers.

Conversation history:
${historyText}

Patient: ${message}

Respond naturally, empathetically, and dynamically. Do NOT use static templates. Keep your response concise (2-4 sentences).`;
    try {
        const result = await withTimeout(model.generateContent(prompt), 15000, 'Gemini API request timed out after 15 seconds.');
        return result.response.text();
    }
    catch (err) {
        throw new Error(`AI Chat failed: ${err.message}`);
    }
};
exports.chat = chat;
//# sourceMappingURL=aiService.js.map