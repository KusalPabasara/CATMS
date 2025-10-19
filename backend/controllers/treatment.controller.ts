import { Request, Response } from "express";
import Treatments from "../models/treatments.model"; // catalogue model (plural table)

export const getAllTreatments = async (_req: Request, res: Response) => {
  try {
    const treatments = await Treatments.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']]
    });
    res.json(treatments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch treatments", details: err });
  }
};

export const getTreatmentById = async (req: Request, res: Response) => {
  try {
    const treatment = await Treatments.findByPk(req.params.id);
    if (!treatment) return res.status(404).json({ error: "Treatment not found" });
    res.json(treatment);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch treatment", details: err });
  }
};

export const createTreatment = async (req: Request, res: Response) => {
  try {
    const { name, cost } = req.body;
    if (!name || typeof cost === 'undefined' || cost === null) {
      return res.status(400).json({ error: "Name and cost are required" });
    }

    const payload = {
      name: String(name).trim(),
      description: req.body.description ?? null,
      duration: req.body.duration === '' || req.body.duration == null ? null : Number(req.body.duration),
      cost: Number(cost),
      category: req.body.category ?? null,
      icd10_code: req.body.icd10_code ?? null,
      cpt_code: req.body.cpt_code ?? null,
      is_active: typeof req.body.is_active === 'boolean' ? req.body.is_active : true,
    };

    // Quick sanity log to confirm correct table at runtime
    // console.log('Using table:', (Treatments as any).getTableName?.());

    const treatment = await Treatments.create(payload as any);
    res.status(201).json(treatment);
  } catch (err) {
    res.status(400).json({ error: "Failed to create treatment", details: err });
  }
};

export const updateTreatment = async (req: Request, res: Response) => {
  try {
    const treatment = await Treatments.findByPk(req.params.id);
    if (!treatment) return res.status(404).json({ error: "Treatment not found" });

    const { name, description, duration, cost, category, icd10_code, cpt_code, is_active } = req.body;
    const payload: any = {};
    if (typeof name !== 'undefined') payload.name = String(name).trim();
    if (typeof description !== 'undefined') payload.description = description ?? null;
    if (typeof duration !== 'undefined') payload.duration = duration === '' || duration == null ? null : Number(duration);
    if (typeof cost !== 'undefined') payload.cost = Number(cost);
    if (typeof category !== 'undefined') payload.category = category ?? null;
    if (typeof icd10_code !== 'undefined') payload.icd10_code = icd10_code ?? null;
    if (typeof cpt_code !== 'undefined') payload.cpt_code = cpt_code ?? null;
    if (typeof is_active !== 'undefined') payload.is_active = !!is_active;

    await treatment.update(payload);
    res.json(treatment);
  } catch (err) {
    res.status(400).json({ error: "Update failed", details: err });
  }
};

export const deleteTreatment = async (req: Request, res: Response) => {
  try {
    const treatment = await Treatments.findByPk(req.params.id);
    if (!treatment) return res.status(404).json({ error: "Treatment not found" });

    await treatment.update({ is_active: false }); // soft delete
    res.json({ message: "Treatment deactivated successfully." });
  } catch (err) {
    res.status(500).json({ error: "Deactivation failed", details: err });
  }
};