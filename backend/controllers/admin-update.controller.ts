import { Request, Response } from 'express';
import User from '../models/user.model';

export const updateAdminStaffTitle = async (req: Request, res: Response) => {
  try {
    // Update admin user to have System Administrator as staff title
    await User.update(
      { staff_title: 'System Administrator' },
      { where: { email: 'admin@catms.com' } }
    );

    res.json({
      success: true,
      message: 'Admin user staff title updated successfully'
    });

  } catch (error) {
    console.error('Error updating admin staff title:', error);
    res.status(500).json({ 
      error: 'Failed to update admin staff title',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
