import { Router } from "express";
import {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice
} from "../controllers/invoice.controller";
import { authenticateToken } from "../auth/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.use(authenticateToken); // All routes secured

router.get("/", authorizeRoles("Billing Staff", "System Administrator", "Branch Manager"), getAllInvoices);
router.get("/:id", authorizeRoles("Billing Staff", "System Administrator", "Branch Manager"), getInvoiceById);
router.post("/", authorizeRoles("Billing Staff", "System Administrator"), createInvoice);
router.put("/:id", authorizeRoles("Billing Staff", "System Administrator"), updateInvoice);
router.delete("/:id", authorizeRoles("System Administrator"), deleteInvoice);

export default router;
