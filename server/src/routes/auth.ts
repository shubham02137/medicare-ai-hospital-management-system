import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import {
  getUserByEmail,
  createUser,
  updateUser,
  getPatientByUserId,
  getDoctorByUserId,
  getAdminProfileByUserId,
  getNurseProfileByUserId,
  getReceptionistProfileByUserId,
  getPharmacistProfileByUserId,
  getLabTechnicianProfileByUserId,
  updateAdminProfile,
  updateNurseProfile,
  updateReceptionistProfile,
  updatePharmacistProfile,
  updateLabTechnicianProfile,
  updateDoctorProfileByUserId,
  updatePatientProfileByUserId
} from '../data/store';
import { generateToken } from '../utils/jwt';
import { generateId, hashPassword, comparePassword, nowISO } from '../utils/helpers';
import { authenticate } from '../middleware/auth';
import { User, ApiResponse } from '../types';

const router = Router();

// ─── POST /api/auth/login ──────────────────────────────────────────

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const body: ApiResponse = { success: false, error: errors.array().map(e => e.msg).join(', ') };
      res.status(400).json(body);
      return;
    }

    const { email, password } = req.body;
    const user = getUserByEmail(email);

    if (!user) {
      const body: ApiResponse = { success: false, error: 'Invalid email or password' };
      res.status(401).json(body);
      return;
    }

    if (!user.is_active) {
      const body: ApiResponse = { success: false, error: 'Account is deactivated. Contact admin.' };
      res.status(403).json(body);
      return;
    }

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      const body: ApiResponse = { success: false, error: 'Invalid email or password' };
      res.status(401).json(body);
      return;
    }

    const token = generateToken({ userId: user.id, email: user.email, role: user.role });

    // Trigger auto-creation of patient profile if not exists
    if (user.role === 'patient') {
      getPatientByUserId(user.id);
    }
    // Trigger auto-creation of doctor profile if not exists
    if (user.role === 'doctor') {
      getDoctorByUserId(user.id);
    }

    const { password_hash: _, ...safeUser } = user;
    const responseBody: ApiResponse = {
      success: true,
      data: { user: safeUser, token },
      message: 'Login successful',
    };
    res.json(responseBody);
  },
);

// ─── POST /api/auth/register ───────────────────────────────────────

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('full_name').notEmpty().withMessage('Full name is required'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('role').isIn(['admin', 'doctor', 'nurse', 'receptionist', 'patient', 'pharmacist', 'lab_technician']).withMessage('Valid role is required'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const body: ApiResponse = { success: false, error: errors.array().map(e => e.msg).join(', ') };
      res.status(400).json(body);
      return;
    }

    const { email, password, full_name, phone, role } = req.body;

    if (getUserByEmail(email)) {
      const body: ApiResponse = { success: false, error: 'Email already registered' };
      res.status(409).json(body);
      return;
    }

    const password_hash = await hashPassword(password);
    const now = nowISO();

    const newUser: User = {
      id: generateId(),
      email,
      password_hash,
      role,
      full_name,
      phone,
      is_active: true,
      created_at: now,
      updated_at: now,
    };

    createUser(newUser);

    // Trigger auto-creation of patient profile if registered as patient
    if (newUser.role === 'patient') {
      getPatientByUserId(newUser.id);
    }
    // Trigger auto-creation of doctor profile if registered as doctor
    if (newUser.role === 'doctor') {
      getDoctorByUserId(newUser.id);
    }

    const token = generateToken({ userId: newUser.id, email: newUser.email, role: newUser.role });

    const { password_hash: _, ...safeUser } = newUser;
    const responseBody: ApiResponse = {
      success: true,
      data: { user: safeUser, token },
      message: 'Registration successful',
    };
    res.status(201).json(responseBody);
  },
);

// ─── GET /api/auth/profile ─────────────────────────────────────────

router.get('/profile', authenticate, (req: Request, res: Response): void => {
  const user = getUserByEmail(req.user!.email);
  if (!user) {
    const body: ApiResponse = { success: false, error: 'User not found' };
    res.status(404).json(body);
    return;
  }

  let profileDetails: any = null;
  switch (user.role) {
    case 'admin':
      profileDetails = getAdminProfileByUserId(user.id);
      break;
    case 'doctor':
      profileDetails = getDoctorByUserId(user.id);
      break;
    case 'patient':
      profileDetails = getPatientByUserId(user.id);
      break;
    case 'nurse':
      profileDetails = getNurseProfileByUserId(user.id);
      break;
    case 'receptionist':
      profileDetails = getReceptionistProfileByUserId(user.id);
      break;
    case 'pharmacist':
      profileDetails = getPharmacistProfileByUserId(user.id);
      break;
    case 'lab_technician':
      profileDetails = getLabTechnicianProfileByUserId(user.id);
      break;
  }

  const { password_hash: _, ...safeUser } = user;
  const responseBody: ApiResponse = {
    success: true,
    data: {
      ...safeUser,
      profileDetails
    }
  };
  res.json(responseBody);
});

// ─── PUT /api/auth/profile ─────────────────────────────────────────

router.put('/profile', authenticate, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const user = getUserByEmail(req.user!.email);
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
  const updatedUser = updateUser(userId, {
    ...(full_name !== undefined ? { full_name } : {}),
    ...(phone !== undefined ? { phone } : {}),
    ...(avatar !== undefined ? { avatar } : {}),
  });

  if (!updatedUser) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }

  let updatedProfile: any = null;

  try {
    switch (user.role) {
      case 'admin': {
        const { designation, department, contact_details } = roleData;
        updatedProfile = updateAdminProfile(userId, {
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

        updatedProfile = updateDoctorProfileByUserId(userId, {
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

        updatedProfile = updatePatientProfileByUserId(userId, {
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

        updatedProfile = updateNurseProfile(userId, {
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

        updatedProfile = updateReceptionistProfile(userId, {
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

        updatedProfile = updatePharmacistProfile(userId, {
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

        updatedProfile = updateLabTechnicianProfile(userId, {
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
  } catch (err: any) {
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

router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Valid email is required')],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const body: ApiResponse = { success: false, error: errors.array().map(e => e.msg).join(', ') };
      res.status(400).json(body);
      return;
    }

    // In demo mode, we just acknowledge.  Real implementation would send email.
    const responseBody: ApiResponse = {
      success: true,
      message: 'If an account exists for this email, a password reset link has been sent.',
    };
    res.json(responseBody);
  },
);

export default router;
