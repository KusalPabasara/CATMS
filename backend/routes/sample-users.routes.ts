import { Router } from 'express';
import { createSampleUsers } from '../controllers/sample-users.controller';
import { migrateDatabase } from '../controllers/migration.controller';
import { updateAdminStaffTitle } from '../controllers/admin-update.controller';
import { migrateHierarchicalRoles } from '../controllers/hierarchical-migration.controller';
import { fixRolesAndWorkflow } from '../controllers/fix-roles-workflow.controller';

const router = Router();

// Migrate database and create sample users
router.post('/migrate', migrateDatabase);

// Update admin user staff title
router.post('/update-admin', updateAdminStaffTitle);

// Create sample users with different roles and staff titles
router.post('/create-sample-users', createSampleUsers);

// Migrate hierarchical roles
router.post('/migrate-hierarchical-roles', migrateHierarchicalRoles);

// Fix roles and workflow
router.post('/fix-roles-workflow', fixRolesAndWorkflow);

export default router;
