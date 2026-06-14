import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import * as store from '../data/store';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { generateId, nowISO } from '../utils/helpers';
import { Department, ApiResponse } from '../types';

const router = Router();

router.use(authenticate);

// ─── GET /api/departments ───────────────────────────────────────────

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const departments = await store.getDepartments();
  const body: ApiResponse = { success: true, data: departments };
  res.json(body);
});

// ─── GET /api/departments/:id ───────────────────────────────────────

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const dept = await store.getDepartmentById(req.params.id);
  if (!dept) {
    const body: ApiResponse = { success: false, error: 'Department not found' };
    res.status(404).json(body);
    return;
  }
  const body: ApiResponse = { success: true, data: dept };
  res.json(body);
});

// ─── POST /api/departments ──────────────────────────────────────────

router.post(
  '/',
  authorize('admin'),
  [
    body('name').notEmpty().withMessage('Department name is required'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const body: ApiResponse = { success: false, error: errors.array().map(e => e.msg).join(', ') };
      res.status(400).json(body);
      return;
    }

    const newDept: Department = {
      id: generateId(),
      name: req.body.name,
      description: req.body.description || '',
      head_doctor_id: req.body.head_doctor_id || undefined,
      created_at: nowISO(),
    };

    await store.createDepartment(newDept);
    const body: ApiResponse = { success: true, data: newDept, message: 'Department created' };
    res.status(201).json(body);
  },
);

// ─── PUT /api/departments/:id ───────────────────────────────────────

router.put('/:id', authorize('admin'), async (req: Request, res: Response): Promise<void> => {
  const updated = await store.updateDepartment(req.params.id, req.body);
  if (!updated) {
    const body: ApiResponse = { success: false, error: 'Department not found' };
    res.status(404).json(body);
    return;
  }
  const body: ApiResponse = { success: true, data: updated, message: 'Department updated' };
  res.json(body);
});

// ─── DELETE /api/departments/:id ────────────────────────────────────

router.delete('/:id', authorize('admin'), async (req: Request, res: Response): Promise<void> => {
  const deleted = await store.deleteDepartment(req.params.id);
  if (!deleted) {
    const body: ApiResponse = { success: false, error: 'Department not found' };
    res.status(404).json(body);
    return;
  }
  const body: ApiResponse = { success: true, message: 'Department deleted' };
  res.json(body);
});

export default router;
