import { Request, Response } from 'express';
import User from '../models/user.model';
import { Staff } from '../models/staff.model';
import Role from '../models/role.model';
import Branch from '../models/branch.model';
import bcrypt from 'bcrypt';
import { logAuditWithRequest, auditActions } from '../services/audit.service';

// Get all doctors
export const getDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await User.findAll({
      where: {
        role_id: 3 // Doctor role ID
      }
    });

    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
};

// Get doctor by ID
export const getDoctorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doctor = await User.findByPk(id, {
      include: [
        { model: Role, as: 'Role' },
        { model: Branch, as: 'Branch' }
      ]
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ error: 'Failed to fetch doctor' });
  }
};

// Create new doctor
export const createDoctor = async (req: Request, res: Response) => {
  try {
    const {
      full_name,
      email,
      phone,
      speciality,
      branch_id,
      password
    } = req.body;

    // Validate required fields
    if (!full_name || !email || !password) {
      return res.status(400).json({ 
        error: 'Full name, email, and password are required' 
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Email already exists' 
      });
    }

    // Get Doctor role ID
    const doctorRoleId = 3; // Doctor role ID from database

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user account
    const user = await User.create({
      full_name,
      email,
      phone,
      password_hash,
      role_id: doctorRoleId,
      branch_id: branch_id || null,
      is_active: true
    });

    res.status(201).json({
      message: 'Doctor created successfully',
      doctor: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        speciality,
        branch_id: user.branch_id,
        is_active: user.is_active
      }
    });
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({ 
      error: 'Failed to create doctor',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update doctor
export const updateDoctor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      full_name,
      email,
      phone,
      speciality,
      branch_id,
      password,
      is_active
    } = req.body;

    const doctor = await User.findByPk(id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== doctor.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ 
          error: 'Email already exists' 
        });
      }
    }

    // Update user
    const updateData: any = {
      full_name: full_name || doctor.full_name,
      email: email || doctor.email,
      phone: phone || doctor.phone,
      branch_id: branch_id !== undefined ? branch_id : doctor.branch_id,
      is_active: is_active !== undefined ? is_active : doctor.is_active
    };

    // Hash new password if provided
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    await doctor.update(updateData);

    // Update staff record
    const staff = await Staff.findOne({ where: { email: doctor.email } });
    if (staff) {
      const nameParts = (full_name || doctor.full_name).trim().split(' ');
      const first_name = nameParts[0] || '';
      const last_name = nameParts.slice(1).join(' ') || '';

      await staff.update({
        first_name,
        last_name,
        speciality: speciality || staff.speciality,
        email: email || staff.email,
        branch_id: branch_id !== undefined ? branch_id : staff.branch_id,
        is_active: is_active !== undefined ? is_active : staff.is_active
      });
    }

    // Log audit trail
    await logAuditWithRequest(
      req,
      auditActions.USER_UPDATED,
      'users',
      doctor.user_id,
      `Doctor updated: ${doctor.full_name} (${doctor.email})`
    );

    res.json({
      message: 'Doctor updated successfully',
      doctor: {
        user_id: doctor.user_id,
        full_name: doctor.full_name,
        email: doctor.email,
        phone: doctor.phone,
        speciality,
        branch_id: doctor.branch_id,
        is_active: doctor.is_active
      }
    });
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ 
      error: 'Failed to update doctor',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete doctor (soft delete)
export const deleteDoctor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const doctor = await User.findByPk(id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Soft delete by setting is_active to false
    await doctor.update({ is_active: false });

    // Also update staff record
    const staff = await Staff.findOne({ where: { email: doctor.email } });
    if (staff) {
      await staff.update({ is_active: false });
    }

    // Log audit trail
    await logAuditWithRequest(
      req,
      auditActions.USER_DELETED,
      'users',
      doctor.user_id,
      `Doctor deactivated: ${doctor.full_name} (${doctor.email})`
    );

    res.json({ message: 'Doctor deactivated successfully' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ 
      error: 'Failed to delete doctor',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Reset doctor password
export const resetDoctorPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;

    if (!new_password) {
      return res.status(400).json({ 
        error: 'New password is required' 
      });
    }

    const doctor = await User.findByPk(id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Hash new password
    const password_hash = await bcrypt.hash(new_password, 10);
    await doctor.update({ password_hash });

    // Log audit trail
    await logAuditWithRequest(
      req,
      auditActions.USER_PASSWORD_RESET,
      'users',
      doctor.user_id,
      `Password reset for doctor: ${doctor.full_name} (${doctor.email})`
    );

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ 
      error: 'Failed to reset password',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
