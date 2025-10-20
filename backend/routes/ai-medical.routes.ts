import { Router } from "express";
import { 
  processAIQuery, 
  getAIModels, 
  getAIUsageStats, 
  saveAIQuery,
  getChatHistory
} from "../controllers/ai-medical.controller";
import { authenticateToken } from "../auth/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// AI Medical Assistant routes - accessible to doctors and administrators
router.post("/query", 
  authorizeRoles("Doctor", "System Administrator", "Branch Manager"), 
  processAIQuery
);

router.get("/models", 
  authorizeRoles("Doctor", "System Administrator", "Branch Manager"), 
  getAIModels
);

router.get("/usage-stats", 
  authorizeRoles("Doctor", "System Administrator", "Branch Manager"), 
  getAIUsageStats
);

router.post("/save-query", 
  authorizeRoles("Doctor", "System Administrator", "Branch Manager"), 
  saveAIQuery
);

router.get("/chat-history", 
  authorizeRoles("Doctor", "System Administrator", "Branch Manager"), 
  getChatHistory
);

export default router;
