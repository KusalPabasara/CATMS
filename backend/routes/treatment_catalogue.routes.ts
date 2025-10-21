import { Router } from "express";
import {
  getAllCatalogue,
  getCatalogueById,
  createCatalogueItem,
  updateCatalogueItem,
  deleteCatalogueItem,
} from "../controllers/treatment_catalogue.controller";
import { authenticateToken } from "../auth/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.use(authenticateToken);

// View
router.get(
  "/",
  authorizeRoles("Doctor", "Receptionist", "System Administrator", "Branch Manager"),
  getAllCatalogue
);
router.get(
  "/:id",
  authorizeRoles("Doctor", "Receptionist", "System Administrator", "Branch Manager"),
  getCatalogueById
);

// Manage (admin staff)
router.post(
  "/",
  authorizeRoles("Receptionist", "System Administrator", "Branch Manager"),
  createCatalogueItem
);
router.put(
  "/:id",
  authorizeRoles("Receptionist", "System Administrator", "Branch Manager"),
  updateCatalogueItem
);
router.delete(
  "/:id",
  authorizeRoles("System Administrator", "Branch Manager"),
  deleteCatalogueItem
);

export default router;