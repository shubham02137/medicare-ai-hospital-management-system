"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./middleware/errorHandler");
// Import route handlers
const auth_1 = __importDefault(require("./routes/auth"));
const patients_1 = __importDefault(require("./routes/patients"));
const doctors_1 = __importDefault(require("./routes/doctors"));
const appointments_1 = __importDefault(require("./routes/appointments"));
const prescriptions_1 = __importDefault(require("./routes/prescriptions"));
const medicines_1 = __importDefault(require("./routes/medicines"));
const labReports_1 = __importDefault(require("./routes/labReports"));
const billings_1 = __importDefault(require("./routes/billings"));
const vitals_1 = __importDefault(require("./routes/vitals"));
const departments_1 = __importDefault(require("./routes/departments"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const ai_1 = __importDefault(require("./routes/ai"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = env_1.env.PORT || 5001;
// Middleware configuration
app.use((0, cors_1.default)({
    origin: '*', // For demo / college project purposes, accept all origins
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Request/Response logging middleware
app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.url} - Body:`, JSON.stringify(req.body));
    const originalJson = res.json;
    res.json = function (body) {
        console.log(`[HTTP] ${req.method} ${req.url} - Status: ${res.statusCode} - Body:`, JSON.stringify(body));
        return originalJson.call(this, body);
    };
    next();
});
// Healthcheck endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});
// Mount routers under /api namespace
app.use('/api/auth', auth_1.default);
app.use('/api/patients', patients_1.default);
app.use('/api/doctors', doctors_1.default);
app.use('/api/appointments', appointments_1.default);
app.use('/api/prescriptions', prescriptions_1.default);
app.use('/api/medicines', medicines_1.default);
app.use('/api/lab-reports', labReports_1.default);
app.use('/api/billings', billings_1.default);
app.use('/api/vitals', vitals_1.default);
app.use('/api/departments', departments_1.default);
app.use('/api/analytics', analytics_1.default);
app.use('/api/ai', ai_1.default);
// Global Error Handler Middleware
app.use(errorHandler_1.errorHandler);
// Start listening for requests
app.listen(port, () => {
    console.log(`🚀 MediCare AI Backend Server running at http://localhost:${port}`);
    console.log(`🧠 AI features are using: ${env_1.env.hasAIKey ? 'Gemini Pro API' : 'Demo Mock Responses'}`);
});
exports.default = app;
// Restart timestamp: 2026-06-05T12:54:18.744Z
//# sourceMappingURL=index.js.map