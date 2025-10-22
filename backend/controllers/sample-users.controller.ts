import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user.model';
import Role from '../models/role.model';
import Branch from '../models/branch.model';

export const createSampleUsers = async (req: Request, res: Response) => {
  try {
    // Add Nurse role if it doesn't exist
    const [nurseRole, created] = await Role.findOrCreate({
      where: { name: 'Nurse' },
      defaults: { name: 'Nurse' }
    });

    console.log('Nurse role:', nurseRole.getDataValue('role_id'));

    // Sample users data
    const sampleUsers = [
      // Branch Managers
      { branch_id: 1, role_name: 'Branch Manager', full_name: 'Sarah Johnson', email: 'sarah.johnson@medsync.lk', phone: '+94 77 123 4001', staff_title: 'Branch Manager' },
      { branch_id: 2, role_name: 'Branch Manager', full_name: 'Rajesh Kumar', email: 'rajesh.kumar@medsync.lk', phone: '+94 77 123 4002', staff_title: 'Branch Manager' },
      { branch_id: 3, role_name: 'Branch Manager', full_name: 'Nimal Fernando', email: 'nimal.fernando@medsync.lk', phone: '+94 77 123 4003', staff_title: 'Branch Manager' },
      
      // Nurses
      { branch_id: 1, role_name: 'Nurse', full_name: 'Emma Wilson', email: 'emma.wilson@medsync.lk', phone: '+94 77 123 5001', staff_title: 'Nurse' },
      { branch_id: 2, role_name: 'Nurse', full_name: 'Kamala Perera', email: 'kamala.perera@medsync.lk', phone: '+94 77 123 5002', staff_title: 'Nurse' },
      { branch_id: 3, role_name: 'Nurse', full_name: 'Samantha Silva', email: 'samantha.silva@medsync.lk', phone: '+94 77 123 5003', staff_title: 'Nurse' },
      
      // Non-Medical Staff
      { branch_id: 1, role_name: 'Receptionist', full_name: 'David Brown', email: 'david.brown@medsync.lk', phone: '+94 77 123 6001', staff_title: 'Receptionist' },
      { branch_id: 2, role_name: 'Receptionist', full_name: 'Lakshmi Devi', email: 'lakshmi.devi@medsync.lk', phone: '+94 77 123 6002', staff_title: 'Receptionist' },
      { branch_id: 3, role_name: 'Receptionist', full_name: 'James Anderson', email: 'james.anderson@medsync.lk', phone: '+94 77 123 6003', staff_title: 'Receptionist' }
    ];

    const createdUsers = [];

    for (const userData of sampleUsers) {
      // Find the role
      const role = await Role.findOne({ where: { name: userData.role_name } });
      if (!role) {
        console.log(`Role ${userData.role_name} not found, skipping user ${userData.full_name}`);
        continue;
      }

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email: userData.email } });
      if (existingUser) {
        console.log(`User ${userData.email} already exists, updating staff_title`);
        await existingUser.update({ staff_title: userData.staff_title });
        createdUsers.push({ ...userData, action: 'updated' });
        continue;
      }

      // Create new user
      const passwordHash = await bcrypt.hash('password123', 10);
      const user = await User.create({
        branch_id: userData.branch_id,
        role_id: role.getDataValue('role_id'),
        full_name: userData.full_name,
        email: userData.email,
        phone: userData.phone,
        password_hash: passwordHash,
        staff_title: userData.staff_title,
        is_active: true
      });

      createdUsers.push({ ...userData, user_id: user.getDataValue('user_id'), action: 'created' });
    }

    res.json({
      success: true,
      message: 'Sample users created/updated successfully',
      users: createdUsers
    });

  } catch (error) {
    console.error('Error creating sample users:', error);
    res.status(500).json({ 
      error: 'Failed to create sample users',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
