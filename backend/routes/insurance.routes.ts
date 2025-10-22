import express from 'express';
import {
  getInsurancePolicies,
  createInsurancePolicy,
  updateInsurancePolicy,
  deleteInsurancePolicy,
  getPatientInsurance,
  addPatientInsurance,
  updatePatientInsurance,
  removePatientInsurance,
  getInsuranceClaims,
  createInsuranceClaim,
  updateClaimStatus,
  calculateTreatmentCoverage,
} from '../controllers/insurance.controller';
import { authenticateToken } from '../auth/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Insurance Policy Management Routes
router.get('/policies', getInsurancePolicies);
router.post('/policies', createInsurancePolicy);
router.put('/policies/:policy_id', updateInsurancePolicy);
router.delete('/policies/:policy_id', deleteInsurancePolicy);

// Patient Insurance Management Routes
router.get('/patient/:patient_id', getPatientInsurance);
router.post('/patient/:patient_id', addPatientInsurance);
router.put('/patient/:patient_id/policy/:policy_id', updatePatientInsurance);
router.delete('/patient/:patient_id/policy/:policy_id', removePatientInsurance);

// Insurance Claims Management Routes
router.get('/claims', getInsuranceClaims);
router.post('/claims', createInsuranceClaim);
router.put('/claims/:claim_id/status', updateClaimStatus);

// Treatment Coverage Routes
router.post('/coverage/calculate', calculateTreatmentCoverage);

export default router;
