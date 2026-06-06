import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import * as store from '../data/store';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { generateId, nowISO } from '../utils/helpers';
import { LabReport, ApiResponse } from '../types';

const router = Router();

router.use(authenticate);

// ─── GET /api/lab-reports ───────────────────────────────────────────

router.get('/', (req: Request, res: Response): void => {
  let reports = store.getLabReports();
  const { status } = req.query;
  if (status) {
    reports = reports.filter(r => r.status === status);
  }
  const body: ApiResponse = { success: true, data: reports };
  res.json(body);
});

// ─── GET /api/lab-reports/patient/:patientId ────────────────────────

router.get('/patient/:patientId', (req: Request, res: Response): void => {
  const reports = store.getLabReportsByPatient(req.params.patientId);
  const body: ApiResponse = { success: true, data: reports };
  res.json(body);
});

// ─── GET /api/lab-reports/:id ───────────────────────────────────────

router.get('/:id', (req: Request, res: Response): void => {
  const report = store.getLabReportById(req.params.id);
  if (!report) {
    const body: ApiResponse = { success: false, error: 'Lab report not found' };
    res.status(404).json(body);
    return;
  }
  const body: ApiResponse = { success: true, data: report };
  res.json(body);
});

// ─── POST /api/lab-reports ──────────────────────────────────────────

router.post(
  '/',
  authorize('admin', 'doctor', 'lab_technician'),
  [
    body('patient_id').notEmpty().withMessage('Patient ID is required'),
    body('doctor_id').notEmpty().withMessage('Doctor ID is required'),
    body('test_name').notEmpty().withMessage('Test name is required'),
    body('test_type').notEmpty().withMessage('Test type is required'),
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

    const newReport: LabReport = {
      id: generateId(),
      patient_id: req.body.patient_id,
      patient_name: patient?.full_name || '',
      doctor_id: req.body.doctor_id,
      doctor_name: doctor?.full_name || '',
      technician_id: req.body.technician_id || req.user?.userId,
      test_name: req.body.test_name,
      test_type: req.body.test_type,
      status: 'pending',
      results: req.body.results || [],
      report_url: req.body.report_url,
      created_at: nowISO(),
    };

    store.createLabReport(newReport);
    const body: ApiResponse = { success: true, data: newReport, message: 'Lab report created' };
    res.status(201).json(body);
  },
);

// ─── PUT /api/lab-reports/:id ───────────────────────────────────────

router.put('/:id', authorize('admin', 'doctor', 'lab_technician'), (req: Request, res: Response): void => {
  const updated = store.updateLabReport(req.params.id, req.body);
  if (!updated) {
    const body: ApiResponse = { success: false, error: 'Lab report not found' };
    res.status(404).json(body);
    return;
  }
  const body: ApiResponse = { success: true, data: updated, message: 'Lab report updated' };
  res.json(body);
});

// ─── DELETE /api/lab-reports/:id ────────────────────────────────────

router.delete('/:id', authorize('admin'), (req: Request, res: Response): void => {
  const deleted = store.deleteLabReport(req.params.id);
  if (!deleted) {
    const body: ApiResponse = { success: false, error: 'Lab report not found' };
    res.status(404).json(body);
    return;
  }
  const body: ApiResponse = { success: true, message: 'Lab report deleted' };
  res.json(body);
});

export default router;
