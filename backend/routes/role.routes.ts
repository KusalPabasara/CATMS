import { Router } from 'express';
import { getAllRoles, getRoleById } from '../controllers/role.controller';
import { authenticateToken } from '../auth/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all roles
router.get('/', 
  authorizeRoles('System Administrator', 'Branch Manager'),
  getAllRoles
);

// Get role by ID
router.get('/:id', 
  authorizeRoles('System Administrator', 'Branch Manager'),
  getRoleById
);

export default router;
