import { Router } from "express";
import { authenticateToken } from "../auth/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import {
  getAuditLogs,
  getAuditLogById,
  getAuditStats,
  exportAuditLogs
} from "../controllers/audit.controller";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get audit logs with filtering and pagination
router.get("/", 
  authorizeRoles('System Administrator', 'Branch Manager'), 
  getAuditLogs
);

// Get specific audit log by ID
router.get("/:id", 
  authorizeRoles('System Administrator', 'Branch Manager'), 
  getAuditLogById
);

// Get audit statistics and analytics
router.get("/stats/overview", 
  authorizeRoles('System Administrator', 'Branch Manager'), 
  getAuditStats
);

// Export audit logs (CSV or JSON)
router.get("/export/data", 
  authorizeRoles('System Administrator'), 
  exportAuditLogs
);

export default router;
