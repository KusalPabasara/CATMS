import { Request, Response } from "express";
import sequelize from '../config/database';

export const fixRolesAndWorkflow = async (req: Request, res: Response) => {
  try {
    console.log('🔄 Starting roles and workflow fix...');
    
    // Update users with Medical Officer role to Receptionist
    await sequelize.query(`
      UPDATE users 
      SET role_id = (SELECT role_id FROM roles WHERE name = 'Receptionist')
      WHERE role_id = (SELECT role_id FROM roles WHERE name = 'Medical Officer')
    `);

    // Remove Medical Officer role
    await sequelize.query(`DELETE FROM roles WHERE name = 'Medical Officer'`);

    // Ensure we have exactly the required roles
    await sequelize.query(`
      INSERT IGNORE INTO roles (name) VALUES 
      ('System Administrator'),
      ('Branch Manager'),
      ('Doctor'),
      ('Receptionist'),
      ('Billing Staff'),
      ('Patient')
    `);

    // Ensure we have exactly 3 branches
    await sequelize.query(`
      INSERT IGNORE INTO branches (name, location, phone, email) VALUES 
      ('Colombo Branch', 'Colombo, Sri Lanka', '+94 11 234 5678', 'colombo@medsync.lk'),
      ('Galle Branch', 'Galle, Sri Lanka', '+94 91 234 5678', 'galle@medsync.lk'),
      ('Kandy Branch', 'Kandy, Sri Lanka', '+94 81 234 5678', 'kandy@medsync.lk')
    `);

    // Add staff_title column if it doesn't exist
    try {
      await sequelize.query(`ALTER TABLE users ADD COLUMN staff_title VARCHAR(100)`);
    } catch (error: any) {
      if (!error.message.includes('Duplicate column name')) {
        throw error;
      }
    }

    // Ensure appointments table has branch_id
    try {
      await sequelize.query(`ALTER TABLE appointments ADD COLUMN branch_id INT`);
    } catch (error: any) {
      if (!error.message.includes('Duplicate column name')) {
        throw error;
      }
    }

    // Add preferred_branch_id column to patients table
    try {
      await sequelize.query(`ALTER TABLE patients ADD COLUMN preferred_branch_id INT`);
    } catch (error: any) {
      if (!error.message.includes('Duplicate column name')) {
        throw error;
      }
    }

    try {
      await sequelize.query(`ALTER TABLE appointments ADD COLUMN approved_by INT`);
    } catch (error: any) {
      if (!error.message.includes('Duplicate column name')) {
        throw error;
      }
    }

    try {
      await sequelize.query(`ALTER TABLE appointments ADD COLUMN approved_at TIMESTAMP NULL`);
    } catch (error: any) {
      if (!error.message.includes('Duplicate column name')) {
        throw error;
      }
    }

    try {
      await sequelize.query(`ALTER TABLE appointments ADD COLUMN rejection_reason TEXT NULL`);
    } catch (error: any) {
      if (!error.message.includes('Duplicate column name')) {
        throw error;
      }
    }

    console.log('✅ Roles and workflow fix completed successfully');
    
    res.status(200).json({ 
      message: 'Roles and workflow fix completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Migration failed:', error);
    res.status(500).json({ 
      error: 'Migration failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
