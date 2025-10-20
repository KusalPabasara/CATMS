import express from 'express';
import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  resetDoctorPassword
} from '../controllers/doctor.controller';
import { authenticateToken } from '../auth/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// All routes require admin or branch manager role
router.use(authorizeRoles('System Administrator', 'Branch Manager'));

// GET /api/doctors - Get all doctors
router.get('/', getDoctors);

// GET /api/doctors/:id - Get doctor by ID
router.get('/:id', getDoctorById);

// POST /api/doctors - Create new doctor
router.post('/', createDoctor);

// PUT /api/doctors/:id - Update doctor
router.put('/:id', updateDoctor);

// DELETE /api/doctors/:id - Delete doctor (soft delete)
router.delete('/:id', deleteDoctor);

// POST /api/doctors/:id/reset-password - Reset doctor password
router.post('/:id/reset-password', resetDoctorPassword);

export default router;
