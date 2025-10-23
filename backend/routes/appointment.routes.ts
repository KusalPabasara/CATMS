import { Router } from "express";
import {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  createAppointmentAsPatient,
  updateAppointment,
  cancelAppointment,
  approveAppointment,
  approveAppointmentByReceptionist,
  approveAppointmentByDoctor,
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

router.get("/", authorizeRoles("Doctor", "Receptionist", "System Administrator", "Branch Manager"), getAllAppointments);
router.get("/:id", authorizeRoles("Doctor", "Receptionist", "System Administrator", "Branch Manager"), getAppointmentById);
router.post("/", authorizeRoles("Receptionist", "System Administrator", "Branch Manager"), createAppointment);
// Patient self-service route using patient JWT auth
router.post("/patient", authenticatePatient, createAppointmentAsPatient);
router.put("/:id", authorizeRoles("Receptionist", "System Administrator", "Branch Manager"), updateAppointment);
router.delete("/:id", authorizeRoles("Receptionist", "System Administrator", "Branch Manager"), cancelAppointment);
// Legacy approval route (redirects to appropriate approval based on role)
router.patch("/:id/approve", authorizeRoles("Doctor", "Receptionist", "System Administrator", "Branch Manager"), approveAppointment);

// New dual approval workflow routes
router.patch("/:id/approve/receptionist", authorizeRoles("Receptionist"), approveAppointmentByReceptionist);
router.patch("/:id/approve/doctor", authorizeRoles("Doctor"), approveAppointmentByDoctor);

router.patch("/:id/reject", authorizeRoles("Doctor", "Receptionist", "System Administrator", "Branch Manager"), rejectAppointment);

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
