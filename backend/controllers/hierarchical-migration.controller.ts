import { Request, Response } from 'express';
import sequelize from '../config/database';

export const migrateHierarchicalRoles = async (req: Request, res: Response) => {
  try {
    console.log('🔄 Starting hierarchical roles migration...');
    
    // Update roles for hierarchical workflow
    await sequelize.query(`
      INSERT IGNORE INTO roles (name) VALUES 
      ('System Administrator'),
      ('Branch Manager'),
      ('Medical Officer'),
      ('Doctor'),
      ('Nurse'),
      ('Receptionist'),
      ('Billing Staff')
    `);

    // Update existing roles
    await sequelize.query(`
      UPDATE roles SET name = 'System Administrator' WHERE name = 'Admin'
    `);

    // Update existing appointments to have branch_id based on doctor's branch
    await sequelize.query(`
      UPDATE appointments a 
      JOIN users u ON a.doctor_id = u.user_id 
      SET a.branch_id = u.branch_id 
      WHERE a.branch_id IS NULL AND u.branch_id IS NOT NULL
    `);

    console.log('✅ Hierarchical roles migration completed successfully');
    
    res.status(200).json({ 
      message: 'Hierarchical roles migration completed successfully',
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
