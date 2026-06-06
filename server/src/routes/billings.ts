import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import * as store from '../data/store';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { generateId, nowISO } from '../utils/helpers';
import { Billing, ApiResponse } from '../types';

const router = Router();

router.use(authenticate);

// ─── GET /api/billings ──────────────────────────────────────────────

router.get('/', (req: Request, res: Response): void => {
  let billings = store.getBillings();
  const { payment_status } = req.query;
  if (payment_status) {
    billings = billings.filter(b => b.payment_status === payment_status);
  }
  const body: ApiResponse = { success: true, data: billings };
  res.json(body);
});

// ─── GET /api/billings/patient/:patientId ───────────────────────────

router.get('/patient/:patientId', (req: Request, res: Response): void => {
  const billings = store.getBillingsByPatient(req.params.patientId);
  const body: ApiResponse = { success: true, data: billings };
  res.json(body);
});

// ─── GET /api/billings/:id ──────────────────────────────────────────

router.get('/:id', (req: Request, res: Response): void => {
  const billing = store.getBillingById(req.params.id);
  if (!billing) {
    const body: ApiResponse = { success: false, error: 'Billing record not found' };
    res.status(404).json(body);
    return;
  }
  const body: ApiResponse = { success: true, data: billing };
  res.json(body);
});

// ─── POST /api/billings ─────────────────────────────────────────────

router.post(
  '/',
  authorize('admin', 'receptionist'),
  [
    body('patient_id').notEmpty().withMessage('Patient ID is required'),
    body('consultation_fee').isFloat({ min: 0 }).withMessage('Consultation fee must be non-negative'),
    body('total_amount').isFloat({ min: 0 }).withMessage('Total amount must be non-negative'),
  ],
  (req: Request, res: Response): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const body: ApiResponse = { success: false, error: errors.array().map(e => e.msg).join(', ') };
      res.status(400).json(body);
      return;
    }

    const patient = store.getPatientById(req.body.patient_id);

    const newBilling: Billing = {
      id: generateId(),
      patient_id: req.body.patient_id,
      patient_name: patient?.full_name || '',
      appointment_id: req.body.appointment_id || undefined,
      consultation_fee: req.body.consultation_fee || 0,
      lab_charges: req.body.lab_charges || 0,
      medicine_charges: req.body.medicine_charges || 0,
      total_amount: req.body.total_amount,
      payment_status: req.body.payment_status || 'pending',
      created_at: nowISO(),
    };

    store.createBilling(newBilling);
    const body: ApiResponse = { success: true, data: newBilling, message: 'Billing record created' };
    res.status(201).json(body);
  },
);

export default router;
