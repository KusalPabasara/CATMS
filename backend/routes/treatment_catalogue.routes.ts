import { Router } from "express";
import {
  getAllTreatmentCatalogues,
  getTreatmentCatalogueById
} from "../controllers/treatment_catalogue.controller";
import { authenticateToken } from "../auth/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.use(authenticateToken); // All routes secured

router.get("/", authorizeRoles("Doctor", "Receptionist", "System Administrator"), getAllTreatmentCatalogues);
router.get("/:id", authorizeRoles("Doctor", "Receptionist", "System Administrator"), getTreatmentCatalogueById);

export default router;
