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
// ─── GET /api/doctors ───────────────────────────────────────────────
router.get('/', (_req, res) => {
    const doctors = store.getDoctors();
    const body = { success: true, data: doctors };
    res.json(body);
});
// ─── GET /api/doctors/:id ───────────────────────────────────────────
router.get('/:id', (req, res) => {
    const doctor = store.getDoctorById(req.params.id);
    if (!doctor) {
        const body = { success: false, error: 'Doctor not found' };
        res.status(404).json(body);
        return;
    }
    const body = { success: true, data: doctor };
    res.json(body);
});
// ─── GET /api/doctors/:id/availability ──────────────────────────────
router.get('/:id/availability', (req, res) => {
    const doctor = store.getDoctorById(req.params.id);
    if (!doctor) {
        const body = { success: false, error: 'Doctor not found' };
        res.status(404).json(body);
        return;
    }
    // Check existing appointments for the requested date
    const date = req.query.date;
    const appointments = date
        ? store.getAppointmentsByDoctor(doctor.id).filter(a => a.date === date && a.status !== 'cancelled')
        : [];
    const bookedSlots = appointments.map(a => a.time_slot);
    const body = {
        success: true,
        data: {
            doctor_id: doctor.id,
            doctor_name: doctor.full_name,
            availability: doctor.availability,
            bookedSlots,
        },
    };
    res.json(body);
});
// ─── POST /api/doctors ──────────────────────────────────────────────
router.post('/', (0, rbac_1.authorize)('admin'), [
    (0, express_validator_1.body)('full_name').notEmpty().withMessage('Full name is required'),
    (0, express_validator_1.body)('specialization').notEmpty().withMessage('Specialization is required'),
    (0, express_validator_1.body)('department_id').notEmpty().withMessage('Department is required'),
    (0, express_validator_1.body)('consultation_fee').isNumeric().withMessage('Consultation fee must be a number'),
], (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const body = { success: false, error: errors.array().map(e => e.msg).join(', ') };
        res.status(400).json(body);
        return;
    }
    const dept = store.getDepartmentById(req.body.department_id);
    const newDoctor = {
        id: (0, helpers_1.generateId)(),
        user_id: req.body.user_id || '',
        full_name: req.body.full_name,
        email: req.body.email || '',
        phone: req.body.phone || '',
        department_id: req.body.department_id,
        department_name: dept?.name || '',
        specialization: req.body.specialization,
        experience_years: req.body.experience_years || 0,
        availability: req.body.availability || [],
        consultation_fee: req.body.consultation_fee,
        avatar: req.body.avatar || '',
        created_at: (0, helpers_1.nowISO)(),
    };
    store.createDoctor(newDoctor);
    const body = { success: true, data: newDoctor, message: 'Doctor created' };
    res.status(201).json(body);
});
// ─── PUT /api/doctors/:id ───────────────────────────────────────────
router.put('/:id', (0, rbac_1.authorize)('admin'), (req, res) => {
    const updated = store.updateDoctor(req.params.id, req.body);
    if (!updated) {
        const body = { success: false, error: 'Doctor not found' };
        res.status(404).json(body);
        return;
    }
    const body = { success: true, data: updated, message: 'Doctor updated' };
    res.json(body);
});
// ─── DELETE /api/doctors/:id ────────────────────────────────────────
router.delete('/:id', (0, rbac_1.authorize)('admin'), (req, res) => {
    const deleted = store.deleteDoctor(req.params.id);
    if (!deleted) {
        const body = { success: false, error: 'Doctor not found' };
        res.status(404).json(body);
        return;
    }
    const body = { success: true, message: 'Doctor deleted' };
    res.json(body);
});
exports.default = router;
//# sourceMappingURL=doctors.js.map