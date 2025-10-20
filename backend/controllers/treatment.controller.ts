import { Request, Response } from "express";
import Treatment from "../models/treatment.model";

export const getAllTreatments = async (_req: Request, res: Response) => {
  try {
    const treatments = await Treatment.findAll({
      order: [['created_at', 'DESC']]
    });
    res.json(treatments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch treatments", details: err });
  }
};

export const getTreatmentById = async (req: Request, res: Response) => {
  try {
    const treatment = await Treatment.findByPk(req.params.id);
    if (!treatment) return res.status(404).json({ error: "Treatment not found" });
    res.json(treatment);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch treatment", details: err });
  }
};

export const createTreatment = async (req: Request, res: Response) => {
  try {
    const treatment = await Treatment.create(req.body);
    res.status(201).json(treatment);
  } catch (err) {
    res.status(400).json({ error: "Failed to create treatment", details: err });
  }
};

export const updateTreatment = async (req: Request, res: Response) => {
  try {
    const treatment = await Treatment.findByPk(req.params.id);
    if (!treatment) return res.status(404).json({ error: "Treatment not found" });
    
    await treatment.update(req.body);
    res.json(treatment);
  } catch (err) {
    res.status(400).json({ error: "Update failed", details: err });
  }
};

export const deleteTreatment = async (req: Request, res: Response) => {
  try {
    const treatment = await Treatment.findByPk(req.params.id);
    if (!treatment) return res.status(404).json({ error: "Treatment not found" });
    
    await treatment.destroy();
    res.json({ message: "Treatment deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: "Deletion failed", details: err });
  }
};
