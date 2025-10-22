import { Router } from "express";
import {
  getDatabasePerformance,
  optimizeDatabase,
  getSystemHealth
} from "../controllers/performance.controller";
import { authenticateToken } from "../auth/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.use(authenticateToken); // All routes secured

// ===== PHASE 5: PERFORMANCE MONITORING & OPTIMIZATION =====

// Performance monitoring routes
router.get("/database-performance", authorizeRoles("System Administrator"), getDatabasePerformance);
router.get("/system-health", authorizeRoles("System Administrator", "Branch Manager"), getSystemHealth);
router.post("/optimize", authorizeRoles("System Administrator"), optimizeDatabase);

export default router;
