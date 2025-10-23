import { Request, Response } from "express";
// Import index to ensure associations are loaded
import "../models/index";
import Appointment from "../models/appointment.model";
import User from "../models/user.model";
import Branch from "../models/branch.model";
import Patient from "../models/patient.model";
import sequelize from "../config/database";
import { logAuditWithRequest, auditActions } from "../services/audit.service";

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
      created_by
    });

    // Log audit trail
    await logAuditWithRequest(req, auditActions.CREATE, 'Appointment', emergencyAppointment.appointment_id, {
      action: 'Emergency walk-in created',
      patient_id,
      doctor_id,
      branch_id,
      emergency_type,
      priority_level
    });

    // Send notification to doctor
    try {
      await sendEmail({
        to: doctor.email,
        subject: 'Emergency Walk-in Patient',
        template: emailTemplates.EMERGENCY_WALKIN,
        data: {
          doctorName: doctor.full_name,
          patientName: patient.full_name,
          emergencyType: emergency_type || 'General Emergency',
          priorityLevel: priority_level || 'Medium',
          reason: reason,
          branchName: branch.branch_name,
          appointmentTime: new Date().toLocaleString()
        }
      });
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
    const { branch_id: userBranchId } = (req as any).user;
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
    await logAuditWithRequest(req, auditActions.UPDATE, 'Appointment', appointmentId, {
      action: 'Emergency appointment status updated',
      old_status: appointment.status,
      new_status: status,
      notes,
      updated_by
    });

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
    const currentUser = (req as any).user;
    const requesterRole = currentUser?.role as string | undefined;
    const requesterBranchId = currentUser?.branch_id;
    const requesterUserId = currentUser?.user_id;
    
    console.log('🔍 getAllAppointments - Current user:', {
      role: requesterRole,
      branch_id: requesterBranchId,
      user_id: requesterUserId,
      email: currentUser?.email
    });
    
    let where: any = {};
    
    // Apply role-based filtering
    if (requesterRole === 'Doctor') {
      // Doctors can see appointments assigned to them (both approved and pending)
      where.doctor_id = requesterUserId;
      console.log('🔍 Doctor filtering - doctor_id:', requesterUserId);
    } else if (requesterRole === 'Receptionist' || requesterRole === 'Branch Manager') {
      // Receptionists and Branch Managers can see appointments from their branch
      where.branch_id = requesterBranchId;
      console.log('🔍 Receptionist/Branch Manager filtering - branch_id:', requesterBranchId);
    } else if (requesterRole === 'System Administrator') {
      // System Administrator can see all appointments
      console.log('🔍 System Administrator - no filtering applied');
    }
    
    console.log('🔍 Final where clause:', where);
    
    // Build WHERE conditions for SQL query
    let whereConditions = [];
    let replacements: any = {};
    
    if (where.doctor_id) {
      whereConditions.push('a.doctor_id = :doctor_id');
      replacements.doctor_id = where.doctor_id;
    }
    if (where.branch_id) {
      whereConditions.push('a.branch_id = :branch_id');
      replacements.branch_id = where.branch_id;
    }
    
    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    
    const appointments = await sequelize.query(`
      SELECT 
        a.*,
        p.patient_id,
        p.full_name as patient_name,
        p.phone as patient_phone,
        p.email as patient_email,
        u.user_id as doctor_user_id,
        u.full_name as doctor_name,
        u.email as doctor_email,
        b.branch_id,
        b.name as branch_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.patient_id
      LEFT JOIN users u ON a.doctor_id = u.user_id
      LEFT JOIN branches b ON a.branch_id = b.branch_id
      ${whereClause}
      ORDER BY a.appointment_date ASC
    `, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });
    
    // Transform the result to match the expected format
    const transformedAppointments = appointments.map((apt: any) => ({
      appointment_id: apt.appointment_id,
      patient_id: apt.patient_id,
      doctor_id: apt.doctor_id,
      branch_id: apt.branch_id,
      appointment_date: apt.appointment_date,
      status: apt.status,
      approval_status: apt.approval_status,
      approved_by: apt.approved_by,
      approved_at: apt.approved_at,
      rejection_reason: apt.rejection_reason,
      is_walkin: apt.is_walkin,
      reason: apt.reason,
      created_by: apt.created_by,
      created_at: apt.created_at,
      receptionist_approved_by: apt.receptionist_approved_by,
      receptionist_approved_at: apt.receptionist_approved_at,
      doctor_approved_by: apt.doctor_approved_by,
      doctor_approved_at: apt.doctor_approved_at,
      receptionist_approval_status: apt.receptionist_approval_status,
      doctor_approval_status: apt.doctor_approval_status,
      Patient: apt.patient_name ? {
        patient_id: apt.patient_id,
        full_name: apt.patient_name,
        phone: apt.patient_phone,
        email: apt.patient_email
      } : null,
      Doctor: apt.doctor_name ? {
        user_id: apt.doctor_user_id,
        full_name: apt.doctor_name,
        email: apt.doctor_email
      } : null,
      Branch: apt.branch_name ? {
        branch_id: apt.branch_id,
        name: apt.branch_name
      } : null
    }));
    
    console.log('🔍 Found appointments:', transformedAppointments.length);
    console.log('🔍 First appointment (if any):', transformedAppointments[0] ? {
      appointment_id: transformedAppointments[0].appointment_id,
      doctor_id: transformedAppointments[0].doctor_id,
      patient_id: transformedAppointments[0].patient_id,
      status: transformedAppointments[0].status,
      patient_name: transformedAppointments[0].Patient?.full_name,
      doctor_name: transformedAppointments[0].Doctor?.full_name
    } : 'None');
    
    res.json(transformedAppointments);
  } catch (err) {
    console.error("Error fetching appointments:", err);
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

    // Status logic based on hierarchical approval system
    const currentUser = (req as any).user;
    const currentUserRole = currentUser?.role;
    
    let initialStatus: string;
    let approvedBy: number | null = null;
    let approvedAt: Date | null = null;
    
    if (currentUserRole === 'Doctor') {
      // Doctors are auto-approved (no approval needed)
      initialStatus = 'Approved';
      approvedBy = currentUser.user_id;
      approvedAt = new Date();
    } else if (['Receptionist', 'Branch Manager', 'System Administrator'].includes(currentUserRole)) {
      // Staff appointments are auto-approved
      initialStatus = 'Approved';
      approvedBy = currentUser.user_id;
      approvedAt = new Date();
    } else {
      // Patient appointments need Branch Manager approval
      initialStatus = 'Pending';
      approvedBy = null;
      approvedAt = null;
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient_id,
      doctor_id,
      branch_id,
      appointment_date: appointmentTime,
      reason,
      status: initialStatus as any,
      approved_by: approvedBy,
      approved_at: approvedAt,
      created_by: currentUser?.user_id || null
    });

    // Fetch patient and doctor details for notifications
    const [patient, doctor, branch] = await Promise.all([
      Patient.findByPk(patient_id),
      User.findByPk(doctor_id),
      Branch.findByPk(branch_id)
    ]);

    // Send confirmation email based on status
    if (patient?.email && initialStatus === 'Approved') {
      const emailTemplate = (emailTemplates as any).appointmentConfirmation(
        patient.getDataValue('full_name'),
        appointmentTime,
        doctor?.getDataValue('full_name') || 'your doctor',
        branch?.getDataValue('name') || 'our clinic',
        reason || 'consultation'
      );
      await sendEmail(
        patient.getDataValue('email'),
        emailTemplate.subject,
        emailTemplate.html
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
      status: 'Scheduled' as any,  // Use 'Scheduled' instead of 'Pending'
      approval_status: 'Pending' as any,  // Use approval_status for pending approval
      receptionist_approval_status: 'Pending' as any,
      doctor_approval_status: 'Pending' as any,
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

// Receptionist approval - first step in dual approval workflow
export const approveAppointmentByReceptionist = async (req: Request, res: Response) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    const currentUser = (req as any).user;
    const currentUserRole = currentUser?.role;
    const currentUserBranchId = currentUser?.branch_id;

    // Only Receptionists can approve at this stage
    if (currentUserRole !== 'Receptionist') {
      return res.status(403).json({ error: "Only Receptionists can perform this action" });
    }

    // Check if already approved by receptionist
    if (appointment.getDataValue('receptionist_approval_status') === 'Approved') {
      return res.status(400).json({ error: "Appointment already approved by receptionist" });
    }

    // Check if rejected by receptionist
    if (appointment.getDataValue('receptionist_approval_status') === 'Rejected') {
      return res.status(400).json({ error: "Appointment already rejected by receptionist" });
    }

    // Branch-based access control
    const appointmentBranchId = appointment.getDataValue('branch_id');
    if (appointmentBranchId !== currentUserBranchId) {
      return res.status(403).json({ 
        error: "Access denied: You can only approve appointments for your branch" 
      });
    }

    await appointment.update({
      receptionist_approval_status: 'Approved' as any,
      receptionist_approved_by: currentUser?.user_id || null,
      receptionist_approved_at: new Date()
    });

    // Check if both approvals are complete
    await checkAndUpdateFinalApprovalStatus(appointment);

    // Audit
    await logAuditWithRequest(
      req,
      auditActions.APPOINTMENT_UPDATED,
      'appointments',
      (appointment as any).appointment_id,
      `Receptionist approved appointment ID: ${(appointment as any).appointment_id}`
    );

    res.json({ 
      message: 'Appointment approved by receptionist. Waiting for doctor approval.', 
      appointment 
    });
  } catch (err) {
    res.status(400).json({ error: 'Receptionist approval failed', details: err });
  }
};

// Doctor approval - second step in dual approval workflow
export const approveAppointmentByDoctor = async (req: Request, res: Response) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    const currentUser = (req as any).user;
    const currentUserRole = currentUser?.role;

    // Only Doctors can approve at this stage
    if (currentUserRole !== 'Doctor') {
      return res.status(403).json({ error: "Only Doctors can perform this action" });
    }

    // Check if appointment is for this doctor
    const appointmentDoctorId = appointment.getDataValue('doctor_id');
    if (appointmentDoctorId !== currentUser?.user_id) {
      return res.status(403).json({ 
        error: "Access denied: You can only approve appointments assigned to you" 
      });
    }

    // Check if already approved by doctor
    if (appointment.getDataValue('doctor_approval_status') === 'Approved') {
      return res.status(400).json({ error: "Appointment already approved by doctor" });
    }

    // Check if rejected by doctor
    if (appointment.getDataValue('doctor_approval_status') === 'Rejected') {
      return res.status(400).json({ error: "Appointment already rejected by doctor" });
    }

    // Check if receptionist has approved first
    if (appointment.getDataValue('receptionist_approval_status') !== 'Approved') {
      return res.status(400).json({ 
        error: "Appointment must be approved by receptionist first" 
      });
    }

    await appointment.update({
      doctor_approval_status: 'Approved' as any,
      doctor_approved_by: currentUser?.user_id || null,
      doctor_approved_at: new Date()
    });

    // Check if both approvals are complete
    await checkAndUpdateFinalApprovalStatus(appointment);

    // Audit
    await logAuditWithRequest(
      req,
      auditActions.APPOINTMENT_UPDATED,
      'appointments',
      (appointment as any).appointment_id,
      `Doctor approved appointment ID: ${(appointment as any).appointment_id}`
    );

    // Notify patient on final approval
    try {
      const patient = await Patient.findByPk(appointment.getDataValue('patient_id'));
      const doctor = await User.findByPk(appointment.getDataValue('doctor_id'));
      const branch = await Branch.findByPk(appointment.getDataValue('branch_id'));
      const when = appointment.getDataValue('appointment_date');
      if (patient?.email) {
        const emailTemplate = (emailTemplates as any).appointmentConfirmation(
          patient.getDataValue('full_name'),
          when,
          doctor?.getDataValue('full_name') || 'your doctor',
          branch?.getDataValue('name') || 'our clinic',
          appointment.getDataValue('reason') || 'consultation'
        );
        await sendEmail(patient.getDataValue('email'), emailTemplate.subject, emailTemplate.html);
      }
      if (patient?.phone) {
        const smsText = smsTemplates.appointmentConfirmation(
          patient.getDataValue('full_name'),
          (when as Date).toISOString(),
          doctor?.getDataValue('full_name') || 'your doctor',
          branch?.getDataValue('name') || 'our clinic',
          appointment.getDataValue('reason') || 'consultation'
        );
        await sendSMS(patient.getDataValue('phone'), smsText);
      }
    } catch {}

    res.json({ 
      message: 'Appointment fully approved! Patient has been notified.', 
      appointment 
    });
  } catch (err) {
    res.status(400).json({ error: 'Doctor approval failed', details: err });
  }
};

// Helper function to check and update final approval status
const checkAndUpdateFinalApprovalStatus = async (appointment: any) => {
  const receptionistStatus = appointment.getDataValue('receptionist_approval_status');
  const doctorStatus = appointment.getDataValue('doctor_approval_status');

  if (receptionistStatus === 'Approved' && doctorStatus === 'Approved') {
    // Both approved - final approval
    await appointment.update({
      approval_status: 'Approved' as any,
      approved_by: appointment.getDataValue('doctor_approved_by'),
      approved_at: appointment.getDataValue('doctor_approved_at')
    });
  } else if (receptionistStatus === 'Rejected' || doctorStatus === 'Rejected') {
    // Either rejected - final rejection
    await appointment.update({
      approval_status: 'Rejected' as any,
      approved_by: null,
      approved_at: null
    });
  }
  // Otherwise, keep as Pending
};

// Legacy function for backward compatibility (now redirects to appropriate approval)
export const approveAppointment = async (req: Request, res: Response) => {
  const currentUser = (req as any).user;
  const currentUserRole = currentUser?.role;

  if (currentUserRole === 'Receptionist') {
    return approveAppointmentByReceptionist(req, res);
  } else if (currentUserRole === 'Doctor') {
    return approveAppointmentByDoctor(req, res);
  } else {
    return res.status(403).json({ error: "Invalid role for appointment approval" });
  }
};

export const rejectAppointment = async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    const currentUser = (req as any).user;
    const currentUserRole = currentUser?.role;
    const currentUserBranchId = currentUser?.branch_id;

    // Check if appointment is already rejected
    if (appointment.getDataValue('status') === 'Rejected') {
      return res.status(400).json({ error: "Appointment is already rejected" });
    }

    // Branch Manager can only reject appointments for their branch
    if (currentUserRole === 'Branch Manager') {
      const appointmentBranchId = appointment.getDataValue('branch_id');
      if (appointmentBranchId !== currentUserBranchId) {
        return res.status(403).json({ 
          error: "Access denied: You can only reject appointments for your branch" 
        });
      }
    }

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
      newDate,
      appointmentId
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
    await logAuditWithRequest(req, auditActions.UPDATE, 'Appointment', appointmentId, {
      action: 'Appointment rescheduled',
      old_date: oldDate,
      new_date: newDate,
      reason,
      rescheduled_by
    });

    // Notify patient if requested
    if (notify_patient) {
      try {
        const patient = await User.findByPk(appointment.patient_id!);
        const doctor = await User.findByPk(appointment.doctor_id!);
        const branch = await Branch.findByPk(appointment.branch_id!);

        if (patient?.email) {
          await sendEmail({
            to: patient.email,
            subject: 'Appointment Rescheduled',
            template: emailTemplates.APPOINTMENT_RESCHEDULED,
            data: {
              patientName: patient.full_name,
              doctorName: doctor?.full_name || 'your doctor',
              branchName: branch?.branch_name || 'our clinic',
              oldDate: oldDate?.toLocaleString(),
              newDate: newDate.toLocaleString(),
              reason: reason || 'No reason provided'
            }
          });
        }

        if (patient?.phone) {
          await sendSMS({
            to: patient.phone,
            message: smsTemplates.appointmentRescheduled(
              patient.full_name,
              newDate.toLocaleString(),
              doctor?.full_name || 'your doctor'
            )
          });
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
          newDate,
          appointmentId
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
        await logAuditWithRequest(req, auditActions.UPDATE, 'Appointment', appointmentId, {
          action: 'Bulk appointment rescheduled',
          old_date: appointment.appointment_date,
          new_date: newDate,
          reason,
          rescheduled_by
        });

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
