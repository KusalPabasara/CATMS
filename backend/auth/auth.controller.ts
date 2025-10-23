import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user.model';
import Role from '../models/role.model';
import Branch from '../models/branch.model';
import { generateToken } from '../utils/jwt.util';
import { logAuditWithRequest, auditActions } from '../services/audit.service';

export const login = async (req: Request, res: Response) => {
  const { email, password, staff_title, branch_id } = req.body;

  try {
    const user = await User.findOne({
      where: { email },
    });

    if (!user || !await bcrypt.compare(password, user.getDataValue('password_hash'))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Validate staff title and branch if provided
    if (staff_title && user.getDataValue('staff_title') !== staff_title) {
      return res.status(401).json({ error: 'Invalid staff title for this user' });
    }

    if (branch_id && user.getDataValue('branch_id') !== parseInt(branch_id)) {
      return res.status(401).json({ error: 'Invalid branch for this user' });
    }

    // Fetch role and branch separately to avoid eager loading issues
    const role = await Role.findByPk(user.getDataValue('role_id'));
    const branch = user.getDataValue('branch_id') ? await Branch.findByPk(user.getDataValue('branch_id')) : null;

    const token = generateToken({
      user_id: user.getDataValue('user_id'),
      role: role?.getDataValue('name'),
      branch_id: user.getDataValue('branch_id'),
      branch_name: branch?.getDataValue('name'),
      staff_title: user.getDataValue('staff_title'),
      email: user.getDataValue('email'),
    });

    // Log audit trail for login
    await logAuditWithRequest(
      req,
      auditActions.LOGIN,
      'users',
      user.getDataValue('user_id'),
      `User login: ${user.getDataValue('email')}`
    );

    res.status(200).json({ 
      token,
      user: {
        user_id: user.getDataValue('user_id'),
        role: role?.getDataValue('name'),
        branch_id: user.getDataValue('branch_id'),
        branch_name: branch?.getDataValue('name'),
        staff_title: user.getDataValue('staff_title'),
        email: user.getDataValue('email'),
        full_name: user.getDataValue('full_name')
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err });
  }
};

// For admins to create accounts (doctors, staff, etc.)
export const register = async (req: Request, res: Response) => {
  const { full_name, email, password, role_id, branch_id, staff_title } = req.body;

  try {
    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      full_name,
      email,
      password_hash: hash,
      role_id,
      branch_id,
      staff_title,
    });

    // Log audit trail for user creation
    await logAuditWithRequest(
      req,
      auditActions.USER_CREATED,
      'users',
      (user as any).user_id,
      `Created user: ${full_name} (${email})`
    );

    res.status(201).json({ message: 'User created', user_id: user.user_id });
  } catch (err) {
    res.status(500).json({ error: 'User registration failed', details: err });
  }
};
