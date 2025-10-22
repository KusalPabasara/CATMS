import { Request, Response } from "express";
import Appointment from "../models/appointment.model";
import Patient from "../models/patient.model";
import User from "../models/user.model";
import Branch from "../models/branch.model";
import { logAuditWithRequest, auditActions } from "../services/audit.service";
import { sendEmail } from "../services/email.service";

export const createEmergencyWalkIn = async (req: Request, res: Response) => {
  try {
    const { patient_id, doctor_id, branch_id, reason, emergency_type, priority_level } = req.body;
    const created_by = (req as any).user?.user_id;

    // Validate required fields
    if (!patient_id || !doctor_id || !branch_id || !reason) {
      return res.status(400).json({ error: "Missing required fields for emergency walk-in" });
    }

    // Check if patient exists
    const patient = await User.findByPk(patient_id);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Check if doctor exists and is available
    const doctor = await User.findByPk(doctor_id);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // Check if branch exists
    const branch = await Branch.findByPk(branch_id);
    if (!branch) {
      return res.status(404).json({ error: "Branch not found" });
    }

    // Create emergency appointment
    const emergencyAppointment = await Appointment.create({
      patient_id,
      doctor_id,
      branch_id,
      appointment_date: new Date(), // Current time for emergency
      status: 'Emergency',
      is_walkin: true,
      reason: reason,
      created_by,
      approved_by: created_by, // Auto-approve emergency appointments
      approved_at: new Date()
    });

    // Log audit trail
    await logAuditWithRequest(req, auditActions.CREATE, 'Appointment', emergencyAppointment.appointment_id, 
      `Emergency walk-in created: patient_id=${patient_id}, doctor_id=${doctor_id}, branch_id=${branch_id}, emergency_type=${emergency_type}, priority_level=${priority_level}`);

    // Send notification to doctor
    try {
      await sendEmail(
        doctor.email,
        'Emergency Walk-in Patient - MedSync Clinic',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">🚨 Emergency Walk-in Appointment</h2>
            <p>Dear Dr. ${doctor.full_name},</p>
            <p>A new emergency walk-in appointment has been scheduled:</p>
            <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Patient:</strong> ${patient.full_name}</p>
              <p><strong>Emergency Type:</strong> ${emergency_type || 'General Emergency'}</p>
              <p><strong>Priority Level:</strong> ${priority_level || 'Medium'}</p>
              <p><strong>Branch:</strong> ${branch.name}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p>Please prepare for immediate patient care.</p>
            <br>
            <p>Best regards,</p>
            <p>The MedSync Team</p>
          </div>
        `
      );
    } catch (emailError) {
      console.error('Failed to send emergency notification email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Emergency walk-in appointment created successfully',
      appointment: emergencyAppointment
    });

  } catch (error) {
    console.error('Error creating emergency walk-in:', error);
    res.status(500).json({ error: 'Failed to create emergency walk-in appointment' });
  }
};

export const getEmergencyAppointments = async (req: Request, res: Response) => {
  try {
    const { branch_id: userBranchId } = req.user as any;
    const { status = 'Emergency', limit = 50 } = req.query;

    // Build branch condition
    const branchCondition = userBranchId ? { branch_id: userBranchId } : {};

    const emergencyAppointments = await Appointment.findAll({
      where: {
        ...branchCondition,
        status: status as string,
        is_walkin: true
      },
      order: [['appointment_date', 'DESC']],
      limit: parseInt(limit as string)
    });

    res.json({
      success: true,
      data: emergencyAppointments,
      count: emergencyAppointments.length
    });

  } catch (error) {
    console.error('Error fetching emergency appointments:', error);
    res.status(500).json({ error: 'Failed to fetch emergency appointments' });
  }
};

export const updateEmergencyAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const { appointmentId } = req.params;
    const { status, notes } = req.body;
    const updated_by = (req as any).user?.user_id;

    // Validate status
    const validStatuses = ['Emergency', 'Completed', 'Cancelled', 'No-Show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status for emergency appointment' });
    }

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Emergency appointment not found' });
    }

    if (appointment.status !== 'Emergency') {
      return res.status(400).json({ error: 'This is not an emergency appointment' });
    }

    // Update appointment status
    const updatedAppointment = await appointment.update({
      status: status as any,
      reason: notes ? `${appointment.reason}\n\nStatus Update: ${notes}` : appointment.reason
    });

    // Log audit trail
    await logAuditWithRequest(req, auditActions.UPDATE, 'Appointment', parseInt(appointmentId), 
      `Emergency appointment status updated: old_status=${appointment.status}, new_status=${status}, notes=${notes || 'none'}, updated_by=${updated_by}`);

    res.json({
      success: true,
      message: 'Emergency appointment status updated successfully',
      appointment: updatedAppointment
    });

  } catch (error) {
    console.error('Error updating emergency appointment status:', error);
    res.status(500).json({ error: 'Failed to update emergency appointment status' });
  }
};

export const getAllAppointments = async (req: Request, res: Response) => {
  try {
    const requesterRole = (req as any).user?.role as string | undefined;
    const where: any = {};
    if (requesterRole === 'Doctor') {
      where.status = 'Approved';
      where.doctor_id = (req as any).user?.user_id || undefined;
    }
    const appointments = await Appointment.findAll({
      where,
      order: [[
        'appointment_date', 'ASC'
      ]]
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

import { sendSMS, smsTemplates } from "../services/sms.service";
import { scheduleReminder } from "../jobs/reminder.job";
import { isWorkingHour, hasConflictingAppointment } from "../utils/appointment.util";

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { patient_id, doctor_id, branch_id, appointment_date, reason, created_by_role } = req.body;

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

    // Status logic
    const isStaffCreator = created_by_role && ['Receptionist', 'System Administrator', 'Branch Manager'].includes(created_by_role);
    const initialStatus = isStaffCreator ? 'Approved' : 'Pending';

    // Create appointment
    const appointment = await Appointment.create({
      patient_id,
      doctor_id,
      branch_id,
      appointment_date: appointmentTime,
      reason,
      status: initialStatus as any,
      approved_by: isStaffCreator ? (req as any).user?.user_id || null : null,
      approved_at: isStaffCreator ? new Date() : null,
      created_by: (req as any).user?.user_id || null
    });

    // Fetch patient and doctor details for notifications
    const [patient, doctor, branch] = await Promise.all([
      Patient.findByPk(patient_id),
      User.findByPk(doctor_id),
      Branch.findByPk(branch_id)
    ]);

    // Send confirmation email based on status
    if (patient?.email && initialStatus === 'Approved') {
      await sendEmail(
        patient.getDataValue('email'),
        'Appointment Confirmed - MedSync Clinic',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">Appointment Confirmed</h2>
            <p>Dear ${patient.getDataValue('full_name')},</p>
            <p>Your appointment has been confirmed:</p>
            <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Doctor:</strong> ${doctor?.getDataValue('full_name') || 'your doctor'}</p>
              <p><strong>Branch:</strong> ${branch?.getDataValue('name') || 'our clinic'}</p>
              <p><strong>Date & Time:</strong> ${appointmentTime}</p>
              <p><strong>Reason:</strong> ${reason || 'consultation'}</p>
            </div>
            <p>Please arrive 15 minutes early for your appointment.</p>
            <br>
            <p>Best regards,</p>
            <p>The MedSync Team</p>
          </div>
        `
      );
    }
    // For Pending requests, skip email unless a template exists in the future

    // Send SMS confirmation
    if (patient?.phone && initialStatus === 'Approved') {
      const smsText = smsTemplates.appointmentConfirmation(
        patient.getDataValue('full_name'),
        appointmentTime.toISOString(),
        doctor?.getDataValue('full_name') || 'your doctor',
        branch?.getDataValue('name') || 'our clinic',
        reason || 'consultation'
      );
      await sendSMS(patient.getDataValue('phone'), smsText);
    }

    // Schedule reminder only when approved
    if (initialStatus === 'Approved') {
      await scheduleReminder(appointment.getDataValue('appointment_id'));
    }
    
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
      message: initialStatus === 'Approved'
        ? 'Appointment created and approved.'
        : 'Appointment request submitted and awaiting approval.'
    });
  } catch (err) {
    console.error('Failed to create appointment:', err);
    res.status(400).json({ error: "Failed to create appointment", details: err });
  }
};

// Patient self-service booking: always creates a Pending request tied to the authenticated patient
export const createAppointmentAsPatient = async (req: Request, res: Response) => {
  try {
    const patientId = (req as any).user?.patient_id;
    if (!patientId) {
      return res.status(401).json({ error: "Unauthorized: no patient in token" });
    }

    const { doctor_id, branch_id, appointment_date, reason } = req.body;
    if (!doctor_id || !appointment_date) {
      return res.status(400).json({ error: "Missing required fields: doctor_id and appointment_date are required" });
    }

    const appointmentTime = new Date(appointment_date);
    if (appointmentTime < new Date()) {
      return res.status(400).json({ error: "Appointment date must be in the future" });
    }
    if (!isWorkingHour(appointmentTime)) {
      return res.status(400).json({ error: "Appointment must be during working hours" });
    }
    const conflict = await hasConflictingAppointment(doctor_id, appointmentTime);
    if (conflict) {
      return res.status(400).json({ error: "Doctor is not available at this time" });
    }

    const appointment = await Appointment.create({
      patient_id: patientId,
      doctor_id,
      branch_id: branch_id || null,
      appointment_date: appointmentTime,
      reason,
      status: 'Pending' as any,
      created_by: (req as any).user?.user_id || null
    });

    // Audit
    await logAuditWithRequest(
      req,
      auditActions.APPOINTMENT_CREATED,
      'appointments',
      appointment.getDataValue('appointment_id'),
      `Patient created appointment request with doctor ${doctor_id}`
    );

    return res.status(201).json({
      appointment,
      message: 'Appointment request submitted and awaiting approval.'
    });
  } catch (err) {
    console.error('Failed to create patient appointment:', err);
    return res.status(400).json({ error: "Failed to create appointment", details: err });
  }
};

export const approveAppointment = async (req: Request, res: Response) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    await appointment.update({
      status: 'Approved' as any,
      approved_by: (req as any).user?.user_id || null,
      approved_at: new Date(),
      rejection_reason: null
    });

    // Audit
    await logAuditWithRequest(
      req,
      auditActions.APPOINTMENT_UPDATED,
      'appointments',
      (appointment as any).appointment_id,
      `Approved appointment ID: ${(appointment as any).appointment_id}`
    );

    // Notify patient on approval (best-effort)
    try {
      const patient = await Patient.findByPk(appointment.getDataValue('patient_id'));
      const doctor = await User.findByPk(appointment.getDataValue('doctor_id'));
      const branch = await Branch.findByPk(appointment.getDataValue('branch_id'));
      const when = appointment.getDataValue('appointment_date');
      if (patient?.email) {
        await sendEmail(
          patient.getDataValue('email'),
          'Appointment Approved - MedSync Clinic',
          `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #059669;">Appointment Approved</h2>
              <p>Dear ${patient.getDataValue('full_name')},</p>
              <p>Your appointment has been approved:</p>
              <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>Doctor:</strong> ${doctor?.getDataValue('full_name') || 'your doctor'}</p>
                <p><strong>Branch:</strong> ${branch?.getDataValue('name') || 'our clinic'}</p>
                <p><strong>Date & Time:</strong> ${when}</p>
                <p><strong>Reason:</strong> ${appointment.getDataValue('reason') || 'consultation'}</p>
              </div>
              <p>Please arrive 15 minutes early for your appointment.</p>
              <br>
              <p>Best regards,</p>
              <p>The MedSync Team</p>
            </div>
          `
        );
      }
      if (patient?.phone) {
        const smsText = `Your appointment with Dr. ${doctor?.getDataValue('full_name') || 'your doctor'} at ${branch?.getDataValue('name') || 'our clinic'} on ${(when as Date).toLocaleString()} has been approved. Reason: ${appointment.getDataValue('reason') || 'consultation'}`;
        await sendSMS(patient.getDataValue('phone'), smsText);
      }
    } catch {}

    res.json({ message: 'Appointment approved', appointment });
  } catch (err) {
    res.status(400).json({ error: 'Approval failed', details: err });
  }
};

export const rejectAppointment = async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    await appointment.update({
      status: 'Rejected' as any,
      approved_by: null,
      approved_at: null,
      rejection_reason: reason || 'Not specified'
    });

    // Audit
    await logAuditWithRequest(
      req,
      auditActions.APPOINTMENT_UPDATED,
      'appointments',
      (appointment as any).appointment_id,
      `Rejected appointment ID: ${(appointment as any).appointment_id}`
    );

    res.json({ message: 'Appointment rejected', appointment });
  } catch (err) {
    res.status(400).json({ error: 'Rejection failed', details: err });
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
    const newStatus = req.body.status as string | undefined;

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
    
    // Handle approval transitions
    if (newStatus === 'Approved') {
      (otherUpdates as any).approved_by = (req as any).user?.user_id || null;
      (otherUpdates as any).approved_at = new Date();
    }
    if (newStatus === 'Rejected') {
      (otherUpdates as any).approved_by = null;
      (otherUpdates as any).approved_at = null;
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

// ===== PHASE 4: APPOINTMENT RESCHEDULING =====

export const rescheduleAppointment = async (req: Request, res: Response) => {
  try {
    const { appointmentId } = req.params;
    const { new_appointment_date, reason, notify_patient = true } = req.body;
    const rescheduled_by = (req as any).user?.user_id;

    // Validate required fields
    if (!new_appointment_date) {
      return res.status(400).json({ error: 'New appointment date is required' });
    }

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check if appointment can be rescheduled
    if (appointment.status === 'Completed' || appointment.status === 'Cancelled') {
      return res.status(400).json({ error: 'Cannot reschedule completed or cancelled appointments' });
    }

    // Check for conflicts with new date
    const newDate = new Date(new_appointment_date);
    const hasConflict = await hasConflictingAppointment(
      appointment.doctor_id!,
      newDate
    );

    if (hasConflict) {
      return res.status(400).json({ error: 'Doctor has a conflicting appointment at the new time' });
    }

    // Check if new date is within working hours
    if (!isWorkingHour(newDate)) {
      return res.status(400).json({ error: 'New appointment time is outside working hours' });
    }

    const oldDate = appointment.appointment_date;
    const oldReason = appointment.reason;

    // Update appointment
    const updatedAppointment = await appointment.update({
      appointment_date: newDate,
      reason: reason ? `${oldReason}\n\nRescheduled: ${reason}` : oldReason,
      status: 'Scheduled' // Reset to scheduled status
    });

    // Log audit trail
    await logAuditWithRequest(req, auditActions.UPDATE, 'Appointment', parseInt(appointmentId), 
      `Appointment rescheduled: old_date=${oldDate?.toISOString()}, new_date=${newDate.toISOString()}, reason=${reason || 'none'}, rescheduled_by=${rescheduled_by}`);

    // Notify patient if requested
    if (notify_patient) {
      try {
        const patient = await User.findByPk(appointment.patient_id!);
        const doctor = await User.findByPk(appointment.doctor_id!);
        const branch = await Branch.findByPk(appointment.branch_id!);

        if (patient?.email) {
          await sendEmail(
            patient.email,
            'Appointment Rescheduled - MedSync Clinic',
            `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #059669;">Appointment Rescheduled</h2>
                <p>Dear ${patient.full_name},</p>
                <p>Your appointment has been rescheduled:</p>
                <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 15px 0;">
                  <p><strong>Doctor:</strong> ${doctor?.full_name || 'your doctor'}</p>
                  <p><strong>Branch:</strong> ${branch?.name || 'our clinic'}</p>
                  <p><strong>Previous Date:</strong> ${oldDate?.toLocaleString()}</p>
                  <p><strong>New Date:</strong> ${newDate.toLocaleString()}</p>
                  <p><strong>Reason:</strong> ${reason || 'No reason provided'}</p>
                </div>
                <p>Please make note of the new appointment time.</p>
                <br>
                <p>Best regards,</p>
                <p>The MedSync Team</p>
              </div>
            `
          );
        }

        if (patient?.phone) {
          const smsText = `Your appointment has been rescheduled to ${newDate.toLocaleString()} with Dr. ${doctor?.full_name || 'your doctor'}. Please make note of the new time.`;
          await sendSMS(patient.phone, smsText);
        }
      } catch (notificationError) {
        console.error('Failed to send rescheduling notification:', notificationError);
        // Don't fail the rescheduling if notification fails
      }
    }

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      appointment: updatedAppointment,
      old_date: oldDate,
      new_date: newDate
    });

  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    res.status(500).json({ error: 'Failed to reschedule appointment' });
  }
};

export const getRescheduleHistory = async (req: Request, res: Response) => {
  try {
    const { appointmentId } = req.params;

    // Get audit logs for rescheduling events
    const AuditLog = require('../models/audit_log.model').default;
    
    const rescheduleHistory = await AuditLog.findAll({
      where: {
        table_name: 'Appointment',
        record_id: appointmentId,
        action: 'UPDATE',
        details: {
          [require('sequelize').Op.like]: '%rescheduled%'
        }
      },
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['user_id', 'full_name', 'email']
        }
      ]
    });

    res.json({
      success: true,
      data: rescheduleHistory
    });

  } catch (error) {
    console.error('Error fetching reschedule history:', error);
    res.status(500).json({ error: 'Failed to fetch reschedule history' });
  }
};

export const bulkRescheduleAppointments = async (req: Request, res: Response) => {
  try {
    const { appointment_ids, new_appointment_date, reason } = req.body;
    const rescheduled_by = (req as any).user?.user_id;

    if (!appointment_ids || !Array.isArray(appointment_ids) || appointment_ids.length === 0) {
      return res.status(400).json({ error: 'Appointment IDs array is required' });
    }

    if (!new_appointment_date) {
      return res.status(400).json({ error: 'New appointment date is required' });
    }

    const results = [];
    const errors = [];

    for (const appointmentId of appointment_ids) {
      try {
        const appointment = await Appointment.findByPk(appointmentId);
        if (!appointment) {
          errors.push({ appointmentId, error: 'Appointment not found' });
          continue;
        }

        // Check if appointment can be rescheduled
        if (appointment.status === 'Completed' || appointment.status === 'Cancelled') {
          errors.push({ appointmentId, error: 'Cannot reschedule completed or cancelled appointment' });
          continue;
        }

        // Check for conflicts
        const newDate = new Date(new_appointment_date);
        const hasConflict = await hasConflictingAppointment(
          appointment.doctor_id!,
          newDate
        );

        if (hasConflict) {
          errors.push({ appointmentId, error: 'Doctor has conflicting appointment' });
          continue;
        }

        // Update appointment
        const updatedAppointment = await appointment.update({
          appointment_date: newDate,
          reason: reason ? `${appointment.reason}\n\nBulk Rescheduled: ${reason}` : appointment.reason,
          status: 'Scheduled'
        });

        // Log audit trail
        await logAuditWithRequest(req, auditActions.UPDATE, 'Appointment', appointmentId, 
          `Bulk appointment rescheduled: old_date=${appointment.appointment_date?.toISOString()}, new_date=${newDate.toISOString()}, reason=${reason || 'none'}, rescheduled_by=${rescheduled_by}`);

        results.push({
          appointmentId,
          success: true,
          appointment: updatedAppointment
        });

      } catch (error) {
        errors.push({ appointmentId, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Processed ${appointment_ids.length} appointments`,
      results,
      errors,
      summary: {
        total: appointment_ids.length,
        successful: results.length,
        failed: errors.length
      }
    });

  } catch (error) {
    console.error('Error in bulk rescheduling:', error);
    res.status(500).json({ error: 'Failed to bulk reschedule appointments' });
  }
};
