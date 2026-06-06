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
// ─── GET /api/appointments ──────────────────────────────────────────
router.get('/', (req, res) => {
    let appointments = store.getAppointments();
    // Filter by status
    const { status, date } = req.query;
    if (status) {
        appointments = appointments.filter(a => a.status === status);
    }
    if (date) {
        appointments = appointments.filter(a => a.date === date);
    }
    const body = { success: true, data: appointments };
    res.json(body);
});
// ─── GET /api/appointments/doctor/:doctorId ─────────────────────────
router.get('/doctor/:doctorId', (req, res) => {
    const appointments = store.getAppointmentsByDoctor(req.params.doctorId);
    const body = { success: true, data: appointments };
    res.json(body);
});
// ─── GET /api/appointments/patient/:patientId ───────────────────────
router.get('/patient/:patientId', (req, res) => {
    const appointments = store.getAppointmentsByPatient(req.params.patientId);
    const body = { success: true, data: appointments };
    res.json(body);
});
// ─── GET /api/appointments/:id ──────────────────────────────────────
router.get('/:id', (req, res) => {
    const appt = store.getAppointmentById(req.params.id);
    if (!appt) {
        const body = { success: false, error: 'Appointment not found' };
        res.status(404).json(body);
        return;
    }
    const body = { success: true, data: appt };
    res.json(body);
});
// ─── POST /api/appointments ─────────────────────────────────────────
router.post('/', (0, rbac_1.authorize)('admin', 'receptionist', 'doctor', 'patient'), [
    (0, express_validator_1.body)('patient_id').notEmpty().withMessage('Patient ID is required'),
    (0, express_validator_1.body)('doctor_id').notEmpty().withMessage('Doctor ID is required'),
    (0, express_validator_1.body)('date').notEmpty().withMessage('Date is required'),
    (0, express_validator_1.body)('time_slot').notEmpty().withMessage('Time slot is required'),
], (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const body = { success: false, error: errors.array().map(e => e.msg).join(', ') };
        res.status(400).json(body);
        return;
    }
    const patient = store.getPatientById(req.body.patient_id);
    const doctor = store.getDoctorById(req.body.doctor_id);
    if (!patient) {
        const body = { success: false, error: 'Patient not found' };
        res.status(404).json(body);
        return;
    }
    if (!doctor) {
        const body = { success: false, error: 'Doctor not found' };
        res.status(404).json(body);
        return;
    }
    // Check for time slot conflict
    const existing = store.getAppointmentsByDoctor(doctor.id).find(a => a.date === req.body.date && a.time_slot === req.body.time_slot && a.status !== 'cancelled');
    if (existing) {
        const body = { success: false, error: 'This time slot is already booked' };
        res.status(409).json(body);
        return;
    }
    const newAppt = {
        id: (0, helpers_1.generateId)(),
        patient_id: req.body.patient_id,
        patient_name: patient.full_name,
        doctor_id: req.body.doctor_id,
        doctor_name: doctor.full_name,
        department_name: doctor.department_name || '',
        date: req.body.date,
        time_slot: req.body.time_slot,
        status: 'pending',
        notes: req.body.notes || '',
        created_at: (0, helpers_1.nowISO)(),
    };
    store.createAppointment(newAppt);
    const body = { success: true, data: newAppt, message: 'Appointment requested' };
    res.status(201).json(body);
});
// ─── PUT /api/appointments/:id ──────────────────────────────────────
router.put('/:id', (req, res) => {
    const updated = store.updateAppointment(req.params.id, req.body);
    if (!updated) {
        const body = { success: false, error: 'Appointment not found' };
        res.status(404).json(body);
        return;
    }
    const body = { success: true, data: updated, message: 'Appointment updated' };
    res.json(body);
});
// ─── PUT /api/appointments/:id/cancel ───────────────────────────────
router.put('/:id/cancel', (req, res) => {
    const appt = store.getAppointmentById(req.params.id);
    if (!appt) {
        const body = { success: false, error: 'Appointment not found' };
        res.status(404).json(body);
        return;
    }
    if (appt.status === 'completed') {
        const body = { success: false, error: 'Cannot cancel a completed appointment' };
        res.status(400).json(body);
        return;
    }
    const updated = store.updateAppointment(req.params.id, { status: 'cancelled' });
    const body = { success: true, data: updated, message: 'Appointment cancelled' };
    res.json(body);
});
// ─── PUT /api/appointments/:id/confirm ──────────────────────────────
router.put('/:id/confirm', (0, rbac_1.authorize)('admin', 'doctor'), (req, res) => {
    const appt = store.getAppointmentById(req.params.id);
    if (!appt) {
        const body = { success: false, error: 'Appointment not found' };
        res.status(404).json(body);
        return;
    }
    if (appt.status !== 'pending') {
        const body = { success: false, error: 'Only pending appointments can be confirmed' };
        res.status(400).json(body);
        return;
    }
    const updated = store.updateAppointment(req.params.id, { status: 'confirmed' });
    const body = { success: true, data: updated, message: 'Appointment confirmed' };
    res.json(body);
});
// ─── PUT /api/appointments/:id/reject ───────────────────────────────
router.put('/:id/reject', (0, rbac_1.authorize)('admin', 'doctor'), (req, res) => {
    const appt = store.getAppointmentById(req.params.id);
    if (!appt) {
        const body = { success: false, error: 'Appointment not found' };
        res.status(404).json(body);
        return;
    }
    if (appt.status !== 'pending') {
        const body = { success: false, error: 'Only pending appointments can be rejected' };
        res.status(400).json(body);
        return;
    }
    const updated = store.updateAppointment(req.params.id, { status: 'cancelled' });
    const body = { success: true, data: updated, message: 'Appointment rejected' };
    res.json(body);
});
// ─── PUT /api/appointments/:id/complete ─────────────────────────────
router.put('/:id/complete', (0, rbac_1.authorize)('admin', 'doctor'), (req, res) => {
    const appt = store.getAppointmentById(req.params.id);
    if (!appt) {
        const body = { success: false, error: 'Appointment not found' };
        res.status(404).json(body);
        return;
    }
    if (appt.status !== 'confirmed') {
        const body = { success: false, error: 'Only confirmed appointments can be completed' };
        res.status(400).json(body);
        return;
    }
    const updated = store.updateAppointment(req.params.id, { status: 'completed' });
    const body = { success: true, data: updated, message: 'Appointment completed' };
    res.json(body);
});
// ─── DELETE /api/appointments/:id ───────────────────────────────────
router.delete('/:id', (0, rbac_1.authorize)('admin'), (req, res) => {
    const deleted = store.deleteAppointment(req.params.id);
    if (!deleted) {
        const body = { success: false, error: 'Appointment not found' };
        res.status(404).json(body);
        return;
    }
    const body = { success: true, message: 'Appointment deleted' };
    res.json(body);
});
exports.default = router;
//# sourceMappingURL=appointments.js.map