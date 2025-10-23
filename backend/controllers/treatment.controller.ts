import { Request, Response } from "express";
import { sequelize } from "../config/database";

export const getAllTreatments = async (_req: Request, res: Response) => {
  try {
    const treatments = await sequelize.query(`
      SELECT 
        treatment_id,
        name as treatment_name,
        description,
        cost as standard_cost,
        duration,
        category,
        icd10_code,
        cpt_code,
        is_active
      FROM treatments 
      WHERE is_active = true
      ORDER BY category, name
    `, {
      type: sequelize.QueryTypes.SELECT
    });
    res.json(treatments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch treatments", details: err });
  }
};

export const getTreatmentById = async (req: Request, res: Response) => {
  try {
    const treatments = await sequelize.query(`
      SELECT 
        treatment_id,
        name as treatment_name,
        description,
        cost as standard_cost,
        duration,
        category,
        icd10_code,
        cpt_code,
        is_active
      FROM treatments 
      WHERE treatment_id = :id AND is_active = true
    `, {
      replacements: { id: req.params.id },
      type: sequelize.QueryTypes.SELECT
    });
    
    if (treatments.length === 0) {
      return res.status(404).json({ error: "Treatment not found" });
    }
    
    res.json(treatments[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch treatment", details: err });
  }
};

export const createTreatment = async (req: Request, res: Response) => {
  try {
    const { treatment_name, description, standard_cost, duration, category, icd10_code, cpt_code } = req.body;
    
    const result = await sequelize.query(`
      INSERT INTO treatments (name, description, cost, duration, category, icd10_code, cpt_code, is_active)
      VALUES (:name, :description, :cost, :duration, :category, :icd10_code, :cpt_code, true)
    `, {
      replacements: {
        name: treatment_name,
        description,
        cost: standard_cost,
        duration,
        category,
        icd10_code,
        cpt_code
      },
      type: sequelize.QueryTypes.INSERT
    });
    
    const newTreatment = await sequelize.query(`
      SELECT 
        treatment_id,
        name as treatment_name,
        description,
        cost as standard_cost,
        duration,
        category,
        icd10_code,
        cpt_code,
        is_active
      FROM treatments 
      WHERE treatment_id = :id
    `, {
      replacements: { id: result[0] },
      type: sequelize.QueryTypes.SELECT
    });
    
    res.status(201).json(newTreatment[0]);
  } catch (err) {
    res.status(400).json({ error: "Failed to create treatment", details: err });
  }
};

export const updateTreatment = async (req: Request, res: Response) => {
  try {
    const { treatment_name, description, standard_cost, duration, category, icd10_code, cpt_code } = req.body;
    
    const result = await sequelize.query(`
      UPDATE treatments 
      SET name = :name, 
          description = :description, 
          cost = :cost, 
          duration = :duration, 
          category = :category, 
          icd10_code = :icd10_code, 
          cpt_code = :cpt_code
      WHERE treatment_id = :id
    `, {
      replacements: {
        id: req.params.id,
        name: treatment_name,
        description,
        cost: standard_cost,
        duration,
        category,
        icd10_code,
        cpt_code
      },
      type: sequelize.QueryTypes.UPDATE
    });
    
    if (result[1] === 0) {
      return res.status(404).json({ error: "Treatment not found" });
    }
    
    const updatedTreatment = await sequelize.query(`
      SELECT 
        treatment_id,
        name as treatment_name,
        description,
        cost as standard_cost,
        duration,
        category,
        icd10_code,
        cpt_code,
        is_active
      FROM treatments 
      WHERE treatment_id = :id
    `, {
      replacements: { id: req.params.id },
      type: sequelize.QueryTypes.SELECT
    });
    
    res.json(updatedTreatment[0]);
  } catch (err) {
    res.status(400).json({ error: "Update failed", details: err });
  }
};

export const deleteTreatment = async (req: Request, res: Response) => {
  try {
    const result = await sequelize.query(`
      UPDATE treatments 
      SET is_active = false
      WHERE treatment_id = :id
    `, {
      replacements: { id: req.params.id },
      type: sequelize.QueryTypes.UPDATE
    });
    
    if (result[1] === 0) {
      return res.status(404).json({ error: "Treatment not found" });
    }
    
    res.json({ message: "Treatment deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: "Deletion failed", details: err });
  }
};
