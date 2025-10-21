import { Router } from "express";
import {
  getAllBranches,
  getBranchById
} from "../controllers/branch.controller";
import { authenticateToken } from "../auth/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.use(authenticateToken); // All routes secured

router.get("/", authorizeRoles("Doctor", "Receptionist", "System Administrator"), getAllBranches);
router.get("/:id", authorizeRoles("Doctor", "Receptionist", "System Administrator"), getBranchById);

export default router;
