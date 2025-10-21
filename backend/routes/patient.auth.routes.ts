import { Router } from 'express';
import {
  patientLogin,
  patientRegister,
  updatePatientProfile,
  changePatientPassword,
  getPatientProfile,
  getPatientAppointments,
  createPatientAppointment,
  getPatientDoctors,
  getPatientTreatments,
  uploadProfilePicture,
  upload
} from '../controllers/patient.auth.controller';
import { authenticatePatient } from '../auth/patient.auth.middleware';

const router = Router();

// Public routes (no authentication required)
router.get('/test', (req, res) => res.json({ message: 'Patient auth routes working!' }));
router.post('/login', patientLogin);
router.post('/register', patientRegister);

// Protected routes (require patient authentication)
router.use(authenticatePatient); // Apply middleware to all routes below

router.get('/profile', getPatientProfile);
router.get('/test-profile', getPatientProfile);
router.put('/profile', updatePatientProfile);
router.put('/change-password', changePatientPassword);
router.post('/profile-picture', upload.single('profile_picture'), uploadProfilePicture);
router.get('/appointments', getPatientAppointments);
router.post('/appointments', createPatientAppointment);
router.get('/doctors', getPatientDoctors);
router.get('/treatments', getPatientTreatments);

export default router;