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
// ─── GET /api/prescriptions ─────────────────────────────────────────
router.get('/', (_req, res) => {
    const prescriptions = store.getPrescriptions();
    const body = { success: true, data: prescriptions };
    res.json(body);
});
// ─── GET /api/prescriptions/patient/:patientId ──────────────────────
router.get('/patient/:patientId', (req, res) => {
    const prescriptions = store.getPrescriptionsByPatient(req.params.patientId);
    const body = { success: true, data: prescriptions };
    res.json(body);
});
// ─── GET /api/prescriptions/:id ─────────────────────────────────────
router.get('/:id', (req, res) => {
    const presc = store.getPrescriptionById(req.params.id);
    if (!presc) {
        const body = { success: false, error: 'Prescription not found' };
        res.status(404).json(body);
        return;
    }
    const body = { success: true, data: presc };
    res.json(body);
});
// ─── POST /api/prescriptions ────────────────────────────────────────
router.post('/', (0, rbac_1.authorize)('doctor'), [
    (0, express_validator_1.body)('patient_id').notEmpty().withMessage('Patient ID is required'),
    (0, express_validator_1.body)('diagnosis').notEmpty().withMessage('Diagnosis is required'),
    (0, express_validator_1.body)('medicines').optional().isArray().withMessage('Medicines must be an array'),
], (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const body = { success: false, error: errors.array().map(e => e.msg).join(', ') };
        res.status(400).json(body);
        return;
    }
    const patient = store.getPatientById(req.body.patient_id);
    const doctor = store.getDoctorByUserId(req.user.userId);
    let referralSpecialistName = '';
    if (req.body.referral_specialist_id) {
        const specDoc = store.getDoctorById(req.body.referral_specialist_id);
        if (specDoc) {
            referralSpecialistName = specDoc.full_name;
        }
    }
    const newPresc = {
        id: (0, helpers_1.generateId)(),
        appointment_id: req.body.appointment_id || '',
        doctor_id: doctor?.id || req.body.doctor_id || '',
        doctor_name: doctor?.full_name || req.body.doctor_name || '',
        patient_id: req.body.patient_id,
        patient_name: patient?.full_name || req.body.patient_name || '',
        diagnosis: req.body.diagnosis,
        medicines: req.body.medicines || [],
        instructions: req.body.instructions || '',
        clinical_notes: req.body.clinical_notes || '',
        request_admission: !!req.body.request_admission,
        admission_notes: req.body.admission_notes || '',
        referral_specialist_id: req.body.referral_specialist_id || '',
        referral_specialist_name: referralSpecialistName || req.body.referral_specialist_name || '',
        referral_notes: req.body.referral_notes || '',
        follow_up_date: req.body.follow_up_date || undefined,
        created_at: (0, helpers_1.nowISO)(),
    };
    store.createPrescription(newPresc);
    const body = { success: true, data: newPresc, message: 'Prescription created' };
    res.status(201).json(body);
});
exports.default = router;
//# sourceMappingURL=prescriptions.js.map