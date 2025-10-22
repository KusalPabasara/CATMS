import express from 'express';
import {
  getSpecialties,
  getDoctorsWithSpecialties,
  assignSpecialtyToDoctor,
  removeSpecialtyFromDoctor,
  getDoctorsBySpecialty,
  getSpecialtiesByDoctor,
} from '../controllers/specialty.controller';
import { authenticateToken } from '../auth/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all specialties
router.get('/', getSpecialties);

// Get doctors with their specialties
router.get('/doctors', getDoctorsWithSpecialties);

// Get doctors by specialty
router.get('/doctors/by-specialty', getDoctorsBySpecialty);

// Get specialties by doctor
router.get('/doctor/:doctor_id', getSpecialtiesByDoctor);

// Assign specialty to doctor
router.post('/assign', assignSpecialtyToDoctor);

// Remove specialty from doctor
router.delete('/doctor/:doctor_id/specialty/:specialty_id', removeSpecialtyFromDoctor);

export default router;
