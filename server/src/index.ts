import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { initDb } from './data/store';

// Import route handlers
import authRouter from './routes/auth';
import patientRouter from './routes/patients';
import doctorRouter from './routes/doctors';
import appointmentRouter from './routes/appointments';
import prescriptionRouter from './routes/prescriptions';
import medicineRouter from './routes/medicines';
import labReportRouter from './routes/labReports';
import billingRouter from './routes/billings';
import vitalsRouter from './routes/vitals';
import departmentRouter from './routes/departments';
import analyticsRouter from './routes/analytics';
import aiRouter from './routes/ai';

// Load environment variables
dotenv.config();

const app = express();
const port = env.PORT || 5001;

// Middleware configuration
app.use(cors({
  origin: '*', // For demo / college project purposes, accept all origins
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use('/api/auth', authRouter);
app.use('/api/patients', patientRouter);
app.use('/api/doctors', doctorRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/prescriptions', prescriptionRouter);
app.use('/api/medicines', medicineRouter);
app.use('/api/lab-reports', labReportRouter);
app.use('/api/billings', billingRouter);
app.use('/api/vitals', vitalsRouter);
app.use('/api/departments', departmentRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/ai', aiRouter);

// Global Error Handler Middleware
app.use(errorHandler);

// Initialize database and start listening for requests
initDb().then(() => {
  app.listen(port, () => {
    console.log(`🚀 MediCare AI Backend Server running at http://localhost:${port}`);
    console.log(`🧠 AI features are using: ${env.hasAIKey ? 'Gemini Pro API' : 'Demo Mock Responses'}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

export default app;





// Restart timestamp: 2026-06-14T18:19:10.000Z