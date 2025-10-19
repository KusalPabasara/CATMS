import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Patient from '../models/patient.model';
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
    const hasPasswordHash = !!patient.getDataValue('password_hash');
    console.log('🔍 Patient has password hash:', hasPasswordHash);
    
    if (!hasPasswordHash) {
      console.log('❌ Patient has no password hash');
      return res.status(401).json({ 
        error: 'Account not activated. Please contact clinic staff to set up your password.' 
      });
    }

    // Verify password with proper hashing
    const storedHash = patient.getDataValue('password_hash');
    console.log('🔍 Comparing password with hash (first 20 chars):', storedHash?.substring(0, 20));
    
    const isValid = await bcrypt.compare(password, storedHash);
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
    address 
  } = req.body;

  try {
    // Validate required fields
    if (!full_name || !email || !password || !national_id) {
      return res.status(400).json({ 
        error: 'Required fields: full_name, email, password, national_id' 
      });
    }

    // Check if patient already exists
    const existingPatient = await Patient.findOne({
      where: { email }
    });

    if (existingPatient) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // Check national ID uniqueness
    const existingNationalId = await Patient.findOne({
      where: { national_id }
    });

    if (existingNationalId) {
      return res.status(409).json({ error: 'An account with this National ID already exists' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Split full_name into first_name and last_name
    const nameParts = full_name.trim().split(' ');
    const first_name = nameParts[0] || '';
    const last_name = nameParts.slice(1).join(' ') || '';

    // Create patient account
    const patient = await Patient.create({
      full_name,
      first_name,
      last_name,
      email,
      password_hash,
      phone,
      national_id,
      dob,
      gender,
      address,
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
    const patientId = (req as any).patient?.patient_id;
    
    if (!patientId) {
      return res.status(401).json({ error: 'Patient authentication required' });
    }

    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Don't allow changing critical fields
    const { password, password_hash, patient_id, email, national_id, ...updateData } = req.body;

    await patient.update(updateData);

    // Log audit trail
    await logAuditWithRequest(
      req,
      auditActions.PATIENT_UPDATED,
      'patients',
      patientId,
      `Patient updated own profile: ${patient.getDataValue('full_name')}`
    );

    // Return patient data without password
    const patientData = patient.toJSON();
    delete (patientData as any).password_hash;

    res.json({ 
      patient: patientData, 
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
    const patientId = (req as any).patient?.patient_id;
    
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

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      current_password, 
      patient.getDataValue('password_hash')
    );

    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const new_password_hash = await bcrypt.hash(new_password, 10);
    
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
    const patientId = (req as any).patient?.patient_id;
    
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
    const patientId = (req as any).patient?.patient_id;
    
    if (!patientId) {
      return res.status(401).json({ error: 'Patient authentication required' });
    }

    // Import here to avoid circular dependencies
    const Appointment = require('../models/appointment.model').default;
    const User = require('../models/user.model').default;

    const appointments = await Appointment.findAll({
      where: { patient_id: patientId },
      include: [
        {
          model: User,
          as: 'Doctor',
          attributes: ['full_name', 'email']
        }
      ],
      order: [['appointment_date', 'DESC']]
    });

    res.json(appointments);
  } catch (err) {
    console.error('Get patient appointments error:', err);
    res.status(500).json({ error: 'Failed to fetch appointments', details: err });
  }
};

// Create Patient Appointment
export const createPatientAppointment = async (req: Request, res: Response) => {
  try {
    const patientId = (req as any).patient?.patient_id;
    
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

    // Create appointment
    const appointment = await Appointment.create({
      patient_id: patientId,
      doctor_id,
      treatment_id: treatment_id || null,
      appointment_date: new Date(appointment_date),
      reason,
      priority,
      notes,
      status: 'Scheduled',
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
      message: 'Appointment created successfully'
    });
  } catch (err) {
    console.error('Create patient appointment error:', err);
    res.status(500).json({ error: 'Failed to create appointment', details: err });
  }
};

// Get Doctors for Patient
export const getPatientDoctors = async (req: Request, res: Response) => {
  try {
    // Import here to avoid circular dependencies
    const User = require('../models/user.model').default;

    const doctors = await User.findAll({
      where: {
        role: 'Doctor',
        active: true
      },
      attributes: ['user_id', 'full_name', 'email', 'specialty'],
      order: [['full_name', 'ASC']]
    });

    res.status(200).json(doctors);
  } catch (err) {
    console.error('Get patient doctors error:', err);
    res.status(500).json({ error: 'Failed to fetch doctors', details: err });
  }
};

// Get Treatments for Patient
export const getPatientTreatments = async (req: Request, res: Response) => {
  try {
    // Import here to avoid circular dependencies
    const Treatment = require('../models/treatment.model').default;

    const treatments = await Treatment.findAll({
      where: {
        is_active: true
      },
      attributes: ['treatment_id', 'name', 'description', 'cost', 'duration', 'category'],
      order: [['name', 'ASC']]
    });

    res.status(200).json(treatments);
  } catch (err) {
    console.error('Get patient treatments error:', err);
    res.status(500).json({ error: 'Failed to fetch treatments', details: err });
  }
};

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('📸 Multer: Setting destination for file:', file.originalname);
    const uploadDir = path.join(__dirname, '../../uploads/profile-pictures');
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
