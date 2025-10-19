import { Request, Response } from "express";
import Appointment from "../models/appointment.model";
import Patient from "../models/patient.model";
import User from "../models/user.model";
import Branch from "../models/branch.model";
import { logAuditWithRequest, auditActions } from "../services/audit.service";

export const getAllAppointments = async (_req: Request, res: Response) => {
  try {
    const appointments = await Appointment.findAll({
      order: [['appointment_date', 'ASC']]
    });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch appointments", details: err });
  }
};

export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch appointment", details: err });
  }
};

import { sendEmail, emailTemplates } from "../services/email.service";
import { sendSMS, smsTemplates } from "../services/sms.service";
import { scheduleReminder } from "../jobs/reminder.job";
import { isWorkingHour, hasConflictingAppointment } from "../utils/appointment.util";

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { patient_id, doctor_id, branch_id, appointment_date, reason } = req.body;

    // Validate required fields
    if (!patient_id || !doctor_id || !branch_id || !appointment_date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate date is in the future
    const appointmentTime = new Date(appointment_date);
    if (appointmentTime < new Date()) {
      return res.status(400).json({ error: "Appointment date must be in the future" });
    }

    // Check if it's within working hours
    if (!isWorkingHour(appointmentTime)) {
      return res.status(400).json({ error: "Appointment must be during working hours" });
    }

    // Check for conflicting appointments
    const hasConflict = await hasConflictingAppointment(doctor_id, appointmentTime);
    if (hasConflict) {
      return res.status(400).json({ error: "Doctor is not available at this time" });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient_id,
      doctor_id,
      branch_id,
      appointment_date: appointmentTime,
      reason,
      status: 'Scheduled'
    });

    // Fetch patient and doctor details for notifications
    const [patient, doctor, branch] = await Promise.all([
      Patient.findByPk(patient_id),
      User.findByPk(doctor_id),
      Branch.findByPk(branch_id)
    ]);

    // Send confirmation email
    if (patient?.email) {
      const emailTemplate = (emailTemplates as any).appointmentConfirmation(
        patient.getDataValue('full_name'),
        appointmentTime,
        doctor?.getDataValue('full_name') || 'your doctor',
        branch?.getDataValue('branch_name') || 'our clinic',
        reason || 'consultation'
      );
      await sendEmail(
        patient.getDataValue('email'),
        emailTemplate.subject,
        emailTemplate.html
      );
    }

    // Send SMS confirmation
    if (patient?.phone) {
      const smsText = smsTemplates.appointmentConfirmation(
        patient.getDataValue('full_name'),
        appointmentTime.toISOString(),
        doctor?.getDataValue('full_name') || 'your doctor',
        branch?.getDataValue('branch_name') || 'our clinic',
        reason || 'consultation'
      );
      await sendSMS(patient.getDataValue('phone'), smsText);
    }

    // Schedule reminder
    await scheduleReminder(appointment.getDataValue('appointment_id'));
    
    // Log audit trail
    await logAuditWithRequest(
      req,
      auditActions.APPOINTMENT_CREATED,
      'appointments',
      appointment.getDataValue('appointment_id'),
      `Created appointment for patient ${patient?.getDataValue('full_name')} with Dr. ${doctor?.getDataValue('full_name')}`
    );
    
    res.status(201).json({
      appointment,
      message: 'Appointment created successfully. Confirmation sent to patient.'
    });
  } catch (err) {
    console.error('Failed to create appointment:', err);
    res.status(400).json({ error: "Failed to create appointment", details: err });
  }
};

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        { model: Patient },
        { model: User, as: 'Doctor' },
        { model: Branch }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    const oldStatus = appointment.getDataValue('status');
    const newStatus = req.body.status;

    // If rescheduling, validate new time
    if (req.body.appointment_date) {
      const newTime = new Date(req.body.appointment_date);
      
      // Validate future date
      if (newTime < new Date()) {
        return res.status(400).json({ error: "Appointment date must be in the future" });
      }

      // Check working hours
      if (!isWorkingHour(newTime)) {
        return res.status(400).json({ error: "Appointment must be during working hours" });
      }

      // Check conflicts
      const hasConflict = await hasConflictingAppointment(
        appointment.getDataValue('doctor_id'),
        newTime
      );
      if (hasConflict) {
        return res.status(400).json({ error: "Doctor is not available at this time" });
      }
    }
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });
    
    const { appointment_date, ...otherUpdates } = req.body;
    
    // If updating appointment date, add some validation
    if (appointment_date) {
      const newDate = new Date(appointment_date);
      const now = new Date();
      
      // Prevent scheduling in the past
      if (newDate < now) {
        return res.status(400).json({ 
          error: "Cannot schedule appointments in the past" 
        });
      }
      
      // Check if it's a weekend (0 = Sunday, 6 = Saturday)
      const dayOfWeek = newDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return res.status(400).json({ 
          error: "Cannot schedule appointments on weekends" 
        });
      }
      
      // Check if it's outside business hours (8 AM - 6 PM)
      const hour = newDate.getHours();
      if (hour < 8 || hour >= 18) {
        return res.status(400).json({ 
          error: "Appointments must be scheduled between 8 AM and 6 PM" 
        });
      }
    }
    
    // Update the appointment
    await appointment.update({ appointment_date, ...otherUpdates });
    
    // Log audit trail
    await logAuditWithRequest(
      req,
      auditActions.APPOINTMENT_UPDATED,
      'appointments',
      (appointment as any).appointment_id,
      `Updated appointment ID: ${(appointment as any).appointment_id}`
    );
    
    res.json(appointment);
  } catch (err) {
    res.status(400).json({ error: "Update failed", details: err });
  }
};

export const cancelAppointment = async (req: Request, res: Response) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });
    
    await appointment.update({ status: "Cancelled" });
    
    // Log audit trail
    await logAuditWithRequest(
      req,
      auditActions.APPOINTMENT_CANCELLED,
      'appointments',
      (appointment as any).appointment_id,
      `Cancelled appointment ID: ${(appointment as any).appointment_id}`
    );
    
    res.json({ message: "Appointment cancelled successfully." });
  } catch (err) {
    res.status(500).json({ error: "Cancellation failed", details: err });
  }
};
