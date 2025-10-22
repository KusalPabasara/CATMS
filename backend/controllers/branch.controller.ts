import { Request, Response } from "express";
import Branch from "../models/branch.model";

export const getAllBranches = async (_req: Request, res: Response) => {
  try {
    const branches = await Branch.findAll({
      order: [['name', 'ASC']]
    });
    res.json(branches);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch branches", details: err });
  }
};

export const getBranchById = async (req: Request, res: Response) => {
  try {
    const branch = await Branch.findByPk(req.params.id);
    if (!branch) return res.status(404).json({ error: "Branch not found" });
    res.json(branch);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch branch", details: err });
  }
};
