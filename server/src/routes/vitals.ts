import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import * as store from '../data/store';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { generateId, nowISO } from '../utils/helpers';
import { Vitals, ApiResponse } from '../types';

const router = Router();

router.use(authenticate);

// ─── GET /api/vitals ────────────────────────────────────────────────

router.get('/', (_req: Request, res: Response): void => {
  const vitals = store.getVitals();
  const body: ApiResponse = { success: true, data: vitals };
  res.json(body);
});

// ─── GET /api/vitals/patient/:patientId ─────────────────────────────

router.get('/patient/:patientId', (req: Request, res: Response): void => {
  const vitals = store.getVitalsByPatient(req.params.patientId);
  const body: ApiResponse = { success: true, data: vitals };
  res.json(body);
});

// ─── GET /api/vitals/:id ────────────────────────────────────────────

router.get('/:id', (req: Request, res: Response): void => {
  const vital = store.getVitalById(req.params.id);
  if (!vital) {
    const body: ApiResponse = { success: false, error: 'Vital record not found' };
    res.status(404).json(body);
    return;
  }
  const body: ApiResponse = { success: true, data: vital };
  res.json(body);
});

// ─── POST /api/vitals ───────────────────────────────────────────────

router.post(
  '/',
  authorize('admin', 'nurse', 'doctor'),
  [
    body('patient_id').notEmpty().withMessage('Patient ID is required'),
    body('blood_pressure').notEmpty().withMessage('Blood pressure is required'),
    body('heart_rate').isInt({ min: 1 }).withMessage('Heart rate must be a positive integer'),
    body('temperature').isFloat().withMessage('Temperature is required'),
    body('oxygen_level').isInt({ min: 0, max: 100 }).withMessage('Oxygen level must be 0-100'),
    body('weight').isFloat({ min: 0 }).withMessage('Weight must be non-negative'),
  ],
  (req: Request, res: Response): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const body: ApiResponse = { success: false, error: errors.array().map(e => e.msg).join(', ') };
      res.status(400).json(body);
      return;
    }

    const patient = store.getPatientById(req.body.patient_id);

    const newVital: Vitals = {
      id: generateId(),
      patient_id: req.body.patient_id,
      patient_name: patient?.full_name || '',
      nurse_id: req.user?.userId,
      blood_pressure: req.body.blood_pressure,
      heart_rate: req.body.heart_rate,
      temperature: req.body.temperature,
      oxygen_level: req.body.oxygen_level,
      weight: req.body.weight,
      recorded_at: nowISO(),
    };

    store.createVital(newVital);
    const body: ApiResponse = { success: true, data: newVital, message: 'Vitals recorded' };
    res.status(201).json(body);
  },
);

// ─── DELETE /api/vitals/:id ─────────────────────────────────────────

router.delete('/:id', authorize('admin', 'nurse'), (req: Request, res: Response): void => {
  const success = store.deleteVital(req.params.id);
  if (!success) {
    const body: ApiResponse = { success: false, error: 'Vital record not found' };
    res.status(404).json(body);
    return;
  }
  const body: ApiResponse = { success: true, message: 'Vitals record deleted' };
  res.json(body);
});

export default router;
