import { Request, Response } from "express";
import User from "../models/user.model";
import Role from "../models/role.model";
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

    if (!role || typeof role !== 'string') {
      return res.status(400).json({ error: "Role parameter is required" });
    }

    // Find the role by name to get the role_id
    const roleRecord = await Role.findOne({
      where: { name: role }
    });

    if (!roleRecord) {
      return res.status(404).json({ error: "Role not found" });
    }

    // Get users with the specified role
    const users = await User.findAll({
      where: { 
        role_id: roleRecord.role_id,
        is_active: true 
      },
      order: [['full_name', 'ASC']]
    });
    
    res.json(users);
  } catch (err) {
    console.error('Error in getUsersByRole:', err);
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
