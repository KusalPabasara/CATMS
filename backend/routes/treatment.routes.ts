import { Router } from "express";
import {
  getAllTreatments,
  getTreatmentById,
  createTreatment,
  updateTreatment,
  deleteTreatment
} from "../controllers/treatment.controller";
import { authenticateToken } from "../auth/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.use(authenticateToken); // All routes secured

router.get("/", authorizeRoles("Doctor", "Receptionist", "System Administrator"), getAllTreatments);
router.get("/:id", authorizeRoles("Doctor", "Receptionist", "System Administrator"), getTreatmentById);
router.post("/", authorizeRoles("System Administrator"), createTreatment);
router.put("/:id", authorizeRoles("System Administrator"), updateTreatment);
router.delete("/:id", authorizeRoles("System Administrator"), deleteTreatment);

export default router;
