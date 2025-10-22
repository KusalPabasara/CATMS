import { Router } from "express";
import {
  getAllBranches,
  getBranchById
} from "../controllers/branch.controller";
import { authenticateToken } from "../auth/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

// Public route for login page to fetch branches
router.get("/", getAllBranches);

// Protected routes
router.get("/:id", authenticateToken, authorizeRoles("Doctor", "Receptionist", "System Administrator"), getBranchById);

export default router;
