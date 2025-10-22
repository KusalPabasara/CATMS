import { Router } from "express";
import {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  createAppointmentAsPatient,
  updateAppointment,
  cancelAppointment,
  approveAppointment,
  rejectAppointment,
  createEmergencyWalkIn,
  getEmergencyAppointments,
  updateEmergencyAppointmentStatus,
  rescheduleAppointment,
  getRescheduleHistory,
  bulkRescheduleAppointments
} from "../controllers/appointment.controller";
import { authenticateToken } from "../auth/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { authenticatePatient } from "../auth/patient.auth.middleware";

const router = Router();

router.use(authenticateToken); // All routes secured

router.get("/", authorizeRoles("Doctor", "Receptionist", "System Administrator"), getAllAppointments);
router.get("/:id", authorizeRoles("Doctor", "Receptionist", "System Administrator"), getAppointmentById);
router.post("/", authorizeRoles("Receptionist", "System Administrator"), createAppointment);
// Patient self-service route using patient JWT auth
router.post("/patient", authenticatePatient, createAppointmentAsPatient);
router.put("/:id", authorizeRoles("Receptionist", "System Administrator"), updateAppointment);
router.delete("/:id", authorizeRoles("Receptionist", "System Administrator"), cancelAppointment);
router.patch("/:id/approve", authorizeRoles("Receptionist", "System Administrator"), approveAppointment);
router.patch("/:id/reject", authorizeRoles("Receptionist", "System Administrator"), rejectAppointment);

// ===== PHASE 4: EMERGENCY WALK-IN APPOINTMENTS =====

// Emergency walk-in routes
router.post("/emergency", authorizeRoles("Receptionist", "System Administrator", "Branch Manager"), createEmergencyWalkIn);
router.get("/emergency/list", authorizeRoles("Doctor", "Receptionist", "System Administrator", "Branch Manager"), getEmergencyAppointments);
router.patch("/emergency/:appointmentId/status", authorizeRoles("Doctor", "Receptionist", "System Administrator", "Branch Manager"), updateEmergencyAppointmentStatus);

// ===== PHASE 4: APPOINTMENT RESCHEDULING =====

// Rescheduling routes
router.patch("/:appointmentId/reschedule", authorizeRoles("Receptionist", "System Administrator", "Branch Manager"), rescheduleAppointment);
router.get("/:appointmentId/reschedule-history", authorizeRoles("Receptionist", "System Administrator", "Branch Manager"), getRescheduleHistory);
router.post("/bulk-reschedule", authorizeRoles("System Administrator", "Branch Manager"), bulkRescheduleAppointments);

export default router;
