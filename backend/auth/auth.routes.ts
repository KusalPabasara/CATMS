import { Router } from 'express';
import { login, register } from './auth.controller';
import { authenticateToken } from './auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

// Public
router.post('/login', login);

// Protected: Admin Only
router.post('/register', authenticateToken, authorizeRoles('System Administrator', 'Branch Manager'), register);

export default router;
