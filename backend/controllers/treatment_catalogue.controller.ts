import { Request, Response } from "express";
import TreatmentCatalogue from "../models/treatment_catalogue.model";

const formatSequelizeError = (err: any) => {
  if (err?.errors?.length) return err.errors.map((e: any) => e.message).join("; ");
  return err?.message || "Unknown error";
};

export const getAllCatalogue = async (_req: Request, res: Response) => {
  try {
    const rows = await TreatmentCatalogue.findAll({
      order: [["treatment_name", "ASC"]],
    });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch catalogue", details: formatSequelizeError(err) });
  }
};

export const getCatalogueById = async (req: Request, res: Response) => {
  try {
    const row = await TreatmentCatalogue.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "Treatment type not found" });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch treatment type", details: formatSequelizeError(err) });
  }
};

export const createCatalogueItem = async (req: Request, res: Response) => {
  try {
    const {
      treatment_name,
      description,
      icd10_code,
      cpt_code,
      standard_cost,
      category,
      is_active,
    } = req.body || {};

    if (!treatment_name || !String(treatment_name).trim()) {
      return res.status(400).json({ error: "treatment_name is required" });
    }

    let costNum: number | null = null;
    if (standard_cost !== undefined && standard_cost !== null && String(standard_cost).trim() !== "") {
      costNum = Number(standard_cost);
      if (Number.isNaN(costNum) || costNum < 0) {
        return res.status(400).json({ error: "standard_cost must be a non-negative number" });
      }
    }

    const payload = {
      treatment_name: String(treatment_name).trim(),
      description: description ? String(description).trim() : null,
      icd10_code: icd10_code ? String(icd10_code).trim() : null,
      cpt_code: cpt_code ? String(cpt_code).trim() : null,
      standard_cost: costNum,
      category: category ? String(category).trim() : null,
      is_active: typeof is_active === "boolean" ? is_active : true,
    };

    const created = await TreatmentCatalogue.create(payload as any);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: "Failed to create treatment type", details: formatSequelizeError(err) });
  }
};

export const updateCatalogueItem = async (req: Request, res: Response) => {
  try {
    const row = await TreatmentCatalogue.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "Treatment type not found" });

    const {
      treatment_name,
      description,
      icd10_code,
      cpt_code,
      standard_cost,
      category,
      is_active,
    } = req.body || {};

    const updates: any = {};

    if (treatment_name !== undefined) {
      if (!treatment_name || !String(treatment_name).trim()) {
        return res.status(400).json({ error: "treatment_name is required" });
      }
      updates.treatment_name = String(treatment_name).trim();
    }

    if (description !== undefined) {
      updates.description = description ? String(description).trim() : null;
    }
    if (icd10_code !== undefined) {
      updates.icd10_code = icd10_code ? String(icd10_code).trim() : null;
    }
    if (cpt_code !== undefined) {
      updates.cpt_code = cpt_code ? String(cpt_code).trim() : null;
    }
    if (standard_cost !== undefined) {
      if (standard_cost === null || String(standard_cost).trim() === "") {
        updates.standard_cost = null;
      } else {
        const costNum = Number(standard_cost);
        if (Number.isNaN(costNum) || costNum < 0) {
          return res.status(400).json({ error: "standard_cost must be a non-negative number" });
        }
        updates.standard_cost = costNum;
      }
    }
    if (category !== undefined) {
      updates.category = category ? String(category).trim() : null;
    }
    if (is_active !== undefined) {
      updates.is_active = Boolean(is_active);
    }

    await row.update(updates);
    res.json(row);
  } catch (err) {
    res.status(400).json({ error: "Failed to update treatment type", details: formatSequelizeError(err) });
  }
};

export const deleteCatalogueItem = async (req: Request, res: Response) => {
  try {
    const row = await TreatmentCatalogue.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: "Treatment type not found" });

    // soft deactivate by convention
    await row.update({ is_active: false });
    res.json({ message: "Treatment type deactivated successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to deactivate treatment type", details: formatSequelizeError(err) });
  }
};