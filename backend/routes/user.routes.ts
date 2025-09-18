import { Router } from "express";
import {
  getAllUsers,
  getUsersByRole,
  getUserById
} from "../controllers/user.controller";
import { authenticateToken } from "../auth/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.use(authenticateToken); // All routes secured

router.get("/", authorizeRoles("Doctor", "Receptionist", "System Administrator"), getAllUsers);
router.get("/by-role", authorizeRoles("Doctor", "Receptionist", "System Administrator"), getUsersByRole);
router.get("/:id", authorizeRoles("Doctor", "Receptionist", "System Administrator"), getUserById);

export default router;
