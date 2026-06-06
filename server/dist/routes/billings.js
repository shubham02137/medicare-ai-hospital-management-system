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
// ─── GET /api/billings ──────────────────────────────────────────────
router.get('/', (req, res) => {
    let billings = store.getBillings();
    const { payment_status } = req.query;
    if (payment_status) {
        billings = billings.filter(b => b.payment_status === payment_status);
    }
    const body = { success: true, data: billings };
    res.json(body);
});
// ─── GET /api/billings/patient/:patientId ───────────────────────────
router.get('/patient/:patientId', (req, res) => {
    const billings = store.getBillingsByPatient(req.params.patientId);
    const body = { success: true, data: billings };
    res.json(body);
});
// ─── GET /api/billings/:id ──────────────────────────────────────────
router.get('/:id', (req, res) => {
    const billing = store.getBillingById(req.params.id);
    if (!billing) {
        const body = { success: false, error: 'Billing record not found' };
        res.status(404).json(body);
        return;
    }
    const body = { success: true, data: billing };
    res.json(body);
});
// ─── POST /api/billings ─────────────────────────────────────────────
router.post('/', (0, rbac_1.authorize)('admin', 'receptionist'), [
    (0, express_validator_1.body)('patient_id').notEmpty().withMessage('Patient ID is required'),
    (0, express_validator_1.body)('consultation_fee').isFloat({ min: 0 }).withMessage('Consultation fee must be non-negative'),
    (0, express_validator_1.body)('total_amount').isFloat({ min: 0 }).withMessage('Total amount must be non-negative'),
], (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const body = { success: false, error: errors.array().map(e => e.msg).join(', ') };
        res.status(400).json(body);
        return;
    }
    const patient = store.getPatientById(req.body.patient_id);
    const newBilling = {
        id: (0, helpers_1.generateId)(),
        patient_id: req.body.patient_id,
        patient_name: patient?.full_name || '',
        appointment_id: req.body.appointment_id || undefined,
        consultation_fee: req.body.consultation_fee || 0,
        lab_charges: req.body.lab_charges || 0,
        medicine_charges: req.body.medicine_charges || 0,
        total_amount: req.body.total_amount,
        payment_status: req.body.payment_status || 'pending',
        created_at: (0, helpers_1.nowISO)(),
    };
    store.createBilling(newBilling);
    const body = { success: true, data: newBilling, message: 'Billing record created' };
    res.status(201).json(body);
});
exports.default = router;
//# sourceMappingURL=billings.js.map