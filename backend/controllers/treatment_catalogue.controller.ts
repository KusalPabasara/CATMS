import { Request, Response } from "express";
import TreatmentCatalogue from "../models/treatment_catalogue.model";

export const getAllTreatmentCatalogues = async (_req: Request, res: Response) => {
  try {
    const treatments = await TreatmentCatalogue.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']]
    });
    res.json(treatments);
  } catch (err) {
    console.error('Error in getAllTreatmentCatalogues:', err);
    res.status(500).json({ error: "Failed to fetch treatment catalogue", details: err });
  }
};

export const getTreatmentCatalogueById = async (req: Request, res: Response) => {
  try {
    const treatment = await TreatmentCatalogue.findByPk(req.params.id);
    if (!treatment) return res.status(404).json({ error: "Treatment not found" });
    res.json(treatment);
  } catch (err) {
    console.error('Error in getTreatmentCatalogueById:', err);
    res.status(500).json({ error: "Failed to fetch treatment", details: err });
  }
};
