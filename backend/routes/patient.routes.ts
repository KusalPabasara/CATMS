import { Router } from "express";
import {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
} from "../controllers/patient.controller";
import { authenticateToken } from "../auth/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.use(authenticateToken); // All routes secured

router.get("/", authorizeRoles("Doctor", "System Administrator", "Receptionist"), getAllPatients);
router.get("/:id", authorizeRoles("Doctor", "System Administrator", "Receptionist"), getPatientById);
router.post("/", authorizeRoles("Receptionist", "System Administrator"), createPatient);
router.put("/:id", authorizeRoles("Receptionist", "System Administrator"), updatePatient);
router.delete("/:id", authorizeRoles("System Administrator"), deletePatient);

export default router;
