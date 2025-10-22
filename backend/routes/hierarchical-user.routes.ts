import { Router } from 'express';
import { 
  getHierarchicalUsers, 
  createHierarchicalUser, 
  updateHierarchicalUser, 
  deleteHierarchicalUser 
} from '../controllers/hierarchical-user.controller';
import { authenticateToken } from '../auth/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get users based on hierarchical permissions
router.get('/', 
  authorizeRoles('System Administrator', 'Branch Manager'),
  getHierarchicalUsers
);

// Create user based on hierarchical permissions
router.post('/', 
  authorizeRoles('System Administrator', 'Branch Manager'),
  createHierarchicalUser
);

// Update user based on hierarchical permissions
router.put('/:id', 
  authorizeRoles('System Administrator', 'Branch Manager'),
  updateHierarchicalUser
);

// Delete user based on hierarchical permissions
router.delete('/:id', 
  authorizeRoles('System Administrator', 'Branch Manager'),
  deleteHierarchicalUser
);

export default router;
