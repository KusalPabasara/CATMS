import { Router } from "express";
import {
  sendAppointmentReminder,
  sendPaymentReminder,
  sendCustomNotification,
  sendBulkNotification
} from "../controllers/notification.controller";
import { authenticateToken } from "../auth/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Send appointment reminder
router.post("/appointment/:appointmentId/reminder", 
  authorizeRoles('System Administrator', 'Doctor', 'Receptionist'), 
  sendAppointmentReminder
);

// Send payment reminder
router.post("/invoice/:invoiceId/reminder", 
  authorizeRoles('System Administrator', 'Doctor', 'Receptionist'), 
  sendPaymentReminder
);

// Send custom notification to a single patient
router.post("/custom", 
  authorizeRoles('System Administrator', 'Doctor', 'Receptionist'), 
  sendCustomNotification
);

// Send bulk notifications to multiple patients
router.post("/bulk", 
  authorizeRoles('System Administrator'), 
  sendBulkNotification
);

export default router;
