import { Request, Response } from "express";
import Role from "../models/role.model";

export const getAllRoles = async (_req: Request, res: Response) => {
  try {
    const roles = await Role.findAll({
      order: [['name', 'ASC']]
    });
    res.json(roles);
  } catch (err) {
    console.error('Error fetching roles:', err);
    res.status(500).json({ error: "Failed to fetch roles", details: err });
  }
};

export const getRoleById = async (req: Request, res: Response) => {
  try {
    const role = await Role.findByPk(req.params.id);
    
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }
    
    res.json(role);
  } catch (err) {
    console.error('Error fetching role:', err);
    res.status(500).json({ error: "Failed to fetch role", details: err });
  }
};
