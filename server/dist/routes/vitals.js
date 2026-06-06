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
// ─── GET /api/vitals ────────────────────────────────────────────────
router.get('/', (_req, res) => {
    const vitals = store.getVitals();
    const body = { success: true, data: vitals };
    res.json(body);
});
// ─── GET /api/vitals/patient/:patientId ─────────────────────────────
router.get('/patient/:patientId', (req, res) => {
    const vitals = store.getVitalsByPatient(req.params.patientId);
    const body = { success: true, data: vitals };
    res.json(body);
});
// ─── GET /api/vitals/:id ────────────────────────────────────────────
router.get('/:id', (req, res) => {
    const vital = store.getVitalById(req.params.id);
    if (!vital) {
        const body = { success: false, error: 'Vital record not found' };
        res.status(404).json(body);
        return;
    }
    const body = { success: true, data: vital };
    res.json(body);
});
// ─── POST /api/vitals ───────────────────────────────────────────────
router.post('/', (0, rbac_1.authorize)('admin', 'nurse', 'doctor'), [
    (0, express_validator_1.body)('patient_id').notEmpty().withMessage('Patient ID is required'),
    (0, express_validator_1.body)('blood_pressure').notEmpty().withMessage('Blood pressure is required'),
    (0, express_validator_1.body)('heart_rate').isInt({ min: 1 }).withMessage('Heart rate must be a positive integer'),
    (0, express_validator_1.body)('temperature').isFloat().withMessage('Temperature is required'),
    (0, express_validator_1.body)('oxygen_level').isInt({ min: 0, max: 100 }).withMessage('Oxygen level must be 0-100'),
    (0, express_validator_1.body)('weight').isFloat({ min: 0 }).withMessage('Weight must be non-negative'),
], (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const body = { success: false, error: errors.array().map(e => e.msg).join(', ') };
        res.status(400).json(body);
        return;
    }
    const patient = store.getPatientById(req.body.patient_id);
    const newVital = {
        id: (0, helpers_1.generateId)(),
        patient_id: req.body.patient_id,
        patient_name: patient?.full_name || '',
        nurse_id: req.user?.userId,
        blood_pressure: req.body.blood_pressure,
        heart_rate: req.body.heart_rate,
        temperature: req.body.temperature,
        oxygen_level: req.body.oxygen_level,
        weight: req.body.weight,
        recorded_at: (0, helpers_1.nowISO)(),
    };
    store.createVital(newVital);
    const body = { success: true, data: newVital, message: 'Vitals recorded' };
    res.status(201).json(body);
});
// ─── DELETE /api/vitals/:id ─────────────────────────────────────────
router.delete('/:id', (0, rbac_1.authorize)('admin', 'nurse'), (req, res) => {
    const success = store.deleteVital(req.params.id);
    if (!success) {
        const body = { success: false, error: 'Vital record not found' };
        res.status(404).json(body);
        return;
    }
    const body = { success: true, message: 'Vitals record deleted' };
    res.json(body);
});
exports.default = router;
//# sourceMappingURL=vitals.js.map