"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const store = __importStar(require("../data/store"));
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const helpers_1 = require("../utils/helpers");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// ─── GET /api/medicines ─────────────────────────────────────────────
router.get('/', (_req, res) => {
    const medicines = store.getMedicines();
    const body = { success: true, data: medicines };
    res.json(body);
});
// ─── GET /api/medicines/low-stock ───────────────────────────────────
router.get('/low-stock', (req, res) => {
    const threshold = parseInt(req.query.threshold) || 20;
    const medicines = store.getLowStockMedicines(threshold);
    const body = { success: true, data: medicines };
    res.json(body);
});
// ─── GET /api/medicines/expiring ────────────────────────────────────
router.get('/expiring', (req, res) => {
    const days = parseInt(req.query.days) || 90;
    const medicines = store.getExpiringMedicines(days);
    const body = { success: true, data: medicines };
    res.json(body);
});
// ─── GET /api/medicines/:id ─────────────────────────────────────────
router.get('/:id', (req, res) => {
    const med = store.getMedicineById(req.params.id);
    if (!med) {
        const body = { success: false, error: 'Medicine not found' };
        res.status(404).json(body);
        return;
    }
    const body = { success: true, data: med };
    res.json(body);
});
// ─── POST /api/medicines ────────────────────────────────────────────
router.post('/', (0, rbac_1.authorize)('admin', 'pharmacist'), [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Medicine name is required'),
    (0, express_validator_1.body)('category').notEmpty().withMessage('Category is required'),
    (0, express_validator_1.body)('stock_quantity').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    (0, express_validator_1.body)('expiry_date').notEmpty().withMessage('Expiry date is required'),
    (0, express_validator_1.body)('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
], (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const body = { success: false, error: errors.array().map(e => e.msg).join(', ') };
        res.status(400).json(body);
        return;
    }
    const newMed = {
        id: (0, helpers_1.generateId)(),
        name: req.body.name,
        category: req.body.category,
        stock_quantity: req.body.stock_quantity,
        expiry_date: req.body.expiry_date,
        price: req.body.price,
        manufacturer: req.body.manufacturer || '',
        created_at: (0, helpers_1.nowISO)(),
    };
    store.createMedicine(newMed);
    const body = { success: true, data: newMed, message: 'Medicine added' };
    res.status(201).json(body);
});
// ─── PUT /api/medicines/:id ─────────────────────────────────────────
router.put('/:id', (0, rbac_1.authorize)('admin', 'pharmacist'), (req, res) => {
    const updated = store.updateMedicine(req.params.id, req.body);
    if (!updated) {
        const body = { success: false, error: 'Medicine not found' };
        res.status(404).json(body);
        return;
    }
    const body = { success: true, data: updated, message: 'Medicine updated' };
    res.json(body);
});
// ─── DELETE /api/medicines/:id ──────────────────────────────────────
router.delete('/:id', (0, rbac_1.authorize)('admin', 'pharmacist'), (req, res) => {
    const deleted = store.deleteMedicine(req.params.id);
    if (!deleted) {
        const body = { success: false, error: 'Medicine not found' };
        res.status(404).json(body);
        return;
    }
    const body = { success: true, message: 'Medicine deleted' };
    res.json(body);
});
exports.default = router;
//# sourceMappingURL=medicines.js.map