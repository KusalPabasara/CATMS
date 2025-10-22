import express, { Request, Response } from 'express';
import { authenticateToken } from '../auth/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import db from '../config/database';
import { QueryTypes } from 'sequelize';
import bcrypt from 'bcrypt';

const router = express.Router();

// GET /api/staff - list staff (Admin, Branch Manager)
router.get(
  '/',
  authenticateToken,
  authorizeRoles('System Administrator', 'Branch Manager'),
  async (_req: Request, res: Response) => {
    try {
      const staff = await db.query(
        `
        SELECT 
          s.staff_id,
          s.first_name,
          s.last_name,
          s.role,
          s.speciality,
          s.email,
          s.branch_id,
          s.is_active,
          s.created_at,
          b.branch_name,
          b.location AS branch_location
        FROM staff s
        LEFT JOIN branch b ON s.branch_id = b.branch_id
        ORDER BY s.created_at DESC
      `,
        { type: QueryTypes.SELECT }
      );

      res.json(staff);
    } catch (error) {
      console.error('Error fetching staff:', error);
      res.status(500).json({ error: 'Failed to fetch staff members' });
    }
  }
);

// GET /api/staff/:id - get a staff member (authenticated)
router.get(
  '/:id',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const staff = await db.query(
        `
        SELECT 
          s.*,
          b.branch_name,
          b.location AS branch_location
        FROM staff s
        LEFT JOIN branch b ON s.branch_id = b.branch_id
        WHERE s.staff_id = :id
      `,
        { replacements: { id: req.params.id }, type: QueryTypes.SELECT }
      );

      if (!staff || (staff as any[]).length === 0) {
        return res.status(404).json({ error: 'Staff member not found' });
      }

      res.json((staff as any[])[0]);
    } catch (error) {
      console.error('Error fetching staff by id:', error);
      res.status(500).json({ error: 'Failed to fetch staff member' });
    }
  }
);

// POST /api/staff - create staff member + login user (Admin, Branch Manager)
router.post(
  '/',
  authenticateToken,
  authorizeRoles('System Administrator', 'Branch Manager'),
  async (req: Request, res: Response) => {
    try {
      const { first_name, last_name, role, speciality, email, branch_id, password } = req.body;

      if (!first_name || !last_name || !role || !email || !branch_id) {
        return res.status(400).json({ error: 'Please fill in all required fields' });
      }

      if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Password is required (min 6 characters)' });
      }

      // Ensure email is unique across staff and users
      const existingStaff = await db.query(
        'SELECT staff_id FROM staff WHERE email = :email',
        { replacements: { email }, type: QueryTypes.SELECT }
      );
      if ((existingStaff as any[]).length > 0) {
        return res.status(400).json({ error: 'Email already exists in staff records' });
      }

      const existingUser = await db.query(
        'SELECT user_id FROM users WHERE email = :email',
        { replacements: { email }, type: QueryTypes.SELECT }
      );
      if ((existingUser as any[]).length > 0) {
        return res.status(400).json({ error: 'Email already exists in user records' });
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 10);

      // Insert staff
      const insertStaffResult = (await db.query(
        `
        INSERT INTO staff (first_name, last_name, role, speciality, email, branch_id, is_active)
        VALUES (:first_name, :last_name, :role, :speciality, :email, :branch_id, 1)
      `,
        {
          replacements: {
            first_name,
            last_name,
            role,
            speciality: speciality || null,
            email,
            branch_id,
          },
          type: QueryTypes.INSERT,
        }
      )) as unknown as [number, number];

      const staff_id = insertStaffResult[0];

      // Resolve role_id for users table
      const roleRow = (await db.query(
        'SELECT role_id FROM roles WHERE name = :name LIMIT 1',
        { replacements: { name: role === 'Admin' ? 'System Administrator' : role }, type: QueryTypes.SELECT }
      )) as any[];

      // Fallback mapping if role not found
      let role_id: number | null = roleRow?.[0]?.role_id ?? null;
      if (!role_id) {
        const fallback: Record<string, number> = {
          'System Administrator': 1,
          'Admin': 1,
          'Branch Manager': 2,
          'Doctor': 3,
          'Receptionist': 4,
          'Nurse': 5,
          'Other': 6,
        };
        role_id = fallback[role] ?? 6;
      }

      // Insert corresponding user for login
      const insertUserResult = (await db.query(
        `
        INSERT INTO users (full_name, email, password_hash, role_id, branch_id, is_active)
        VALUES (:full_name, :email, :password_hash, :role_id, :branch_id, 1)
      `,
        {
          replacements: {
            full_name: `${first_name} ${last_name}`,
            email,
            password_hash,
            role_id,
            branch_id,
          },
          type: QueryTypes.INSERT,
        }
      )) as unknown as [number, number];

      const user_id = insertUserResult[0];

      res.status(201).json({
        message: 'Staff member created successfully with login credentials',
        staff_id,
        user_id,
      });
    } catch (error: any) {
      console.error('Error creating staff:', error);
      res.status(500).json({ error: 'Failed to create staff member', details: error.message });
    }
  }
);

// PATCH /api/staff/:id/status - activate/deactivate (Admin, Branch Manager)
router.patch(
  '/:id/status',
  authenticateToken,
  authorizeRoles('System Administrator', 'Branch Manager'),
  async (req: Request, res: Response) => {
    try {
      const { is_active } = req.body as { is_active: boolean };
      const staffId = req.params.id;

      if (typeof is_active !== 'boolean') {
        return res.status(400).json({ error: 'is_active (boolean) is required' });
      }

      // Find staff email to sync users table
      const staffRow = (await db.query(
        'SELECT email FROM staff WHERE staff_id = :id LIMIT 1',
        { replacements: { id: staffId }, type: QueryTypes.SELECT }
      )) as any[];

      if (!staffRow?.[0]?.email) {
        return res.status(404).json({ error: 'Staff member not found' });
      }
      const email = staffRow[0].email as string;

      // Update staff.active
      const updateStaff = (await db.query(
        'UPDATE staff SET is_active = :is_active WHERE staff_id = :id',
        { replacements: { is_active: is_active ? 1 : 0, id: staffId }, type: QueryTypes.UPDATE }
      )) as unknown as [number, number];

      const affected = updateStaff?.[1] ?? updateStaff?.[0];
      if (!affected) {
        return res.status(404).json({ error: 'Staff member not found' });
      }

      // Update users.is_active for the linked account
      await db.query(
        'UPDATE users SET is_active = :is_active WHERE email = :email',
        { replacements: { is_active: is_active ? 1 : 0, email }, type: QueryTypes.UPDATE }
      );

      res.json({
        message: `Staff member ${is_active ? 'activated' : 'deactivated'} successfully`,
        is_active,
      });
    } catch (error: any) {
      console.error('Error toggling staff status:', error);
      res.status(500).json({ error: 'Failed to update staff status', details: error.message });
    }
  }
);

// PUT /api/staff/:id - update staff (Admin, Branch Manager)
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('System Administrator', 'Branch Manager'),
  async (req: Request, res: Response) => {
    try {
      const { first_name, last_name, role, speciality, email, branch_id, is_active } = req.body;

      const updateRes = (await db.query(
        `
        UPDATE staff 
        SET first_name = :first_name,
            last_name = :last_name,
            role = :role,
            speciality = :speciality,
            email = :email,
            branch_id = :branch_id,
            is_active = :is_active
        WHERE staff_id = :id
      `,
        {
          replacements: {
            first_name,
            last_name,
            role,
            speciality,
            email,
            branch_id,
            is_active: is_active ? 1 : 0,
            id: req.params.id,
          },
          type: QueryTypes.UPDATE,
        }
      )) as unknown as [number, number];

      const affected = updateRes?.[1] ?? updateRes?.[0];
      if (!affected) {
        return res.status(404).json({ error: 'Staff member not found' });
      }

      // Keep user record in sync (by email)
      await db.query(
        `
        UPDATE users
        SET full_name = :full_name,
            email = :email,
            is_active = :is_active
        WHERE email = :email
      `,
        {
          replacements: {
            full_name: `${first_name} ${last_name}`,
            email,
            is_active: is_active ? 1 : 0,
          },
          type: QueryTypes.UPDATE,
        }
      );

      res.json({ message: 'Staff member updated successfully' });
    } catch (error: any) {
      console.error('Error updating staff:', error);
      res.status(500).json({ error: 'Failed to update staff member', details: error.message });
    }
  }
);

// DELETE /api/staff/:id - HARD DELETE (Admin) - remove staff + linked user
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('System Administrator'),
  async (req: Request, res: Response) => {
    try {
      const staffId = req.params.id;

      // Find staff email
      const staffRow = (await db.query(
        'SELECT email FROM staff WHERE staff_id = :id LIMIT 1',
        { replacements: { id: staffId }, type: QueryTypes.SELECT }
      )) as any[];

      if (!staffRow?.[0]?.email) {
        return res.status(404).json({ error: 'Staff member not found' });
      }
      const email = staffRow[0].email as string;

      // Delete linked user first (by email)
      await db.query('DELETE FROM users WHERE email = :email', {
        replacements: { email },
        type: QueryTypes.DELETE,
      });

      // Delete staff
      const delRes = (await db.query('DELETE FROM staff WHERE staff_id = :id', {
        replacements: { id: staffId },
        type: QueryTypes.DELETE,
      })) as unknown as [number, number];

      const affected = delRes?.[1] ?? delRes?.[0];
      if (!affected) {
        return res.status(404).json({ error: 'Staff member not found' });
      }

      res.json({ message: 'Staff member permanently removed' });
    } catch (error: any) {
      console.error('Error permanently deleting staff:', error);
      res.status(500).json({ error: 'Failed to permanently remove staff member', details: error.message });
    }
  }
);

// POST /api/staff/:id/reset-password - reset linked user password (Admin)
router.post(
  '/:id/reset-password',
  authenticateToken,
  authorizeRoles('System Administrator'),
  async (req: Request, res: Response) => {
    try {
      const { new_password } = req.body;
      if (!new_password || new_password.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
      }

      // Get staff email
      const staffRow = (await db.query(
        'SELECT email FROM staff WHERE staff_id = :id LIMIT 1',
        { replacements: { id: req.params.id }, type: QueryTypes.SELECT }
      )) as any[];

      if (!staffRow?.[0]?.email) {
        return res.status(404).json({ error: 'Staff member not found' });
      }
      const email = staffRow[0].email as string;

      const password_hash = await bcrypt.hash(new_password, 10);

      await db.query('UPDATE users SET password_hash = :password_hash WHERE email = :email', {
        replacements: { password_hash, email },
        type: QueryTypes.UPDATE,
      });

      res.json({ message: 'Password reset successfully' });
    } catch (error: any) {
      console.error('Error resetting password:', error);
      res.status(500).json({ error: 'Failed to reset password', details: error.message });
    }
  }
);

export default router;