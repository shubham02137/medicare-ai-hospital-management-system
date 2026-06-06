import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import * as store from '../data/store';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { generateId, nowISO } from '../utils/helpers';
import { Prescription, ApiResponse } from '../types';

const router = Router();

router.use(authenticate);

// ─── GET /api/prescriptions ─────────────────────────────────────────

router.get('/', (_req: Request, res: Response): void => {
  const prescriptions = store.getPrescriptions();
  const body: ApiResponse = { success: true, data: prescriptions };
  res.json(body);
});

// ─── GET /api/prescriptions/patient/:patientId ──────────────────────

router.get('/patient/:patientId', (req: Request, res: Response): void => {
  const prescriptions = store.getPrescriptionsByPatient(req.params.patientId);
  const body: ApiResponse = { success: true, data: prescriptions };
  res.json(body);
});

// ─── GET /api/prescriptions/:id ─────────────────────────────────────

router.get('/:id', (req: Request, res: Response): void => {
  const presc = store.getPrescriptionById(req.params.id);
  if (!presc) {
    const body: ApiResponse = { success: false, error: 'Prescription not found' };
    res.status(404).json(body);
    return;
  }
  const body: ApiResponse = { success: true, data: presc };
  res.json(body);
});

// ─── POST /api/prescriptions ────────────────────────────────────────

router.post(
  '/',
  authorize('doctor'),
  [
    body('patient_id').notEmpty().withMessage('Patient ID is required'),
    body('diagnosis').notEmpty().withMessage('Diagnosis is required'),
    body('medicines').optional().isArray().withMessage('Medicines must be an array'),
  ],
  (req: Request, res: Response): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const body: ApiResponse = { success: false, error: errors.array().map(e => e.msg).join(', ') };
      res.status(400).json(body);
      return;
    }

    const patient = store.getPatientById(req.body.patient_id);
    const doctor = store.getDoctorByUserId(req.user!.userId);

    let referralSpecialistName = '';
    if (req.body.referral_specialist_id) {
      const specDoc = store.getDoctorById(req.body.referral_specialist_id);
      if (specDoc) {
        referralSpecialistName = specDoc.full_name;
      }
    }

    const newPresc: Prescription = {
      id: generateId(),
      appointment_id: req.body.appointment_id || '',
      doctor_id: doctor?.id || req.body.doctor_id || '',
      doctor_name: doctor?.full_name || req.body.doctor_name || '',
      patient_id: req.body.patient_id,
      patient_name: patient?.full_name || req.body.patient_name || '',
      diagnosis: req.body.diagnosis,
      medicines: req.body.medicines || [],
      instructions: req.body.instructions || '',
      clinical_notes: req.body.clinical_notes || '',
      request_admission: !!req.body.request_admission,
      admission_notes: req.body.admission_notes || '',
      referral_specialist_id: req.body.referral_specialist_id || '',
      referral_specialist_name: referralSpecialistName || req.body.referral_specialist_name || '',
      referral_notes: req.body.referral_notes || '',
      follow_up_date: req.body.follow_up_date || undefined,
      created_at: nowISO(),
    };

    store.createPrescription(newPresc);
    const body: ApiResponse = { success: true, data: newPresc, message: 'Prescription created' };
    res.status(201).json(body);
  },
);

export default router;
