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
// ─── GET /api/lab-reports ───────────────────────────────────────────
router.get('/', (req, res) => {
    let reports = store.getLabReports();
    const { status } = req.query;
    if (status) {
        reports = reports.filter(r => r.status === status);
    }
    const body = { success: true, data: reports };
    res.json(body);
});
// ─── GET /api/lab-reports/patient/:patientId ────────────────────────
router.get('/patient/:patientId', (req, res) => {
    const reports = store.getLabReportsByPatient(req.params.patientId);
    const body = { success: true, data: reports };
    res.json(body);
});
// ─── GET /api/lab-reports/:id ───────────────────────────────────────
router.get('/:id', (req, res) => {
    const report = store.getLabReportById(req.params.id);
    if (!report) {
        const body = { success: false, error: 'Lab report not found' };
        res.status(404).json(body);
        return;
    }
    const body = { success: true, data: report };
    res.json(body);
});
// ─── POST /api/lab-reports ──────────────────────────────────────────
router.post('/', (0, rbac_1.authorize)('admin', 'doctor', 'lab_technician'), [
    (0, express_validator_1.body)('patient_id').notEmpty().withMessage('Patient ID is required'),
    (0, express_validator_1.body)('doctor_id').notEmpty().withMessage('Doctor ID is required'),
    (0, express_validator_1.body)('test_name').notEmpty().withMessage('Test name is required'),
    (0, express_validator_1.body)('test_type').notEmpty().withMessage('Test type is required'),
], (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const body = { success: false, error: errors.array().map(e => e.msg).join(', ') };
        res.status(400).json(body);
        return;
    }
    const patient = store.getPatientById(req.body.patient_id);
    const doctor = store.getDoctorById(req.body.doctor_id);
    const newReport = {
        id: (0, helpers_1.generateId)(),
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
        created_at: (0, helpers_1.nowISO)(),
    };
    store.createLabReport(newReport);
    const body = { success: true, data: newReport, message: 'Lab report created' };
    res.status(201).json(body);
});
// ─── PUT /api/lab-reports/:id ───────────────────────────────────────
router.put('/:id', (0, rbac_1.authorize)('admin', 'doctor', 'lab_technician'), (req, res) => {
    const updated = store.updateLabReport(req.params.id, req.body);
    if (!updated) {
        const body = { success: false, error: 'Lab report not found' };
        res.status(404).json(body);
        return;
    }
    const body = { success: true, data: updated, message: 'Lab report updated' };
    res.json(body);
});
// ─── DELETE /api/lab-reports/:id ────────────────────────────────────
router.delete('/:id', (0, rbac_1.authorize)('admin'), (req, res) => {
    const deleted = store.deleteLabReport(req.params.id);
    if (!deleted) {
        const body = { success: false, error: 'Lab report not found' };
        res.status(404).json(body);
        return;
    }
    const body = { success: true, message: 'Lab report deleted' };
    res.json(body);
});
exports.default = router;
//# sourceMappingURL=labReports.js.map