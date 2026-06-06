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
// All patient routes require authentication
router.use(auth_1.authenticate);
// ─── GET /api/patients ──────────────────────────────────────────────
router.get('/', (_req, res) => {
    const { search } = _req.query;
    const patients = search
        ? store.searchPatients(search)
        : store.getPatients();
    const body = { success: true, data: patients };
    res.json(body);
});
// ─── GET /api/patients/:id ──────────────────────────────────────────
router.get('/:id', (req, res) => {
    const patient = store.getPatientById(req.params.id);
    if (!patient) {
        const body = { success: false, error: 'Patient not found' };
        res.status(404).json(body);
        return;
    }
    const body = { success: true, data: patient };
    res.json(body);
});
// ─── POST /api/patients ─────────────────────────────────────────────
router.post('/', (0, rbac_1.authorize)('admin', 'receptionist', 'doctor'), [
    (0, express_validator_1.body)('full_name').notEmpty().withMessage('Full name is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('phone').notEmpty().withMessage('Phone is required'),
    (0, express_validator_1.body)('date_of_birth').notEmpty().withMessage('Date of birth is required'),
    (0, express_validator_1.body)('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
    (0, express_validator_1.body)('blood_group').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Valid blood group is required'),
], (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const body = { success: false, error: errors.array().map(e => e.msg).join(', ') };
        res.status(400).json(body);
        return;
    }
    const newPatient = {
        id: (0, helpers_1.generateId)(),
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
        created_at: (0, helpers_1.nowISO)(),
    };
    store.createPatient(newPatient);
    const body = { success: true, data: newPatient, message: 'Patient created' };
    res.status(201).json(body);
});
// ─── PUT /api/patients/:id ──────────────────────────────────────────
router.put('/:id', (0, rbac_1.authorize)('admin', 'receptionist', 'doctor'), (req, res) => {
    const updated = store.updatePatient(req.params.id, req.body);
    if (!updated) {
        const body = { success: false, error: 'Patient not found' };
        res.status(404).json(body);
        return;
    }
    const body = { success: true, data: updated, message: 'Patient updated' };
    res.json(body);
});
// ─── DELETE /api/patients/:id ───────────────────────────────────────
router.delete('/:id', (0, rbac_1.authorize)('admin'), (req, res) => {
    const deleted = store.deletePatient(req.params.id);
    if (!deleted) {
        const body = { success: false, error: 'Patient not found' };
        res.status(404).json(body);
        return;
    }
    const body = { success: true, message: 'Patient deleted' };
    res.json(body);
});
exports.default = router;
//# sourceMappingURL=patients.js.map