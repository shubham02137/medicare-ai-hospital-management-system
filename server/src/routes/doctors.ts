import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import * as store from '../data/store';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { generateId, nowISO } from '../utils/helpers';
import { Doctor, ApiResponse } from '../types';

const router = Router();

router.use(authenticate);

// ─── GET /api/doctors ───────────────────────────────────────────────

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const doctors = await store.getDoctors();
  const body: ApiResponse = { success: true, data: doctors };
  res.json(body);
});

// ─── GET /api/doctors/:id ───────────────────────────────────────────

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const doctor = await store.getDoctorById(req.params.id);
  if (!doctor) {
    const body: ApiResponse = { success: false, error: 'Doctor not found' };
    res.status(404).json(body);
    return;
  }
  const body: ApiResponse = { success: true, data: doctor };
  res.json(body);
});

// ─── GET /api/doctors/:id/availability ──────────────────────────────

router.get('/:id/availability', async (req: Request, res: Response): Promise<void> => {
  const doctor = await store.getDoctorById(req.params.id);
  if (!doctor) {
    const body: ApiResponse = { success: false, error: 'Doctor not found' };
    res.status(404).json(body);
    return;
  }

  // Check existing appointments for the requested date
  const date = req.query.date as string | undefined;
  const appointments = date
    ? (await store.getAppointmentsByDoctor(doctor.id)).filter(a => a.date === date && a.status !== 'cancelled')
    : [];

  const bookedSlots = appointments.map(a => a.time_slot);

  const body: ApiResponse = {
    success: true,
    data: {
      doctor_id: doctor.id,
      doctor_name: doctor.full_name,
      availability: doctor.availability,
      bookedSlots,
    },
  };
  res.json(body);
});

// ─── POST /api/doctors ──────────────────────────────────────────────

router.post(
  '/',
  authorize('admin'),
  [
    body('full_name').notEmpty().withMessage('Full name is required'),
    body('specialization').notEmpty().withMessage('Specialization is required'),
    body('department_id').notEmpty().withMessage('Department is required'),
    body('consultation_fee').isNumeric().withMessage('Consultation fee must be a number'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const body: ApiResponse = { success: false, error: errors.array().map(e => e.msg).join(', ') };
      res.status(400).json(body);
      return;
    }

    const dept = await store.getDepartmentById(req.body.department_id);

    const newDoctor: Doctor = {
      id: generateId(),
      user_id: req.body.user_id || '',
      full_name: req.body.full_name,
      email: req.body.email || '',
      phone: req.body.phone || '',
      department_id: req.body.department_id,
      department_name: dept?.name || '',
      specialization: req.body.specialization,
      experience_years: req.body.experience_years || 0,
      availability: req.body.availability || [],
      consultation_fee: req.body.consultation_fee,
      avatar: req.body.avatar || '',
      created_at: nowISO(),
    };

    await store.createDoctor(newDoctor);
    const body: ApiResponse = { success: true, data: newDoctor, message: 'Doctor created' };
    res.status(201).json(body);
  },
);

// ─── PUT /api/doctors/:id ───────────────────────────────────────────

router.put('/:id', authorize('admin'), async (req: Request, res: Response): Promise<void> => {
  const updated = await store.updateDoctor(req.params.id, req.body);
  if (!updated) {
    const body: ApiResponse = { success: false, error: 'Doctor not found' };
    res.status(404).json(body);
    return;
  }
  const body: ApiResponse = { success: true, data: updated, message: 'Doctor updated' };
  res.json(body);
});

// ─── DELETE /api/doctors/:id ────────────────────────────────────────

router.delete('/:id', authorize('admin'), async (req: Request, res: Response): Promise<void> => {
  const deleted = await store.deleteDoctor(req.params.id);
  if (!deleted) {
    const body: ApiResponse = { success: false, error: 'Doctor not found' };
    res.status(404).json(body);
    return;
  }
  const body: ApiResponse = { success: true, message: 'Doctor deleted' };
  res.json(body);
});

export default router;
