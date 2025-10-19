import { Request, Response } from "express";
import User from "../models/user.model";
import Role from "../models/role.model";
import Branch from "../models/branch.model";
import { logAuditWithRequest, auditActions } from "../services/audit.service";

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      where: { is_active: true },
      include: [
        { model: Role, as: 'Role' },
        { model: Branch, as: 'UserBranch' }
      ],
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

    const users = await User.findAll({
      where: { is_active: true },
      include: [
        { 
          model: Role, 
          as: 'Role',
          where: { name: role }
        },
        { model: Branch, as: 'UserBranch' }
      ],
      order: [['full_name', 'ASC']]
    });
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users by role", details: err });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        { model: Role, as: 'Role' },
        { model: Branch, as: 'UserBranch' }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user", details: err });
  }
};
