import { Router } from "express";
import {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  cancelAppointment
} from "../controllers/appointment.controller";
import { authenticateToken } from "../auth/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.use(authenticateToken); // All routes secured

router.get("/", authorizeRoles("Doctor", "Receptionist", "System Administrator"), getAllAppointments);
router.get("/:id", authorizeRoles("Doctor", "Receptionist", "System Administrator"), getAppointmentById);
router.post("/", authorizeRoles("Receptionist", "System Administrator"), createAppointment);
router.put("/:id", authorizeRoles("Receptionist", "System Administrator"), updateAppointment);
router.delete("/:id", authorizeRoles("Receptionist", "System Administrator"), cancelAppointment);

export default router;
