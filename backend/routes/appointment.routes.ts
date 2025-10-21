import { Router, Request, Response } from "express";
import {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  createAppointmentAsPatient,
  approveAppointment,
  rejectAppointment
} from "../controllers/appointment.controller";
import { authenticateToken } from "../auth/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { authenticatePatient } from "../auth/patient.auth.middleware";
import db from "../config/database";
import { QueryTypes } from "sequelize";

const router = Router();

router.use(authenticateToken); // All routes secured

// Get all appointments
router.get("/", 
  authorizeRoles("Doctor", "Receptionist", "System Administrator", "Branch Manager"), 
  getAllAppointments
);

// Get appointment by ID
router.get("/:id", 
  authorizeRoles("Doctor", "Receptionist", "System Administrator", "Branch Manager"), 
  getAppointmentById
);

// Create new appointment (admin/receptionist/branch manager)
router.post("/", 
  authorizeRoles("Receptionist", "System Administrator", "Branch Manager"), 
  createAppointment
);

// Patient self-service route using patient JWT auth
router.post("/patient", 
  authenticatePatient, 
  createAppointmentAsPatient
);

// UPDATE APPOINTMENT - Full update with datetime handling
router.put("/:id", 
  authorizeRoles("Receptionist", "System Administrator", "Branch Manager", "Doctor"),
  async (req: Request, res: Response) => {
    try {
      const { appointment_date, reason, status, doctor_id, patient_id, branch_id } = req.body;
      const appointmentId = req.params.id;
      const userRole = (req as any).user?.role;

      console.log('📝 Update appointment request:', {
        appointmentId,
        appointment_date,
        reason,
        status,
        userRole,
        timestamp: new Date().toISOString()
      });

      // Check if appointment exists
      const [existingAppointment] = await db.query(
        'SELECT * FROM appointments WHERE appointment_id = :id',
        {
          replacements: { id: appointmentId },
          type: QueryTypes.SELECT
        }
      );

      if (!existingAppointment) {
        console.log('❌ Appointment not found:', appointmentId);
        return res.status(404).json({ error: 'Appointment not found' });
      }

      console.log('📋 Existing appointment:', existingAppointment);

      // Build dynamic update query
      const updates: string[] = [];
      const replacements: any = { id: appointmentId };

      if (appointment_date) {
        updates.push('appointment_date = :appointment_date');
        // Store the datetime exactly as received (format: "2025-10-25 12:10:00")
        replacements.appointment_date = appointment_date;
        console.log('📅 Setting appointment_date to:', appointment_date);
      }
      
      if (reason !== undefined) {
        updates.push('reason = :reason');
        replacements.reason = reason;
      }
      
      if (status) {
        updates.push('status = :status');
        replacements.status = status;
      }
      
      if (doctor_id) {
        updates.push('doctor_id = :doctor_id');
        replacements.doctor_id = doctor_id;
      }
      
      if (patient_id) {
        updates.push('patient_id = :patient_id');
        replacements.patient_id = patient_id;
      }
      
      if (branch_id) {
        updates.push('branch_id = :branch_id');
        replacements.branch_id = branch_id;
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      const query = `UPDATE appointments SET ${updates.join(', ')} WHERE appointment_id = :id`;

      console.log('🔧 Executing SQL query:', query);
      console.log('🔧 Query parameters:', replacements);

      const [result] = await db.query(query, {
        replacements,
        type: QueryTypes.UPDATE
      });

      console.log('📊 Update result:', result);

      // Fetch updated appointment to verify
      const [updatedAppointment] = await db.query(
        'SELECT * FROM appointments WHERE appointment_id = :id',
        {
          replacements: { id: appointmentId },
          type: QueryTypes.SELECT
        }
      );

      console.log('✅ Updated appointment:', updatedAppointment);

      res.json({ 
        message: 'Appointment updated successfully',
        appointment_id: appointmentId,
        updated_data: updatedAppointment
      });
    } catch (error: any) {
      console.error('❌ Error updating appointment:', error);
      console.error('❌ Error stack:', error.stack);
      res.status(500).json({ 
        error: 'Failed to update appointment',
        details: error.message 
      });
    }
  }
);

// CANCEL/UPDATE STATUS - PATCH endpoint
router.patch("/:id", 
  authorizeRoles("Receptionist", "System Administrator", "Branch Manager", "Doctor"),
  async (req: Request, res: Response) => {
    try {
      const { status, rejection_reason } = req.body;
      const appointmentId = req.params.id;
      const userRole = (req as any).user?.role;
      const userId = (req as any).user?.user_id;

      console.log('🔄 Patch appointment status request:', {
        appointmentId,
        status,
        rejection_reason,
        userRole,
        userId,
        timestamp: new Date().toISOString()
      });

      // Check if appointment exists
      const [existingAppointment] = await db.query(
        'SELECT * FROM appointments WHERE appointment_id = :id',
        {
          replacements: { id: appointmentId },
          type: QueryTypes.SELECT
        }
      );

      if (!existingAppointment) {
        console.log('❌ Appointment not found:', appointmentId);
        return res.status(404).json({ error: 'Appointment not found' });
      }

      console.log('📋 Current appointment status:', (existingAppointment as any).status);

      // Default to Cancelled if no status provided
      const newStatus = status || 'Cancelled';

      // Build update query
      let query = 'UPDATE appointments SET status = :status';
      const replacements: any = { 
        status: newStatus, 
        id: appointmentId 
      };

      if (rejection_reason) {
        query += ', rejection_reason = :rejection_reason';
        replacements.rejection_reason = rejection_reason;
      }

      query += ' WHERE appointment_id = :id';

      console.log('🔧 Executing patch query:', query);
      console.log('🔧 Query parameters:', replacements);

      const [result] = await db.query(query, {
        replacements,
        type: QueryTypes.UPDATE
      });

      console.log('📊 Patch result:', result);

      // Fetch updated appointment
      const [updatedAppointment] = await db.query(
        'SELECT * FROM appointments WHERE appointment_id = :id',
        {
          replacements: { id: appointmentId },
          type: QueryTypes.SELECT
        }
      );

      console.log('✅ Appointment status updated. New status:', (updatedAppointment as any).status);

      res.json({ 
        message: `Appointment ${newStatus.toLowerCase()} successfully`,
        appointment_id: appointmentId,
        status: newStatus,
        updated_appointment: updatedAppointment
      });
    } catch (error: any) {
      console.error('❌ Error patching appointment:', error);
      console.error('❌ Error stack:', error.stack);
      res.status(500).json({ 
        error: 'Failed to update appointment status',
        details: error.message 
      });
    }
  }
);

// DELETE APPOINTMENT (Soft delete by cancelling)
router.delete("/:id", 
  authorizeRoles("Receptionist", "System Administrator", "Doctor"),
  async (req: Request, res: Response) => {
    try {
      const appointmentId = req.params.id;
      const userRole = (req as any).user?.role;
      const userId = (req as any).user?.user_id;

      console.log('🗑️ Delete appointment request:', {
        appointmentId,
        userRole,
        userId,
        timestamp: new Date().toISOString()
      });

      // Check if appointment exists
      const [existingAppointment] = await db.query(
        'SELECT * FROM appointments WHERE appointment_id = :id',
        {
          replacements: { id: appointmentId },
          type: QueryTypes.SELECT
        }
      );

      if (!existingAppointment) {
        console.log('❌ Appointment not found:', appointmentId);
        return res.status(404).json({ error: 'Appointment not found' });
      }

      // Soft delete by setting status to Cancelled
      const [result] = await db.query(
        'UPDATE appointments SET status = :status WHERE appointment_id = :id',
        {
          replacements: { status: 'Cancelled', id: appointmentId },
          type: QueryTypes.UPDATE
        }
      );

      console.log('📊 Delete result:', result);

      if (result === 0) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      console.log('✅ Appointment cancelled successfully (soft delete)');

      res.json({ 
        message: 'Appointment cancelled successfully',
        appointment_id: appointmentId
      });
    } catch (error: any) {
      console.error('❌ Error deleting appointment:', error);
      console.error('❌ Error stack:', error.stack);
      res.status(500).json({ 
        error: 'Failed to cancel appointment',
        details: error.message 
      });
    }
  }
);

// APPROVE APPOINTMENT
router.patch("/:id/approve", 
  authorizeRoles("Receptionist", "System Administrator", "Branch Manager"), 
  approveAppointment
);

// REJECT APPOINTMENT
router.patch("/:id/reject", 
  authorizeRoles("Receptionist", "System Administrator", "Branch Manager"), 
  rejectAppointment
);

export default router;