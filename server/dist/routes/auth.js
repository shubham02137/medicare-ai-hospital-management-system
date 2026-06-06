"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const store_1 = require("../data/store");
const jwt_1 = require("../utils/jwt");
const helpers_1 = require("../utils/helpers");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// ─── POST /api/auth/login ──────────────────────────────────────────
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const body = { success: false, error: errors.array().map(e => e.msg).join(', ') };
        res.status(400).json(body);
        return;
    }
    const { email, password } = req.body;
    const user = (0, store_1.getUserByEmail)(email);
    if (!user) {
        const body = { success: false, error: 'Invalid email or password' };
        res.status(401).json(body);
        return;
    }
    if (!user.is_active) {
        const body = { success: false, error: 'Account is deactivated. Contact admin.' };
        res.status(403).json(body);
        return;
    }
    const valid = await (0, helpers_1.comparePassword)(password, user.password_hash);
    if (!valid) {
        const body = { success: false, error: 'Invalid email or password' };
        res.status(401).json(body);
        return;
    }
    const token = (0, jwt_1.generateToken)({ userId: user.id, email: user.email, role: user.role });
    // Trigger auto-creation of patient profile if not exists
    if (user.role === 'patient') {
        (0, store_1.getPatientByUserId)(user.id);
    }
    // Trigger auto-creation of doctor profile if not exists
    if (user.role === 'doctor') {
        (0, store_1.getDoctorByUserId)(user.id);
    }
    const { password_hash: _, ...safeUser } = user;
    const responseBody = {
        success: true,
        data: { user: safeUser, token },
        message: 'Login successful',
    };
    res.json(responseBody);
});
// ─── POST /api/auth/register ───────────────────────────────────────
router.post('/register', [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('full_name').notEmpty().withMessage('Full name is required'),
    (0, express_validator_1.body)('phone').notEmpty().withMessage('Phone number is required'),
    (0, express_validator_1.body)('role').isIn(['admin', 'doctor', 'nurse', 'receptionist', 'patient', 'pharmacist', 'lab_technician']).withMessage('Valid role is required'),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const body = { success: false, error: errors.array().map(e => e.msg).join(', ') };
        res.status(400).json(body);
        return;
    }
    const { email, password, full_name, phone, role } = req.body;
    if ((0, store_1.getUserByEmail)(email)) {
        const body = { success: false, error: 'Email already registered' };
        res.status(409).json(body);
        return;
    }
    const password_hash = await (0, helpers_1.hashPassword)(password);
    const now = (0, helpers_1.nowISO)();
    const newUser = {
        id: (0, helpers_1.generateId)(),
        email,
        password_hash,
        role,
        full_name,
        phone,
        is_active: true,
        created_at: now,
        updated_at: now,
    };
    (0, store_1.createUser)(newUser);
    // Trigger auto-creation of patient profile if registered as patient
    if (newUser.role === 'patient') {
        (0, store_1.getPatientByUserId)(newUser.id);
    }
    // Trigger auto-creation of doctor profile if registered as doctor
    if (newUser.role === 'doctor') {
        (0, store_1.getDoctorByUserId)(newUser.id);
    }
    const token = (0, jwt_1.generateToken)({ userId: newUser.id, email: newUser.email, role: newUser.role });
    const { password_hash: _, ...safeUser } = newUser;
    const responseBody = {
        success: true,
        data: { user: safeUser, token },
        message: 'Registration successful',
    };
    res.status(201).json(responseBody);
});
// ─── GET /api/auth/profile ─────────────────────────────────────────
router.get('/profile', auth_1.authenticate, (req, res) => {
    const user = (0, store_1.getUserByEmail)(req.user.email);
    if (!user) {
        const body = { success: false, error: 'User not found' };
        res.status(404).json(body);
        return;
    }
    let profileDetails = null;
    switch (user.role) {
        case 'admin':
            profileDetails = (0, store_1.getAdminProfileByUserId)(user.id);
            break;
        case 'doctor':
            profileDetails = (0, store_1.getDoctorByUserId)(user.id);
            break;
        case 'patient':
            profileDetails = (0, store_1.getPatientByUserId)(user.id);
            break;
        case 'nurse':
            profileDetails = (0, store_1.getNurseProfileByUserId)(user.id);
            break;
        case 'receptionist':
            profileDetails = (0, store_1.getReceptionistProfileByUserId)(user.id);
            break;
        case 'pharmacist':
            profileDetails = (0, store_1.getPharmacistProfileByUserId)(user.id);
            break;
        case 'lab_technician':
            profileDetails = (0, store_1.getLabTechnicianProfileByUserId)(user.id);
            break;
    }
    const { password_hash: _, ...safeUser } = user;
    const responseBody = {
        success: true,
        data: {
            ...safeUser,
            profileDetails
        }
    };
    res.json(responseBody);
});
// ─── PUT /api/auth/profile ─────────────────────────────────────────
router.put('/profile', auth_1.authenticate, async (req, res) => {
    const userId = req.user.userId;
    const user = (0, store_1.getUserByEmail)(req.user.email);
    if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
    }
    const { full_name, phone, avatar, ...roleData } = req.body;
    // Basic validations
    if (full_name !== undefined && typeof full_name === 'string' && full_name.trim() === '') {
        res.status(400).json({ success: false, error: 'Full name cannot be empty' });
        return;
    }
    if (phone !== undefined && typeof phone === 'string' && phone.trim() === '') {
        res.status(400).json({ success: false, error: 'Phone number cannot be empty' });
        return;
    }
    // Update base user
    const updatedUser = (0, store_1.updateUser)(userId, {
        ...(full_name !== undefined ? { full_name } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(avatar !== undefined ? { avatar } : {}),
    });
    if (!updatedUser) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
    }
    let updatedProfile = null;
    try {
        switch (user.role) {
            case 'admin': {
                const { designation, department, contact_details } = roleData;
                updatedProfile = (0, store_1.updateAdminProfile)(userId, {
                    full_name: updatedUser.full_name,
                    phone: updatedUser.phone,
                    avatar: updatedUser.avatar,
                    ...(designation !== undefined ? { designation } : {}),
                    ...(department !== undefined ? { department } : {}),
                    ...(contact_details !== undefined ? { contact_details } : {}),
                });
                break;
            }
            case 'doctor': {
                const { specialization, qualification, experience_years, consultation_fee, department_id, department_name, available_days, available_time, license_number } = roleData;
                let expNum = experience_years !== undefined && experience_years !== '' ? Number(experience_years) : undefined;
                if (expNum !== undefined && (isNaN(expNum) || expNum < 0)) {
                    res.status(400).json({ success: false, error: 'Experience years must be a positive number' });
                    return;
                }
                let feeNum = consultation_fee !== undefined && consultation_fee !== '' ? Number(consultation_fee) : undefined;
                if (feeNum !== undefined && (isNaN(feeNum) || feeNum < 0)) {
                    res.status(400).json({ success: false, error: 'Consultation fee must be a positive number' });
                    return;
                }
                updatedProfile = (0, store_1.updateDoctorProfileByUserId)(userId, {
                    full_name: updatedUser.full_name,
                    phone: updatedUser.phone,
                    avatar: updatedUser.avatar,
                    ...(specialization !== undefined ? { specialization } : {}),
                    ...(qualification !== undefined ? { qualification } : {}),
                    ...(expNum !== undefined ? { experience_years: expNum } : {}),
                    ...(feeNum !== undefined ? { consultation_fee: feeNum } : {}),
                    ...(department_id !== undefined ? { department_id } : {}),
                    ...(department_name !== undefined ? { department_name } : {}),
                    ...(available_days !== undefined ? { available_days } : {}),
                    ...(available_time !== undefined ? { available_time } : {}),
                    ...(license_number !== undefined ? { license_number } : {}),
                });
                break;
            }
            case 'patient': {
                const { age, gender, blood_group, address, emergency_contact, allergies, medical_history } = roleData;
                let ageNum = age !== undefined && age !== '' ? Number(age) : undefined;
                if (ageNum !== undefined && (isNaN(ageNum) || ageNum < 0)) {
                    res.status(400).json({ success: false, error: 'Age must be a positive number' });
                    return;
                }
                updatedProfile = (0, store_1.updatePatientProfileByUserId)(userId, {
                    full_name: updatedUser.full_name,
                    phone: updatedUser.phone,
                    ...(ageNum !== undefined ? { age: ageNum } : {}),
                    ...(gender !== undefined ? { gender } : {}),
                    ...(blood_group !== undefined ? { blood_group } : {}),
                    ...(address !== undefined ? { address } : {}),
                    ...(emergency_contact !== undefined ? { emergency_contact } : {}),
                    ...(allergies !== undefined ? { allergies } : {}),
                    ...(medical_history !== undefined ? { medical_history } : {}),
                });
                break;
            }
            case 'nurse': {
                const { department, shift, qualification, experience } = roleData;
                let expNum = experience !== undefined && experience !== '' ? Number(experience) : undefined;
                if (expNum !== undefined && (isNaN(expNum) || expNum < 0)) {
                    res.status(400).json({ success: false, error: 'Experience must be a positive number' });
                    return;
                }
                updatedProfile = (0, store_1.updateNurseProfile)(userId, {
                    full_name: updatedUser.full_name,
                    phone: updatedUser.phone,
                    avatar: updatedUser.avatar,
                    ...(department !== undefined ? { department } : {}),
                    ...(shift !== undefined ? { shift } : {}),
                    ...(qualification !== undefined ? { qualification } : {}),
                    ...(expNum !== undefined ? { experience: expNum } : {}),
                });
                break;
            }
            case 'receptionist': {
                const { desk_number, shift, experience } = roleData;
                let expNum = experience !== undefined && experience !== '' ? Number(experience) : undefined;
                if (expNum !== undefined && (isNaN(expNum) || expNum < 0)) {
                    res.status(400).json({ success: false, error: 'Experience must be a positive number' });
                    return;
                }
                updatedProfile = (0, store_1.updateReceptionistProfile)(userId, {
                    full_name: updatedUser.full_name,
                    phone: updatedUser.phone,
                    avatar: updatedUser.avatar,
                    ...(desk_number !== undefined ? { desk_number } : {}),
                    ...(shift !== undefined ? { shift } : {}),
                    ...(expNum !== undefined ? { experience: expNum } : {}),
                });
                break;
            }
            case 'pharmacist': {
                const { license_number, qualification, experience } = roleData;
                let expNum = experience !== undefined && experience !== '' ? Number(experience) : undefined;
                if (expNum !== undefined && (isNaN(expNum) || expNum < 0)) {
                    res.status(400).json({ success: false, error: 'Experience must be a positive number' });
                    return;
                }
                updatedProfile = (0, store_1.updatePharmacistProfile)(userId, {
                    full_name: updatedUser.full_name,
                    phone: updatedUser.phone,
                    avatar: updatedUser.avatar,
                    ...(license_number !== undefined ? { license_number } : {}),
                    ...(qualification !== undefined ? { qualification } : {}),
                    ...(expNum !== undefined ? { experience: expNum } : {}),
                });
                break;
            }
            case 'lab_technician': {
                const { lab_department, qualification, license_number, experience } = roleData;
                let expNum = experience !== undefined && experience !== '' ? Number(experience) : undefined;
                if (expNum !== undefined && (isNaN(expNum) || expNum < 0)) {
                    res.status(400).json({ success: false, error: 'Experience must be a positive number' });
                    return;
                }
                updatedProfile = (0, store_1.updateLabTechnicianProfile)(userId, {
                    full_name: updatedUser.full_name,
                    phone: updatedUser.phone,
                    avatar: updatedUser.avatar,
                    ...(lab_department !== undefined ? { lab_department } : {}),
                    ...(qualification !== undefined ? { qualification } : {}),
                    ...(license_number !== undefined ? { license_number } : {}),
                    ...(expNum !== undefined ? { experience: expNum } : {}),
                });
                break;
            }
        }
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message || 'Validation failed' });
        return;
    }
    const { password_hash: _, ...safeUser } = updatedUser;
    res.json({
        success: true,
        data: {
            ...safeUser,
            profileDetails: updatedProfile,
        },
        message: 'Profile updated successfully',
    });
});
// ─── POST /api/auth/forgot-password ────────────────────────────────
router.post('/forgot-password', [(0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required')], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const body = { success: false, error: errors.array().map(e => e.msg).join(', ') };
        res.status(400).json(body);
        return;
    }
    // In demo mode, we just acknowledge.  Real implementation would send email.
    const responseBody = {
        success: true,
        message: 'If an account exists for this email, a password reset link has been sent.',
    };
    res.json(responseBody);
});
exports.default = router;
//# sourceMappingURL=auth.js.map