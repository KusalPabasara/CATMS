import { Request, Response } from "express";
import TreatmentSession from "../models/treatment.session.model";
import Medication from "../models/medication.model";
import TreatmentProgress from "../models/treatment.progress.model";
import Patient from "../models/patient.model";
import Treatment from "../models/treatment.model";
import User from "../models/user.model";
import { logAuditWithRequest, auditActions } from "../services/audit.service";
import { sendEmail, emailTemplates } from "../services/email.service";
import { sendSMS, smsTemplates } from "../services/sms.service";

export const getAllTreatmentSessions = async (req: Request, res: Response) => {
  try {
    const sessions = await TreatmentSession.findAll({
      include: [
        { model: Treatment },
        { model: Patient },
        { model: User, as: 'Doctor' }
      ],
      order: [['session_date', 'DESC']]
    });
    res.json(sessions);
  } catch (err) {
    console.error('Failed to fetch treatment sessions:', err);
    res.status(500).json({ error: "Failed to fetch treatment sessions", details: err });
  }
};

export const getPatientTreatmentHistory = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    
    const sessions = await TreatmentSession.findAll({
      where: { patient_id: patientId },
      include: [
        { model: Treatment },
        { model: User, as: 'Doctor' },
        { model: Medication },
        { model: TreatmentProgress }
      ],
      order: [['session_date', 'DESC']]
    });

    res.json(sessions);
  } catch (err) {
    console.error('Failed to fetch patient treatment history:', err);
    res.status(500).json({ error: "Failed to fetch treatment history", details: err });
  }
};

export const createTreatmentSession = async (req: Request, res: Response) => {
  try {
    const {
      treatment_id,
      patient_id,
      doctor_id,
      session_date,
      notes,
      symptoms,
      vital_signs,
      medications,
      progress
    } = req.body;

    // Create treatment session
    const session = await TreatmentSession.create({
      treatment_id,
      patient_id,
      doctor_id,
      session_date: new Date(session_date),
      notes,
      symptoms,
      vital_signs: vital_signs || {},
      status: 'scheduled'
    });

    // Add medications if provided
    if (medications && medications.length > 0) {
      const medicationPromises = medications.map((med: any) => 
        Medication.create({
          ...med,
          patient_id,
          prescribed_by: doctor_id,
          session_id: session.getDataValue('session_id')
        })
      );
      await Promise.all(medicationPromises);
    }

    // Add progress record if provided
    if (progress) {
      await TreatmentProgress.create({
        ...progress,
        patient_id,
        treatment_id,
        session_id: session.getDataValue('session_id'),
        progress_date: new Date(session_date)
      });
    }

    // Get patient and treatment details for notification
    const [patient, treatment] = await Promise.all([
      Patient.findByPk(patient_id),
      Treatment.findByPk(treatment_id)
    ]);

    // Send email notification
    if (patient?.email) {
      const emailTemplate = (emailTemplates as any).treatmentSessionScheduled(
        patient.getDataValue('full_name'),
        new Date(session_date),
        'treatment'
      );
      await sendEmail(
        patient.getDataValue('email'),
        emailTemplate.subject,
        emailTemplate.html
      );
    }

    // Send SMS notification
    if (patient?.phone) {
      const smsText = smsTemplates.treatmentSessionScheduled(
        patient.getDataValue('full_name'),
        new Date(session_date).toLocaleString(),
        'treatment'
      );
      await sendSMS(patient.getDataValue('phone'), smsText);
    }

    // Log audit trail
    await logAuditWithRequest(
      req,
      auditActions.TREATMENT_SESSION_CREATED,
      'treatment_sessions',
      session.getDataValue('session_id'),
      `Created treatment session for patient ${patient?.getDataValue('full_name')}`
    );

    res.status(201).json({
      session,
      message: 'Treatment session created successfully. Notification sent to patient.'
    });
  } catch (err) {
    console.error('Failed to create treatment session:', err);
    res.status(400).json({ error: "Failed to create treatment session", details: err });
  }
};