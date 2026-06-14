import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import * as store from '../data/store';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { generateId, nowISO } from '../utils/helpers';
import { Patient, ApiResponse } from '../types';

const router = Router();

// All patient routes require authentication
router.use(authenticate);

// ─── GET /api/patients ──────────────────────────────────────────────

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const { search } = _req.query;
  const patients = search
    ? await store.searchPatients(search as string)
    : await store.getPatients();

  const body: ApiResponse = { success: true, data: patients };
  res.json(body);
});

// ─── GET /api/patients/:id ──────────────────────────────────────────

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const patient = await store.getPatientById(req.params.id);
  if (!patient) {
    const body: ApiResponse = { success: false, error: 'Patient not found' };
    res.status(404).json(body);
    return;
  }
  const body: ApiResponse = { success: true, data: patient };
  res.json(body);
});

// ─── POST /api/patients ─────────────────────────────────────────────

router.post(
  '/',
  authorize('admin', 'receptionist', 'doctor'),
  [
    body('full_name').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('date_of_birth').notEmpty().withMessage('Date of birth is required'),
    body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
    body('blood_group').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Valid blood group is required'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const body: ApiResponse = { success: false, error: errors.array().map(e => e.msg).join(', ') };
      res.status(400).json(body);
      return;
    }

    const newPatient: Patient = {
      id: generateId(),
      user_id: req.body.user_id || '',
      full_name: req.body.full_name,
      email: req.body.email,
      phone: req.body.phone,
      date_of_birth: req.body.date_of_birth,
      gender: req.body.gender,
      blood_group: req.body.blood_group,
      address: req.body.address || '',
      emergency_contact: req.body.emergency_contact || '',
      medical_history: req.body.medical_history || [],
      created_at: nowISO(),
    };

    await store.createPatient(newPatient);
    const body: ApiResponse = { success: true, data: newPatient, message: 'Patient created' };
    res.status(201).json(body);
  },
);

// ─── PUT /api/patients/:id ──────────────────────────────────────────

router.put('/:id', authorize('admin', 'receptionist', 'doctor'), async (req: Request, res: Response): Promise<void> => {
  const updated = await store.updatePatient(req.params.id, req.body);
  if (!updated) {
    const body: ApiResponse = { success: false, error: 'Patient not found' };
    res.status(404).json(body);
    return;
  }
  const body: ApiResponse = { success: true, data: updated, message: 'Patient updated' };
  res.json(body);
});

// ─── DELETE /api/patients/:id ───────────────────────────────────────

router.delete('/:id', authorize('admin'), async (req: Request, res: Response): Promise<void> => {
  const deleted = await store.deletePatient(req.params.id);
  if (!deleted) {
    const body: ApiResponse = { success: false, error: 'Patient not found' };
    res.status(404).json(body);
    return;
  }
  const body: ApiResponse = { success: true, message: 'Patient deleted' };
  res.json(body);
});

export default router;
