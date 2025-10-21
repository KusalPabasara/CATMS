import { Request, Response } from "express";
import User from "../models/user.model";
import Staff from "../models/staff.model";
import { logAuditWithRequest, auditActions } from "../services/audit.service";

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      where: { is_active: true },
      order: [['full_name', 'ASC']]
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users", details: err });
  }
};

export const getUsersByRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.query;
    
    if (!role) {
      return res.status(400).json({ error: "Role parameter is required" });
    }

    // For doctor role, we need to get staff members who are doctors
    if (role === 'doctor') {
      const doctors = await Staff.findAll({
        where: { 
          role: 'Doctor',
          is_active: true 
        },
        order: [['first_name', 'ASC']]
      });
      
      // Map staff to user format for consistency
      const mappedDoctors = doctors.map(doctor => ({
        user_id: doctor.staff_id,
        full_name: `${doctor.first_name} ${doctor.last_name}`,
        email: doctor.email,
        specialty: doctor.speciality,
        role: 'Doctor'
      }));
      
      return res.json(mappedDoctors);
    }

    // For other roles, use the User model
    const users = await User.findAll({
      where: { is_active: true },
      order: [['full_name', 'ASC']]
    });
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users by role", details: err });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user", details: err });
  }
};
