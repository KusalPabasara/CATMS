import { Request, Response } from "express";
import Patient from "../models/patient.model";
import { sendEmail, emailTemplates } from "../services/email.service";
import { sendSMS, smsTemplates } from "../services/sms.service";
import { logAuditWithRequest, auditActions } from "../services/audit.service";

export const getAllPatients = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    const { role, branch_id } = currentUser;

    let whereClause: any = { active: true };

    // Apply branch-based filtering based on user role
    if (role === 'System Administrator') {
      // System Administrator can see all patients
      // No additional filtering needed
    } else {
      // For now, all users can see all patients since there's no branch field
      // This can be enhanced later when branch functionality is added
    }

    const patients = await Patient.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']]
    });
    res.json(patients);
  } catch (err) {
    console.error("Error fetching patients:", err);
    res.status(500).json({ error: "Failed to fetch patients", details: err });
  }
};

export const getPatientById = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    const { role, branch_id } = currentUser;

    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    // For now, all users can access all patients since there's no branch field
    // This can be enhanced later when branch functionality is added

    res.json(patient);
  } catch (err) {
    console.error("Error fetching patient:", err);
    res.status(500).json({ error: "Failed to fetch patient", details: err });
  }
};

import bcrypt from 'bcrypt';
import { generateRandomPassword } from '../utils/password.util';

export const createPatient = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    const { role, branch_id } = currentUser;

    // Create patient with basic information
    const patient = await Patient.create({
      ...req.body,
      email: req.body.email?.toLowerCase(),
      national_id: req.body.national_id?.trim(),
    });
    
    // Log audit trail
    await logAuditWithRequest(
      req,
      auditActions.PATIENT_CREATED,
      'patients',
      (patient as any).patient_id,
      `Created patient: ${(patient as any).full_name}`
    );

    res.status(201).json(patient);
  } catch (err) {
    console.error("Error creating patient:", err);
    res.status(400).json({ error: "Creation failed", details: err });
  }
};

export const updatePatient = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    const { role, branch_id } = currentUser;

    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    // For now, all users can access all patients since there's no branch field
    // This can be enhanced later when branch functionality is added

    // For now, all users can update patients since there's no branch field
    // This can be enhanced later when branch functionality is added

    await patient.update(req.body);
    
    // Log audit trail
    await logAuditWithRequest(
      req,
      auditActions.PATIENT_UPDATED,
      'patients',
      (patient as any).patient_id,
      `Updated patient: ${(patient as any).full_name}`
    );
    
    res.json(patient);
  } catch (err) {
    console.error("Error updating patient:", err);
    res.status(400).json({ error: "Update failed", details: err });
  }
};

export const deletePatient = async (req: Request, res: Response) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    await patient.update({ active: false });
    
    // Log audit trail
    await logAuditWithRequest(
      req,
      auditActions.PATIENT_ARCHIVED,
      'patients',
      (patient as any).patient_id,
      `Archived patient: ${(patient as any).full_name}`
    );
    
    res.json({ message: "Patient archived successfully." });
  } catch (err) {
    res.status(500).json({ error: "Archive failed", details: err });
  }
};
