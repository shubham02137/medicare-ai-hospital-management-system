import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import * as store from '../data/store';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { generateId, nowISO } from '../utils/helpers';
import { Appointment, ApiResponse } from '../types';

const router = Router();

router.use(authenticate);

// ─── GET /api/appointments ──────────────────────────────────────────

router.get('/', (req: Request, res: Response): void => {
  let appointments = store.getAppointments();

  // Filter by status
  const { status, date } = req.query;
  if (status) {
    appointments = appointments.filter(a => a.status === status);
  }
  if (date) {
    appointments = appointments.filter(a => a.date === date);
  }

  const body: ApiResponse = { success: true, data: appointments };
  res.json(body);
});

// ─── GET /api/appointments/doctor/:doctorId ─────────────────────────

router.get('/doctor/:doctorId', (req: Request, res: Response): void => {
  const appointments = store.getAppointmentsByDoctor(req.params.doctorId);
  const body: ApiResponse = { success: true, data: appointments };
  res.json(body);
});

// ─── GET /api/appointments/patient/:patientId ───────────────────────

router.get('/patient/:patientId', (req: Request, res: Response): void => {
  const appointments = store.getAppointmentsByPatient(req.params.patientId);
  const body: ApiResponse = { success: true, data: appointments };
  res.json(body);
});

// ─── GET /api/appointments/:id ──────────────────────────────────────

router.get('/:id', (req: Request, res: Response): void => {
  const appt = store.getAppointmentById(req.params.id);
  if (!appt) {
    const body: ApiResponse = { success: false, error: 'Appointment not found' };
    res.status(404).json(body);
    return;
  }
  const body: ApiResponse = { success: true, data: appt };
  res.json(body);
});

// ─── POST /api/appointments ─────────────────────────────────────────

router.post(
  '/',
  authorize('admin', 'receptionist', 'doctor', 'patient'),
  [
    body('patient_id').notEmpty().withMessage('Patient ID is required'),
    body('doctor_id').notEmpty().withMessage('Doctor ID is required'),
    body('date').notEmpty().withMessage('Date is required'),
    body('time_slot').notEmpty().withMessage('Time slot is required'),
  ],
  (req: Request, res: Response): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const body: ApiResponse = { success: false, error: errors.array().map(e => e.msg).join(', ') };
      res.status(400).json(body);
      return;
    }

    const patient = store.getPatientById(req.body.patient_id);
    const doctor = store.getDoctorById(req.body.doctor_id);

    if (!patient) {
      const body: ApiResponse = { success: false, error: 'Patient not found' };
      res.status(404).json(body);
      return;
    }
    if (!doctor) {
      const body: ApiResponse = { success: false, error: 'Doctor not found' };
      res.status(404).json(body);
      return;
    }

    // Check for time slot conflict
    const existing = store.getAppointmentsByDoctor(doctor.id).find(
      a => a.date === req.body.date && a.time_slot === req.body.time_slot && a.status !== 'cancelled'
    );
    if (existing) {
      const body: ApiResponse = { success: false, error: 'This time slot is already booked' };
      res.status(409).json(body);
      return;
    }

    const newAppt: Appointment = {
      id: generateId(),
      patient_id: req.body.patient_id,
      patient_name: patient.full_name,
      doctor_id: req.body.doctor_id,
      doctor_name: doctor.full_name,
      department_name: doctor.department_name || '',
      date: req.body.date,
      time_slot: req.body.time_slot,
      status: 'pending',
      notes: req.body.notes || '',
      created_at: nowISO(),
    };

    store.createAppointment(newAppt);
    const body: ApiResponse = { success: true, data: newAppt, message: 'Appointment requested' };
    res.status(201).json(body);
  },
);

// ─── PUT /api/appointments/:id ──────────────────────────────────────

router.put('/:id', (req: Request, res: Response): void => {
  const updated = store.updateAppointment(req.params.id, req.body);
  if (!updated) {
    const body: ApiResponse = { success: false, error: 'Appointment not found' };
    res.status(404).json(body);
    return;
  }
  const body: ApiResponse = { success: true, data: updated, message: 'Appointment updated' };
  res.json(body);
});

// ─── PUT /api/appointments/:id/cancel ───────────────────────────────

router.put('/:id/cancel', (req: Request, res: Response): void => {
  const appt = store.getAppointmentById(req.params.id);
  if (!appt) {
    const body: ApiResponse = { success: false, error: 'Appointment not found' };
    res.status(404).json(body);
    return;
  }
  if (appt.status === 'completed') {
    const body: ApiResponse = { success: false, error: 'Cannot cancel a completed appointment' };
    res.status(400).json(body);
    return;
  }

  const updated = store.updateAppointment(req.params.id, { status: 'cancelled' });
  const body: ApiResponse = { success: true, data: updated, message: 'Appointment cancelled' };
  res.json(body);
});

// ─── PUT /api/appointments/:id/confirm ──────────────────────────────

router.put('/:id/confirm', authorize('admin', 'doctor'), (req: Request, res: Response): void => {
  const appt = store.getAppointmentById(req.params.id);
  if (!appt) {
    const body: ApiResponse = { success: false, error: 'Appointment not found' };
    res.status(404).json(body);
    return;
  }
  if (appt.status !== 'pending') {
    const body: ApiResponse = { success: false, error: 'Only pending appointments can be confirmed' };
    res.status(400).json(body);
    return;
  }

  const updated = store.updateAppointment(req.params.id, { status: 'confirmed' });
  const body: ApiResponse = { success: true, data: updated, message: 'Appointment confirmed' };
  res.json(body);
});

// ─── PUT /api/appointments/:id/reject ───────────────────────────────

router.put('/:id/reject', authorize('admin', 'doctor'), (req: Request, res: Response): void => {
  const appt = store.getAppointmentById(req.params.id);
  if (!appt) {
    const body: ApiResponse = { success: false, error: 'Appointment not found' };
    res.status(404).json(body);
    return;
  }
  if (appt.status !== 'pending') {
    const body: ApiResponse = { success: false, error: 'Only pending appointments can be rejected' };
    res.status(400).json(body);
    return;
  }

  const updated = store.updateAppointment(req.params.id, { status: 'cancelled' });
  const body: ApiResponse = { success: true, data: updated, message: 'Appointment rejected' };
  res.json(body);
});

// ─── PUT /api/appointments/:id/complete ─────────────────────────────

router.put('/:id/complete', authorize('admin', 'doctor'), (req: Request, res: Response): void => {
  const appt = store.getAppointmentById(req.params.id);
  if (!appt) {
    const body: ApiResponse = { success: false, error: 'Appointment not found' };
    res.status(404).json(body);
    return;
  }
  if (appt.status !== 'confirmed') {
    const body: ApiResponse = { success: false, error: 'Only confirmed appointments can be completed' };
    res.status(400).json(body);
    return;
  }

  const updated = store.updateAppointment(req.params.id, { status: 'completed' });
  const body: ApiResponse = { success: true, data: updated, message: 'Appointment completed' };
  res.json(body);
});

// ─── DELETE /api/appointments/:id ───────────────────────────────────

router.delete('/:id', authorize('admin'), (req: Request, res: Response): void => {
  const deleted = store.deleteAppointment(req.params.id);
  if (!deleted) {
    const body: ApiResponse = { success: false, error: 'Appointment not found' };
    res.status(404).json(body);
    return;
  }
  const body: ApiResponse = { success: true, message: 'Appointment deleted' };
  res.json(body);
});

export default router;
