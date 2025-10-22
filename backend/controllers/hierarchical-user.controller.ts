import { Request, Response } from "express";
import User from "../models/user.model";
import Role from "../models/role.model";
import Branch from "../models/branch.model";
import { logAuditWithRequest, auditActions } from "../services/audit.service";
import bcrypt from 'bcrypt';

// Generate unique password based on name
const generateBranchManagerPassword = (fullName: string): string => {
  // Extract first and last name
  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts[nameParts.length - 1] || '';

  // Create password: FirstName + LastInitial + Year + SpecialChar
  const year = new Date().getFullYear();
  const specialChar = '@';
  const lastInitial = lastName.charAt(0).toUpperCase();

  return `${firstName}${lastInitial}${year}${specialChar}`;
};

// Interface for hierarchical user creation
interface HierarchicalUserData {
  full_name: string;
  email: string;
  password: string;
  role: string;
  branch_id?: number;
  staff_title?: string;
}

// Get users based on hierarchical permissions
export const getHierarchicalUsers = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    const { role, branch_id } = req.query;

    let whereClause: any = { is_active: true };

    // Apply hierarchical filtering based on current user's role
    if (currentUser.role === 'System Administrator') {
      // System Administrator can see all users
      if (role) whereClause.role_id = await getRoleIdByName(role as string);
      if (branch_id) whereClause.branch_id = branch_id;
    } else if (currentUser.role === 'Branch Manager') {
      // Branch Manager can only see users from their branch
      whereClause.branch_id = currentUser.branch_id;
      // Branch Managers cannot see other Branch Managers or System Administrators
      const excludedRoles = await getRoleIdsByName(['System Administrator', 'Branch Manager']);
      whereClause.role_id = { [require('sequelize').Op.notIn]: excludedRoles };
      if (role) whereClause.role_id = await getRoleIdByName(role as string);
    } else {
      // Other roles have limited access
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const users = await User.findAll({
      where: whereClause,
      order: [['full_name', 'ASC']]
    });

    res.json(users);
  } catch (err) {
    console.error('Error fetching hierarchical users:', err);
    res.status(500).json({ error: "Failed to fetch users", details: err });
  }
};

// Create user based on hierarchical permissions
export const createHierarchicalUser = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    const userData: HierarchicalUserData = req.body;
    console.log('Creating user with data:', userData);

    // Validate permissions
    const canCreate = await validateUserCreationPermission(currentUser, userData.role);
    if (!canCreate.allowed) {
      return res.status(403).json({ error: canCreate.reason });
    }

    // Handle password generation for Branch Managers
    let finalPassword = userData.password;
    if (userData.role === 'Branch Manager') {
      finalPassword = generateBranchManagerPassword(userData.full_name);
    } else if (!userData.password) {
      return res.status(400).json({ error: 'Password is required for this role' });
    }

    // Validate required fields
    if (!userData.full_name || !userData.email || !userData.role) {
      console.log('Missing required fields:', { full_name: !!userData.full_name, email: !!userData.email, role: !!userData.role });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Get role ID
    const roleId = await getRoleIdByName(userData.role);
    if (!roleId) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(finalPassword, 10);

    // Determine branch_id based on hierarchy
    let branchId = userData.branch_id;
    if (currentUser.role === 'Branch Manager') {
      branchId = currentUser.branch_id; // Branch Managers can only create users for their branch
    }

    // Create user
    const newUser = await User.create({
      full_name: userData.full_name,
      email: userData.email,
      password_hash: hashedPassword,
      role_id: roleId,
      branch_id: branchId,
      staff_title: userData.staff_title,
      is_active: true
    });

    // Log audit
    await logAuditWithRequest(
      req,
      auditActions.USER_CREATED,
      'users',
      newUser.user_id,
      `Created ${userData.role}: ${userData.full_name} (${userData.email})`
    );

    res.status(201).json({
      message: 'User created successfully',
      user_id: newUser.user_id,
      user: {
        user_id: newUser.user_id,
        full_name: newUser.full_name,
        email: newUser.email,
        role: userData.role,
        branch_id: branchId,
        staff_title: userData.staff_title
      },
      ...(userData.role === 'Branch Manager' && {
        generated_password: finalPassword,
        password_note: 'Please save this password. It will only be shown once and cannot be recovered later.'
      })
    });

  } catch (err) {
    console.error('Error creating hierarchical user:', err);
    res.status(500).json({ error: "Failed to create user", details: err });
  }
};

// Update user based on hierarchical permissions
export const updateHierarchicalUser = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    const userId = parseInt(req.params.id);
    const updateData = req.body;

    // Find the user to update
    const userToUpdate = await User.findByPk(userId);
    if (!userToUpdate) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate permissions
    const canUpdate = await validateUserUpdatePermission(currentUser, userToUpdate);
    if (!canUpdate.allowed) {
      return res.status(403).json({ error: canUpdate.reason });
    }

    // Prepare update data
    const updateFields: any = {};
    if (updateData.full_name) updateFields.full_name = updateData.full_name;
    if (updateData.email) updateFields.email = updateData.email;
    if (updateData.staff_title) updateFields.staff_title = updateData.staff_title;
    if (updateData.password) {
      updateFields.password_hash = await bcrypt.hash(updateData.password, 10);
    }

    // Role and branch updates require special permissions
    if (updateData.role && currentUser.role === 'System Administrator') {
      const roleId = await getRoleIdByName(updateData.role);
      if (roleId) updateFields.role_id = roleId;
    }

    if (updateData.branch_id && currentUser.role === 'System Administrator') {
      updateFields.branch_id = updateData.branch_id;
    }

    // Update user
    await userToUpdate.update(updateFields);

    // Log audit
    await logAuditWithRequest(
      req,
      auditActions.USER_UPDATED,
      'users',
      userId,
      `Updated user: ${userToUpdate.full_name} (${userToUpdate.email})`
    );

    res.json({
      message: 'User updated successfully',
      user: {
        user_id: userToUpdate.user_id,
        full_name: userToUpdate.full_name,
        email: userToUpdate.email,
        role: updateData.role || userToUpdate.role_id,
        branch_id: updateData.branch_id || userToUpdate.branch_id,
        staff_title: userToUpdate.staff_title
      }
    });

  } catch (err) {
    console.error('Error updating hierarchical user:', err);
    res.status(500).json({ error: "Failed to update user", details: err });
  }
};

// Delete user based on hierarchical permissions
export const deleteHierarchicalUser = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    const userId = parseInt(req.params.id);

    // Find the user to delete
    const userToDelete = await User.findByPk(userId);
    if (!userToDelete) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate permissions
    const canDelete = await validateUserDeletePermission(currentUser, userToDelete);
    if (!canDelete.allowed) {
      return res.status(403).json({ error: canDelete.reason });
    }

    // Soft delete (set is_active to false)
    await userToDelete.update({ is_active: false });

    // Log audit
    await logAuditWithRequest(
      req,
      auditActions.USER_DELETED,
      'users',
      userId,
      `Deleted user: ${userToDelete.full_name} (${userToDelete.email})`
    );

    res.json({ message: 'User deleted successfully' });

  } catch (err) {
    console.error('Error deleting hierarchical user:', err);
    res.status(500).json({ error: "Failed to delete user", details: err });
  }
};

// Helper functions
async function getRoleIdByName(roleName: string): Promise<number | null> {
  const role = await Role.findOne({ where: { name: roleName } });
  return role ? role.role_id : null;
}

async function getRoleIdsByName(roleNames: string[]): Promise<number[]> {
  const roles = await Role.findAll({ where: { name: { [require('sequelize').Op.in]: roleNames } } });
  return roles.map(role => role.role_id);
}

async function validateUserCreationPermission(currentUser: any, targetRole: string): Promise<{ allowed: boolean; reason?: string }> {
  if (currentUser.role === 'System Administrator') {
    return { allowed: true };
  }
  
  if (currentUser.role === 'Branch Manager') {
    // Branch Managers can create: Medical Officers, Doctors, Nurses, Receptionist, Billing Staff
    const allowedRoles = ['Medical Officer', 'Doctor', 'Nurse', 'Receptionist', 'Billing Staff'];
    if (allowedRoles.includes(targetRole)) {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Branch Managers cannot create users with this role' };
  }
  
  return { allowed: false, reason: 'Insufficient permissions to create users' };
}

async function validateUserUpdatePermission(currentUser: any, targetUser: any): Promise<{ allowed: boolean; reason?: string }> {
  if (currentUser.role === 'System Administrator') {
    return { allowed: true };
  }
  
  if (currentUser.role === 'Branch Manager') {
    // Branch Managers can only update users from their branch
    if (targetUser.branch_id === currentUser.branch_id) {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Can only update users from your branch' };
  }
  
  return { allowed: false, reason: 'Insufficient permissions to update users' };
}

async function validateUserDeletePermission(currentUser: any, targetUser: any): Promise<{ allowed: boolean; reason?: string }> {
  if (currentUser.role === 'System Administrator') {
    return { allowed: true };
  }
  
  if (currentUser.role === 'Branch Manager') {
    // Branch Managers can only delete users from their branch
    if (targetUser.branch_id === currentUser.branch_id) {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Can only delete users from your branch' };
  }
  
  return { allowed: false, reason: 'Insufficient permissions to delete users' };
}
