import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import * as store from '../data/store';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { generateId, nowISO } from '../utils/helpers';
import { Medicine, ApiResponse } from '../types';

const router = Router();

router.use(authenticate);

// ─── GET /api/medicines ─────────────────────────────────────────────

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const medicines = await store.getMedicines();
  const body: ApiResponse = { success: true, data: medicines };
  res.json(body);
});

// ─── GET /api/medicines/low-stock ───────────────────────────────────

router.get('/low-stock', async (req: Request, res: Response): Promise<void> => {
  const threshold = parseInt(req.query.threshold as string) || 20;
  const medicines = await store.getLowStockMedicines(threshold);
  const body: ApiResponse = { success: true, data: medicines };
  res.json(body);
});

// ─── GET /api/medicines/expiring ────────────────────────────────────

router.get('/expiring', async (req: Request, res: Response): Promise<void> => {
  const days = parseInt(req.query.days as string) || 90;
  const medicines = await store.getExpiringMedicines(days);
  const body: ApiResponse = { success: true, data: medicines };
  res.json(body);
});

// ─── GET /api/medicines/:id ─────────────────────────────────────────

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const med = await store.getMedicineById(req.params.id);
  if (!med) {
    const body: ApiResponse = { success: false, error: 'Medicine not found' };
    res.status(404).json(body);
    return;
  }
  const body: ApiResponse = { success: true, data: med };
  res.json(body);
});

// ─── POST /api/medicines ────────────────────────────────────────────

router.post(
  '/',
  authorize('admin', 'pharmacist'),
  [
    body('name').notEmpty().withMessage('Medicine name is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('stock_quantity').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('expiry_date').notEmpty().withMessage('Expiry date is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const body: ApiResponse = { success: false, error: errors.array().map(e => e.msg).join(', ') };
      res.status(400).json(body);
      return;
    }

    const newMed: Medicine = {
      id: generateId(),
      name: req.body.name,
      category: req.body.category,
      stock_quantity: req.body.stock_quantity,
      expiry_date: req.body.expiry_date,
      price: req.body.price,
      manufacturer: req.body.manufacturer || '',
      created_at: nowISO(),
    };

    await store.createMedicine(newMed);
    const body: ApiResponse = { success: true, data: newMed, message: 'Medicine added' };
    res.status(201).json(body);
  },
);

// ─── PUT /api/medicines/:id ─────────────────────────────────────────

router.put('/:id', authorize('admin', 'pharmacist'), async (req: Request, res: Response): Promise<void> => {
  const updated = await store.updateMedicine(req.params.id, req.body);
  if (!updated) {
    const body: ApiResponse = { success: false, error: 'Medicine not found' };
    res.status(404).json(body);
    return;
  }
  const body: ApiResponse = { success: true, data: updated, message: 'Medicine updated' };
  res.json(body);
});

// ─── DELETE /api/medicines/:id ──────────────────────────────────────

router.delete('/:id', authorize('admin', 'pharmacist'), async (req: Request, res: Response): Promise<void> => {
  const deleted = await store.deleteMedicine(req.params.id);
  if (!deleted) {
    const body: ApiResponse = { success: false, error: 'Medicine not found' };
    res.status(404).json(body);
    return;
  }
  const body: ApiResponse = { success: true, message: 'Medicine deleted' };
  res.json(body);
});

export default router;
