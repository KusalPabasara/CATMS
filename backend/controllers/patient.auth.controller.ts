import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
// Import index to ensure associations are loaded
import '../models/index';
import Patient from '../models/patient.model';
import Appointment from '../models/appointment.model';
import User from '../models/user.model';
import Branch from '../models/branch.model';
import Staff from '../models/staff.model';
import sequelize from '../config/database';
import { generateToken } from '../utils/jwt.util';
import { sendEmail, emailTemplates } from '../services/email.service';
import { sendSMS, smsTemplates } from '../services/sms.service';
import { logAuditWithRequest, auditActions } from '../services/audit.service';

// Patient Login
export const patientLogin = async (req: Request, res: Response) => {
  const { email, national_id, password } = req.body;

  try {
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    if (!email && !national_id) {
      return res.status(400).json({ error: 'Either email or national ID is required' });
    }

    console.log('🔍 Patient login attempt:', { email, national_id, hasPassword: !!password });
    
    // Find patient by email or national_id
    const whereClause = email 
      ? { email: email.toLowerCase() } 
      : { national_id: national_id.trim() };
    console.log('🔍 Search criteria:', whereClause);
    
    const patient = await Patient.findOne({
      where: { ...whereClause, active: true }
    });

    console.log('🔍 Patient found:', patient ? 'YES' : 'NO');
    if (!patient) {
      console.log('❌ Patient not found with criteria:', whereClause);
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    // Check if patient has a password set
    const storedPassword = patient.getDataValue('password_hash');
    console.log('🔍 Patient has password:', !!storedPassword);
    
    if (!storedPassword) {
      console.log('❌ Patient has no password');
      return res.status(401).json({ 
        error: 'Account not activated. Please contact clinic staff to set up your password.' 
      });
    }

    // Verify password (plain text comparison for simplicity)
    console.log('🔍 Comparing password:', password, 'with stored:', storedPassword);
    
    const isValid = password === storedPassword;
    console.log('🔍 Password validation result:', isValid);
    
    if (!isValid) {
      console.log('❌ Password validation failed');
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    // Generate token
    const token = generateToken({
      patient_id: patient.getDataValue('patient_id'),
      email: patient.getDataValue('email'),
      full_name: patient.getDataValue('full_name'),
      type: 'patient'
    });

    // Log audit trail
    await logAuditWithRequest(
      req,
      auditActions.LOGIN,
      'patients',
      patient.getDataValue('patient_id'),
      `Patient login: ${patient.getDataValue('email')}`
    );

    // Return patient data without password
    const patientData = patient.toJSON();
    delete (patientData as any).password_hash;

    res.status(200).json({ 
      patient: patientData, 
      token,
      message: 'Login successful' 
    });
  } catch (err) {
    console.error('Patient login error:', err);
    res.status(500).json({ error: 'Login failed', details: err });
  }
};

// Patient Self-Registration
export const patientRegister = async (req: Request, res: Response) => {
  const { 
    full_name, 
    email, 
    password, 
    phone, 
    national_id, 
    dob, 
    gender, 
    address,
    preferred_branch_id
  } = req.body;

  try {
    // Validate required fields
    if (!full_name || !email || !password || !national_id) {
      return res.status(400).json({ 
        error: 'Required fields: full_name, email, password, national_id' 
      });
    }

    // Check if patient already exists
    console.log('🔍 Checking for existing patient with email:', email);
    const existingPatient = await Patient.findOne({
      where: { email }
    });

    if (existingPatient) {
      console.log('❌ Patient already exists with email:', email);
      return res.status(409).json({ 
        error: 'An account with this email already exists. Please try logging in instead or use a different email address.' 
      });
    }

    // Check national ID uniqueness
    console.log('🔍 Checking for existing patient with national_id:', national_id);
    const existingNationalId = await Patient.findOne({
      where: { national_id }
    });

    if (existingNationalId) {
      console.log('❌ Patient already exists with national_id:', national_id);
      return res.status(409).json({ 
        error: 'An account with this National ID already exists. Please try logging in instead or contact support if you believe this is an error.' 
      });
    }

    // Store password as plain text for simplicity
    const password_hash = password;

    // Split full_name into first_name and last_name
    const nameParts = full_name.trim().split(' ');
    const first_name = nameParts[0] || '';
    const last_name = nameParts.slice(1).join(' ') || '';

    // Create patient account
    const patient = await Patient.create({
      full_name,
      email,
      password_hash,
      phone,
      national_id,
      dob,
      gender,
      address,
      preferred_branch_id: preferred_branch_id ? parseInt(preferred_branch_id) : null,
      active: true
    });

    // Log audit trail
    await logAuditWithRequest(
      req,
      auditActions.PATIENT_CREATED,
      'patients',
      (patient as any).patient_id,
      `Patient self-registered: ${full_name} (${email})`
    );

    // Send welcome notifications
    try {
      // Send welcome email
      const emailTemplate = emailTemplates.welcome(full_name);
      await sendEmail(email, emailTemplate.subject, emailTemplate.html);

      // Send welcome SMS if phone provided
      if (phone) {
        const smsMessage = smsTemplates.welcome(full_name);
        await sendSMS(phone, smsMessage);
      }
    } catch (notificationError) {
      console.error('❌ Welcome notification failed:', notificationError);
      // Don't fail registration if notifications fail
    }

    // Generate token for immediate login
    const token = generateToken({
      patient_id: (patient as any).patient_id,
      email: (patient as any).email,
      full_name: (patient as any).full_name,
      type: 'patient'
    });

    // Return patient data without password
    const patientData = patient.toJSON();
    delete (patientData as any).password_hash;

    res.status(201).json({ 
      patient: patientData,
      token,
      message: 'Registration successful! Welcome to CATMS.' 
    });
  } catch (err) {
    console.error('Patient registration error:', err);
    res.status(500).json({ error: 'Registration failed', details: err });
  }
};

// Update Patient Profile (by patient themselves)
export const updatePatientProfile = async (req: Request, res: Response) => {
  try {
    const patientId = (req as any).user?.patient_id;
    
    if (!patientId) {
      return res.status(401).json({ error: 'Patient authentication required' });
    }

    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Don't allow changing critical fields
    const { password, password_hash, patient_id, email, national_id, date_of_birth, ...rawUpdateData } = req.body;

    // Map frontend field names to database column names and handle empty values
    const updateData = {
      ...rawUpdateData,
      ...(date_of_birth && { dob: date_of_birth }),
      // Handle empty strings for ENUM fields - convert to null
      ...(rawUpdateData.gender === '' ? { gender: null } : {}),
      // Handle empty strings for other optional fields
      ...(rawUpdateData.blood_type === '' ? { blood_type: null } : {}),
      ...(rawUpdateData.phone === '' ? { phone: null } : {}),
      ...(rawUpdateData.address === '' ? { address: null } : {}),
      ...(rawUpdateData.emergency_contact === '' ? { emergency_contact: null } : {}),
      ...(rawUpdateData.emergency_contact_name === '' ? { emergency_contact_name: null } : {}),
      ...(rawUpdateData.emergency_contact_phone === '' ? { emergency_contact_phone: null } : {}),
      ...(rawUpdateData.insurance_provider === '' ? { insurance_provider: null } : {}),
      ...(rawUpdateData.insurance_policy_number === '' ? { insurance_policy_number: null } : {}),
      ...(rawUpdateData.allergies === '' ? { allergies: null } : {}),
      ...(rawUpdateData.national_id === '' ? { national_id: null } : {})
    };

    await patient.update(updateData);

    // Log audit trail
    await logAuditWithRequest(
      req,
      auditActions.PATIENT_UPDATED,
      'patients',
      patientId,
      `Patient updated own profile: ${patient.getDataValue('full_name')}`
    );

    // Return patient data without password, map database fields to frontend fields
    const patientData = patient.toJSON();
    delete (patientData as any).password_hash;

    // Map database column names to frontend field names
    const responseData = {
      ...patientData,
      date_of_birth: patientData.dob,
      dob: undefined // Remove the db column name
    };

    res.json({
      patient: responseData,
      message: 'Profile updated successfully'
    });
  } catch (err) {
    console.error('Patient profile update error:', err);
    res.status(500).json({ error: 'Profile update failed', details: err });
  }
};

// Change Patient Password
export const changePatientPassword = async (req: Request, res: Response) => {
  const { current_password, new_password } = req.body;

  try {
    const patientId = (req as any).user?.patient_id;
    
    if (!patientId) {
      return res.status(401).json({ error: 'Patient authentication required' });
    }

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Verify current password (plain text comparison)
    const storedPassword = patient.getDataValue('password_hash');
    const isCurrentPasswordValid = current_password === storedPassword;

    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Store new password as plain text
    const new_password_hash = new_password;
    
    // Update password
    await patient.update({ password_hash: new_password_hash });

    // Log audit trail
    await logAuditWithRequest(
      req,
      auditActions.PATIENT_UPDATED,
      'patients',
      patientId,
      `Patient changed password: ${patient.getDataValue('full_name')}`
    );

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ error: 'Password change failed', details: err });
  }
};

// Get Patient's Own Profile
export const getPatientProfile = async (req: Request, res: Response) => {
  try {
    const patientId = (req as any).user?.patient_id;
    
    if (!patientId) {
      return res.status(401).json({ error: 'Patient authentication required' });
    }

    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Return patient data without password
    const patientData = patient.toJSON();
    delete (patientData as any).password_hash;

    res.json(patientData);
  } catch (err) {
    console.error('Get patient profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile', details: err });
  }
};

// Get Patient's Appointments
export const getPatientAppointments = async (req: Request, res: Response) => {
  try {
    const patientId = (req as any).user?.patient_id;
    
    if (!patientId) {
      return res.status(401).json({ error: 'Patient authentication required' });
    }

    // Use raw SQL query to avoid association issues
    
    const appointments = await sequelize.query(`
      SELECT 
        a.*,
        u.full_name as doctor_name,
        u.email as doctor_email,
        u.staff_title as doctor_title,
        b.name as branch_name
      FROM appointments a
      LEFT JOIN users u ON a.doctor_id = u.user_id
      LEFT JOIN branches b ON a.branch_id = b.branch_id
      WHERE a.patient_id = :patientId
      ORDER BY a.appointment_date DESC
    `, {
      replacements: { patientId },
      type: sequelize.QueryTypes.SELECT
    });

    // Transform the data to match frontend expectations
    const transformedAppointments = appointments.map((apt: any) => ({
      appointment_id: apt.appointment_id,
      appointment_date: apt.appointment_date,
      status: apt.status,
      reason: apt.reason,
      priority: apt.priority,
      notes: apt.notes,
      approval_status: apt.approval_status,
      receptionist_approval_status: apt.receptionist_approval_status,
      doctor_approval_status: apt.doctor_approval_status,
      created_by: apt.created_by,
      created_at: apt.created_at,
      doctor: apt.doctor_name ? {
        full_name: apt.doctor_name,
        specialty: apt.doctor_title,
        email: apt.doctor_email
      } : null,
      treatment: null, // No treatment data for now
      branch: apt.branch_name ? {
        name: apt.branch_name
      } : null
    }));

    res.json(transformedAppointments);
  } catch (err) {
    console.error('Get patient appointments error:', err);
    res.status(500).json({ error: 'Failed to fetch appointments', details: err });
  }
};

// Create Patient Appointment
export const createPatientAppointment = async (req: Request, res: Response) => {
  try {
    const patientId = (req as any).user?.patient_id;
    
    if (!patientId) {
      return res.status(401).json({ error: 'Patient authentication required' });
    }

    // Import here to avoid circular dependencies
    const Appointment = require('../models/appointment.model').default;
    const User = require('../models/user.model').default;

    const {
      doctor_id,
      treatment_id,
      appointment_date,
      reason,
      priority = 'normal',
      notes = ''
    } = req.body;

    // Validate required fields
    if (!doctor_id || !appointment_date || !reason) {
      return res.status(400).json({ 
        error: 'Missing required fields: doctor_id, appointment_date, and reason are required' 
      });
    }

    // Verify doctor exists
    const doctor = await User.findByPk(doctor_id);
    if (!doctor) {
      return res.status(400).json({ error: 'Doctor not found' });
    }

    // Create appointment as Scheduled (patient-booked appointments need approval)
    const appointment = await Appointment.create({
      patient_id: patientId,
      doctor_id,
      branch_id: doctor.getDataValue('branch_id'), // Get doctor's branch
      appointment_date: new Date(appointment_date),
      reason,
      priority,
      notes,
      status: 'Scheduled' as any,
      is_walkin: false,
      created_by: null, // Patient bookings don't have a user creator
      created_at: new Date()
    });

    // Fetch the created appointment with doctor details
    const createdAppointment = await Appointment.findByPk(appointment.appointment_id, {
      include: [
        {
          model: User,
          as: 'Doctor',
          attributes: ['full_name', 'email']
        }
      ]
    });

    // Log audit trail
    await logAuditWithRequest(
      req,
      auditActions.CREATE,
      'appointments',
      appointment.appointment_id,
      `Patient created appointment: ${reason}`
    );

    res.status(201).json({
      appointment: createdAppointment,
      message: 'Appointment request submitted and awaiting approval.'
    });
  } catch (err) {
    console.error('Create patient appointment error:', err);
    res.status(500).json({ error: 'Failed to create appointment', details: err });
  }
};

// Get Doctors for Patient
export const getPatientDoctors = async (req: Request, res: Response) => {
  try {
    const { sequelize } = require('../config/database');

    const doctors = await sequelize.query(`
      SELECT 
        u.user_id,
        u.full_name,
        u.email,
        r.name as role,
        u.branch_id,
        u.staff_title,
        s.name as specialty_name,
        b.name as branch_name
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN doctor_specialties ds ON u.user_id = ds.user_id
      LEFT JOIN specialties s ON ds.specialty_id = s.specialty_id
      LEFT JOIN branches b ON u.branch_id = b.branch_id
      WHERE r.name = 'Doctor' AND u.is_active = true
      ORDER BY u.full_name ASC
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    // Map to frontend expected shape
    const mappedDoctors = doctors.map((d: any) => ({
      user_id: d.user_id,
      full_name: d.full_name || '',
      email: d.email || '',
      specialty: d.specialty_name || 'General Medicine',
      branch_id: d.branch_id,
      branch_name: d.branch_name || 'Main Branch'
    }));

    res.status(200).json(mappedDoctors);
  } catch (err) {
    console.error('Get patient doctors error:', err);
    res.status(500).json({ error: 'Failed to fetch doctors', details: err });
  }
};

// Get Treatments for Patient
export const getPatientTreatments = async (req: Request, res: Response) => {
  try {
    const { sequelize } = require('../config/database');

    const treatments = await sequelize.query(`
      SELECT 
        treatment_id,
        name as treatment_name,
        description,
        cost as standard_cost,
        duration,
        category,
        icd10_code,
        cpt_code,
        is_active
      FROM treatments 
      WHERE is_active = true
      ORDER BY category, name
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    // Map to frontend expected shape
    const mappedTreatments = treatments.map((t: any) => ({
      treatment_id: t.treatment_id,
      name: t.treatment_name,
      description: t.description,
      cost: Number(t.standard_cost || 0),
      duration: t.duration || 30,
      category: t.category
    }));

    res.status(200).json(mappedTreatments);
  } catch (err) {
    console.error('Get patient treatments error:', err);
    res.status(500).json({ error: 'Failed to fetch treatments', details: err });
  }
};

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('📸 Multer: Setting destination for file:', file.originalname);
    const uploadDir = path.resolve(__dirname, '../uploads/profile-pictures');
    console.log('📸 Multer: Upload directory:', uploadDir);

    if (!fs.existsSync(uploadDir)) {
      console.log('📸 Multer: Creating upload directory');
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    console.log('📸 Multer: Generating filename for:', file.originalname);
    const patientId = (req as any).user?.patient_id;
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = `patient-${patientId}-${uniqueSuffix}${ext}`;
    console.log('📸 Multer: Generated filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('📸 Multer: File filter check for:', file.originalname, 'MIME type:', file.mimetype);
    if (file.mimetype.startsWith('image/')) {
      console.log('📸 Multer: File accepted');
      cb(null, true);
    } else {
      console.log('❌ Multer: File rejected - not an image');
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Profile Picture Upload
export const uploadProfilePicture = async (req: Request, res: Response) => {
  try {
    console.log('📸 Backend: Profile picture upload request received');
    console.log('📸 Backend: Request headers:', req.headers);
    console.log('📸 Backend: Request body keys:', Object.keys(req.body));
    console.log('📸 Backend: Request file:', req.file);
    console.log('📸 Backend: Request files:', req.files);
    
    const patientId = (req as any).user?.patient_id;
    console.log('📸 Backend: Patient ID:', patientId);
    
    if (!patientId) {
      console.log('❌ Backend: No patient ID found in request');
      return res.status(401).json({ error: 'Patient not authenticated' });
    }

    if (!req.file) {
      console.log('❌ Backend: No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('📸 Backend: File details:', {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      encoding: req.file.encoding,
      mimetype: req.file.mimetype,
      size: req.file.size,
      filename: req.file.filename,
      path: req.file.path
    });

    // Update patient record with profile picture path
    const profilePicturePath = `/uploads/profile-pictures/${req.file.filename}`;
    console.log('📸 Backend: Profile picture path:', profilePicturePath);
    
    console.log('📸 Backend: Updating patient record...');
    const updateResult = await Patient.update(
      { profile_picture: profilePicturePath },
      { where: { patient_id: patientId } }
    );
    console.log('📸 Backend: Patient update result:', updateResult);

    // Log audit trail
    console.log('📸 Backend: Logging audit trail...');
    await logAuditWithRequest(req, auditActions.UPDATE, 'Patient', patientId, 
      `Profile picture updated: ${profilePicturePath}`
    );

    console.log('✅ Backend: Profile picture upload successful');
    res.status(200).json({
      message: 'Profile picture uploaded successfully',
      profile_picture: profilePicturePath
    });
  } catch (err) {
    console.error('❌ Backend: Profile picture upload error:', err);
    console.error('❌ Backend: Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    res.status(500).json({ error: 'Failed to upload profile picture', details: err.message });
  }
};

// Export multer upload middleware
export { upload };
