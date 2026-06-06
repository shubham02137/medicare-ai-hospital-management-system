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
// ─── GET /api/departments ───────────────────────────────────────────
router.get('/', (_req, res) => {
    const departments = store.getDepartments();
    const body = { success: true, data: departments };
    res.json(body);
});
// ─── GET /api/departments/:id ───────────────────────────────────────
router.get('/:id', (req, res) => {
    const dept = store.getDepartmentById(req.params.id);
    if (!dept) {
        const body = { success: false, error: 'Department not found' };
        res.status(404).json(body);
        return;
    }
    const body = { success: true, data: dept };
    res.json(body);
});
// ─── POST /api/departments ──────────────────────────────────────────
router.post('/', (0, rbac_1.authorize)('admin'), [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Department name is required'),
], (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const body = { success: false, error: errors.array().map(e => e.msg).join(', ') };
        res.status(400).json(body);
        return;
    }
    const newDept = {
        id: (0, helpers_1.generateId)(),
        name: req.body.name,
        description: req.body.description || '',
        head_doctor_id: req.body.head_doctor_id || undefined,
        created_at: (0, helpers_1.nowISO)(),
    };
    store.createDepartment(newDept);
    const body = { success: true, data: newDept, message: 'Department created' };
    res.status(201).json(body);
});
// ─── PUT /api/departments/:id ───────────────────────────────────────
router.put('/:id', (0, rbac_1.authorize)('admin'), (req, res) => {
    const updated = store.updateDepartment(req.params.id, req.body);
    if (!updated) {
        const body = { success: false, error: 'Department not found' };
        res.status(404).json(body);
        return;
    }
    const body = { success: true, data: updated, message: 'Department updated' };
    res.json(body);
});
// ─── DELETE /api/departments/:id ────────────────────────────────────
router.delete('/:id', (0, rbac_1.authorize)('admin'), (req, res) => {
    const deleted = store.deleteDepartment(req.params.id);
    if (!deleted) {
        const body = { success: false, error: 'Department not found' };
        res.status(404).json(body);
        return;
    }
    const body = { success: true, message: 'Department deleted' };
    res.json(body);
});
exports.default = router;
//# sourceMappingURL=departments.js.map