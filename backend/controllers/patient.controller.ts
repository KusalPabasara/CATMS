import { Request, Response } from "express";
import Patient from "../models/patient.model";
import { sendEmail, emailTemplates } from "../services/email.service";
import { sendSMS, smsTemplates } from "../services/sms.service";
import { logAuditWithRequest, auditActions } from "../services/audit.service";

export const getAllPatients = async (_req: Request, res: Response) => {
  try {
    const patients = await Patient.findAll({
      where: { active: true },
      order: [['created_at', 'DESC']]
    });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch patients", details: err });
  }
};

export const getPatientById = async (req: Request, res: Response) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch patient", details: err });
  }
};

import bcrypt from 'bcrypt';
import { generateRandomPassword } from '../utils/password.util';

export const createPatient = async (req: Request, res: Response) => {
  try {
    // Generate a random initial password for the patient
    const initialPassword = generateRandomPassword();
    const password_hash = await bcrypt.hash(initialPassword, 10);

    // Split full name into first and last name
    const fullName = req.body.full_name || '';
    const nameParts = fullName.split(' ');
    const first_name = nameParts[0] || '';
    const last_name = nameParts.slice(1).join(' ') || '';

    // Create patient with password hash
    const patient = await Patient.create({
      ...req.body,
      first_name,
      last_name,
      password_hash,
      email: req.body.email?.toLowerCase(),
      national_id: req.body.national_id?.trim()
    });
    
    // Log audit trail
    await logAuditWithRequest(
      req,
      auditActions.PATIENT_CREATED,
      'patients',
      (patient as any).patient_id,
      `Created patient: ${(patient as any).full_name}`
    );
    
    // Send welcome notifications
    try {
      // Send welcome email with credentials
      if ((patient as any).email) {
        const emailTemplate = emailTemplates.welcomeWithCredentials(
          (patient as any).full_name,
          (patient as any).email,
          initialPassword
        );
        await sendEmail(
          (patient as any).email,
          emailTemplate.subject,
          emailTemplate.html
        );
      }

      // Send welcome SMS (optional)
      if ((patient as any).phone) {
        const smsMessage = smsTemplates.welcome((patient as any).full_name);
        await sendSMS((patient as any).phone, smsMessage);
      }
    } catch (notificationError) {
      console.error("❌ Welcome notification failed:", notificationError);
      // Don't fail the patient creation if notifications fail
    }

    res.status(201).json(patient);
  } catch (err) {
    res.status(400).json({ error: "Creation failed", details: err });
  }
};

export const updatePatient = async (req: Request, res: Response) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });

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
