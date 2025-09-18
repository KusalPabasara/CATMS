import { Router } from "express";
import {
  createPayment,
  getPaymentsByInvoice,
  getAllPayments
} from "../controllers/payment.controller";
import { authenticateToken } from "../auth/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.use(authenticateToken); // All routes secured

// Create payment
router.post("/", authorizeRoles("Billing Staff", "Receptionist", "System Administrator"), createPayment);

// Get payments for specific invoice
router.get("/invoice/:invoice_id", authorizeRoles("Billing Staff", "Receptionist", "System Administrator"), getPaymentsByInvoice);

// Get all payments (for admin/billing staff)
router.get("/", authorizeRoles("Billing Staff", "System Administrator"), getAllPayments);

export default router;
