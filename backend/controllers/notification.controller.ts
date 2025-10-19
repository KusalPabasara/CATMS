import { Request, Response } from "express";
import { sendEmail, emailTemplates } from "../services/email.service";
import { sendSMS, smsTemplates } from "../services/sms.service";
import Patient from "../models/patient.model";
import Appointment from "../models/appointment.model";
import Invoice from "../models/invoice.model";
import User from "../models/user.model";

// Type definitions for better TypeScript support
interface AppointmentWithAssociations extends Appointment {
  Patient?: Patient;
  Doctor?: User;
}

interface InvoiceWithAssociations extends Invoice {
  Patient?: Patient;
}

export const sendAppointmentReminder = async (req: Request, res: Response) => {
  try {
    const { appointmentId } = req.params;
    
    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        { model: Patient, as: 'Patient' },
        { model: User, as: 'Doctor' }
      ]
    }) as AppointmentWithAssociations | null;

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    const appointmentTime = new Date((appointment as any).appointment_date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const appointmentDate = new Date((appointment as any).appointment_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const results = [];

    // Send email
    if ((appointment.Patient as any)?.email) {
      const emailTemplate = emailTemplates.appointmentReminder(
        (appointment.Patient as any).full_name,
        appointmentDate + ' at ' + appointmentTime,
        (appointment.Doctor as any)?.full_name || 'Doctor'
      );

      const emailResult = await sendEmail(
        (appointment.Patient as any).email,
        emailTemplate.subject,
        emailTemplate.html
      );
      results.push({ type: 'email', ...emailResult });
    }

    // Send SMS
    if ((appointment.Patient as any)?.phone) {
      const smsMessage = smsTemplates.appointmentReminder(
        (appointment.Patient as any).full_name,
        appointmentTime,
        (appointment.Doctor as any)?.full_name || 'Doctor'
      );

      const smsResult = await sendSMS((appointment.Patient as any).phone, smsMessage);
      results.push({ type: 'sms', ...smsResult });
    }

    res.json({ 
      message: "Appointment reminders sent", 
      results 
    });
  } catch (error) {
    console.error("❌ Error sending appointment reminder:", error);
    res.status(500).json({ error: "Failed to send appointment reminder" });
  }
};

export const sendPaymentReminder = async (req: Request, res: Response) => {
  try {
    const { invoiceId } = req.params;
    
    const invoice = await Invoice.findByPk(invoiceId, {
      include: [{ model: Patient, as: 'Patient' }]
    }) as InvoiceWithAssociations | null;

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const dueDate = new Date((invoice as any).due_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const results = [];

    // Send email
    if ((invoice.Patient as any)?.email) {
      const emailTemplate = emailTemplates.paymentReminder(
        (invoice.Patient as any).full_name,
        (invoice as any).total_amount,
        dueDate
      );

      const emailResult = await sendEmail(
        (invoice.Patient as any).email,
        emailTemplate.subject,
        emailTemplate.html
      );
      results.push({ type: 'email', ...emailResult });
    }

    // Send SMS
    if ((invoice.Patient as any)?.phone) {
      const smsMessage = smsTemplates.paymentReminder(
        (invoice.Patient as any).full_name,
        (invoice as any).total_amount
      );

      const smsResult = await sendSMS((invoice.Patient as any).phone, smsMessage);
      results.push({ type: 'sms', ...smsResult });
    }

    res.json({ 
      message: "Payment reminders sent", 
      results 
    });
  } catch (error) {
    console.error("❌ Error sending payment reminder:", error);
    res.status(500).json({ error: "Failed to send payment reminder" });
  }
};

export const sendCustomNotification = async (req: Request, res: Response) => {
  try {
    const { patientId, type, message, subject } = req.body;

    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const results = [];

    // Send email
    if ((patient as any).email && type !== 'sms_only') {
      const emailResult = await sendEmail(
        (patient as any).email,
        subject || 'Notification from MedSync Clinic',
        `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">MedSync Clinic Notification</h2>
          <p>Dear ${(patient as any).full_name},</p>
          <p>${message}</p>
          <br>
          <p>Best regards,</p>
          <p>The MedSync Team</p>
        </div>`
      );
      results.push({ type: 'email', ...emailResult });
    }

    // Send SMS
    if ((patient as any).phone && type !== 'email_only') {
      const smsResult = await sendSMS((patient as any).phone, message);
      results.push({ type: 'sms', ...smsResult });
    }

    res.json({ 
      message: "Custom notification sent", 
      results 
    });
  } catch (error) {
    console.error("❌ Error sending custom notification:", error);
    res.status(500).json({ error: "Failed to send custom notification" });
  }
};

export const sendBulkNotification = async (req: Request, res: Response) => {
  try {
    const { patientIds, type, message, subject } = req.body;

    const patients = await Patient.findAll({
      where: { patient_id: patientIds }
    });

    const results = [];

    for (const patient of patients) {
      try {
        // Send email
        if ((patient as any).email && type !== 'sms_only') {
          const emailResult = await sendEmail(
            (patient as any).email,
            subject || 'Notification from MedSync Clinic',
            `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">MedSync Clinic Notification</h2>
              <p>Dear ${(patient as any).full_name},</p>
              <p>${message}</p>
              <br>
              <p>Best regards,</p>
              <p>The MedSync Team</p>
            </div>`
          );
          results.push({ 
            patientId: (patient as any).patient_id, 
            patientName: (patient as any).full_name,
            type: 'email', 
            ...emailResult 
          });
        }

        // Send SMS
        if ((patient as any).phone && type !== 'email_only') {
          const smsResult = await sendSMS((patient as any).phone, message);
          results.push({ 
            patientId: (patient as any).patient_id, 
            patientName: (patient as any).full_name,
            type: 'sms', 
            ...smsResult 
          });
        }
      } catch (error) {
        console.error(`❌ Error sending notification to patient ${(patient as any).patient_id}:`, error);
        results.push({ 
          patientId: (patient as any).patient_id, 
          patientName: (patient as any).full_name,
          type: 'error', 
          error: (error as Error).message 
        });
      }
    }

    res.json({ 
      message: "Bulk notifications sent", 
      totalPatients: patients.length,
      results 
    });
  } catch (error) {
    console.error("❌ Error sending bulk notifications:", error);
    res.status(500).json({ error: "Failed to send bulk notifications" });
  }
};
