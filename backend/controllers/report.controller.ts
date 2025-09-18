import { Request, Response } from "express";
import { Op } from "sequelize";
import sequelize from "../config/database";
import Appointment from "../models/appointment.model";
import Patient from "../models/patient.model";
import Invoice from "../models/invoice.model";
import Payment from "../models/payment.model";
import User from "../models/user.model";
import Role from "../models/role.model";

export const getDashboardOverview = async (req: Request, res: Response) => {
  try {
    const { branch_id } = req.user as any;
    
    // Base conditions for branch-specific data
    const branchCondition = branch_id ? { branch_id } : {};
    
    const [appointments, patients, invoices, todayAppointments, pendingInvoices] = await Promise.all([
      // Total appointments
      Appointment.count({ where: branchCondition }),
      
      // Total patients
      Patient.count({ where: { active: true } }),
      
      // Total invoices
      Invoice.findAll({ where: branchCondition }),
      
      // Today's appointments
      Appointment.count({
        where: {
          ...branchCondition,
          appointment_date: {
            [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
            [Op.lt]: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      }),
      
      // Pending invoices
      Invoice.count({
        where: {
          ...branchCondition,
          status: { [Op.in]: ['Pending', 'Partially Paid'] }
        }
      })
    ]);

    // Calculate revenue
    const totalRevenue = invoices.reduce((sum, inv) => sum + parseFloat((inv as any).paid_amount.toString()), 0);
    const pendingAmount = invoices
      .filter(inv => (inv as any).status === 'Pending' || (inv as any).status === 'Partially Paid')
      .reduce((sum, inv) => sum + (parseFloat((inv as any).total_amount.toString()) - parseFloat((inv as any).paid_amount.toString())), 0);

    res.json({
      totalAppointments: appointments,
      totalPatients: patients,
      totalRevenue: totalRevenue,
      todayAppointments: todayAppointments,
      pendingInvoices: pendingInvoices,
      pendingAmount: pendingAmount,
      totalInvoices: invoices.length
    });

  } catch (err) {
    console.error('Dashboard overview error:', err);
    res.status(500).json({ error: "Failed to fetch dashboard overview", details: err });
  }
};

export const getAppointmentChart = async (req: Request, res: Response) => {
  try {
    const { branch_id } = req.user as any;
    const { days = 7 } = req.query;
    
    const branchCondition = branch_id ? `AND branch_id = ${branch_id}` : '';
    
    const raw = await sequelize.query(`
      SELECT 
        DATE(appointment_date) as date, 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'Scheduled' THEN 1 ELSE 0 END) as scheduled,
        SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled
      FROM appointments 
      WHERE appointment_date >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)
      ${branchCondition}
      GROUP BY DATE(appointment_date)
      ORDER BY date ASC
    `);

    res.json(raw[0]);
  } catch (err) {
    console.error('Appointment chart error:', err);
    res.status(500).json({ error: "Failed to fetch appointment chart", details: err });
  }
};

export const getRevenueChart = async (req: Request, res: Response) => {
  try {
    const { branch_id } = req.user as any;
    const { months = 6 } = req.query;
    
    const branchCondition = branch_id ? `AND i.branch_id = ${branch_id}` : '';
    
    const raw = await sequelize.query(`
      SELECT 
        DATE_FORMAT(p.payment_date, '%Y-%m') as month, 
        SUM(p.amount) as total,
        COUNT(DISTINCT p.invoice_id) as invoices
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.invoice_id
      WHERE p.payment_date >= DATE_SUB(CURDATE(), INTERVAL ${months} MONTH)
      ${branchCondition}
      GROUP BY month
      ORDER BY month ASC
    `);

    res.json(raw[0]);
  } catch (err) {
    console.error('Revenue chart error:', err);
    res.status(500).json({ error: "Failed to fetch revenue chart", details: err });
  }
};

export const getTopDoctors = async (req: Request, res: Response) => {
  try {
    const { branch_id } = req.user as any;
    const { limit = 5 } = req.query;
    
    const branchCondition = branch_id ? `AND i.branch_id = ${branch_id}` : '';
    
    const raw = await sequelize.query(`
      SELECT 
        u.full_name as doctor_name,
        COUNT(DISTINCT a.appointment_id) as total_appointments,
        SUM(i.total_amount) as total_revenue,
        SUM(i.paid_amount) as collected_amount
      FROM users u
      JOIN appointments a ON u.user_id = a.doctor_id
      JOIN invoices i ON a.appointment_id = i.appointment_id
      JOIN roles r ON u.role_id = r.role_id
      WHERE r.name = 'Doctor'
      ${branchCondition}
      GROUP BY u.user_id, u.full_name
      ORDER BY total_revenue DESC
      LIMIT ${limit}
    `);

    res.json(raw[0]);
  } catch (err) {
    console.error('Top doctors error:', err);
    res.status(500).json({ error: "Failed to fetch top doctors", details: err });
  }
};

export const getPaymentMethodsChart = async (req: Request, res: Response) => {
  try {
    const { branch_id } = req.user as any;
    const { months = 3 } = req.query;
    
    const branchCondition = branch_id ? `AND i.branch_id = ${branch_id}` : '';
    
    const raw = await sequelize.query(`
      SELECT 
        p.method,
        COUNT(*) as count,
        SUM(p.amount) as total_amount
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.invoice_id
      WHERE p.payment_date >= DATE_SUB(CURDATE(), INTERVAL ${months} MONTH)
      ${branchCondition}
      GROUP BY p.method
      ORDER BY total_amount DESC
    `);

    res.json(raw[0]);
  } catch (err) {
    console.error('Payment methods chart error:', err);
    res.status(500).json({ error: "Failed to fetch payment methods chart", details: err });
  }
};

export const getPatientGrowth = async (req: Request, res: Response) => {
  try {
    const { branch_id } = req.user as any;
    const { months = 12 } = req.query;
    
    const branchCondition = branch_id ? `AND u.branch_id = ${branch_id}` : '';
    
    const raw = await sequelize.query(`
      SELECT 
        DATE_FORMAT(p.created_at, '%Y-%m') as month,
        COUNT(*) as new_patients
      FROM patients p
      LEFT JOIN appointments a ON p.patient_id = a.patient_id
      LEFT JOIN users u ON a.doctor_id = u.user_id
      WHERE p.created_at >= DATE_SUB(CURDATE(), INTERVAL ${months} MONTH)
      ${branchCondition}
      GROUP BY month
      ORDER BY month ASC
    `);

    res.json(raw[0]);
  } catch (err) {
    console.error('Patient growth error:', err);
    res.status(500).json({ error: "Failed to fetch patient growth", details: err });
  }
};

export const getTopTreatments = async (req: Request, res: Response) => {
  try {
    const { branch_id } = req.user as any;
    const { limit = 5 } = req.query;
    
    const branchCondition = branch_id ? `AND a.branch_id = ${branch_id}` : '';
    
    const raw = await sequelize.query(`
      SELECT 
        t.name as treatment_name,
        COUNT(*) as usage_count,
        SUM(i.total_amount) as total_revenue
      FROM treatment_records tr
      JOIN treatments t ON tr.treatment_id = t.treatment_id
      JOIN appointments a ON tr.appointment_id = a.appointment_id
      JOIN invoices i ON a.appointment_id = i.appointment_id
      WHERE t.is_active = 1
      ${branchCondition}
      GROUP BY t.treatment_id, t.name
      ORDER BY usage_count DESC
      LIMIT ${limit}
    `);

    res.json(raw[0]);
  } catch (err) {
    console.error('Top treatments error:', err);
    res.status(500).json({ error: "Failed to fetch top treatments", details: err });
  }
};

export const getPaymentMethodTrends = async (req: Request, res: Response) => {
  try {
    const { branch_id } = req.user as any;
    const { days = 30 } = req.query;
    
    const branchCondition = branch_id ? `AND i.branch_id = ${branch_id}` : '';
    
    const raw = await sequelize.query(`
      SELECT 
        DATE(p.payment_date) as date,
        p.method,
        SUM(p.amount) as total_amount,
        COUNT(*) as payment_count
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.invoice_id
      WHERE p.payment_date >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)
      ${branchCondition}
      GROUP BY DATE(p.payment_date), p.method
      ORDER BY date ASC, method ASC
    `);

    res.json(raw[0]);
  } catch (err) {
    console.error('Payment method trends error:', err);
    res.status(500).json({ error: "Failed to fetch payment method trends", details: err });
  }
};

export const getInsuranceClaimStatus = async (req: Request, res: Response) => {
  try {
    const { branch_id } = req.user as any;
    
    const branchCondition = branch_id ? `AND i.branch_id = ${branch_id}` : '';
    
    const raw = await sequelize.query(`
      SELECT 
        ic.claim_status,
        COUNT(*) as count,
        SUM(i.total_amount) as total_amount
      FROM insurance_claims ic
      JOIN invoices i ON ic.invoice_id = i.invoice_id
      WHERE 1=1
      ${branchCondition}
      GROUP BY ic.claim_status
      ORDER BY count DESC
    `);

    res.json(raw[0]);
  } catch (err) {
    console.error('Insurance claim status error:', err);
    res.status(500).json({ error: "Failed to fetch insurance claim status", details: err });
  }
};

export const getAppointmentStatusDistribution = async (req: Request, res: Response) => {
  try {
    const { branch_id } = req.user as any;
    const { months = 3 } = req.query;
    
    const branchCondition = branch_id ? `AND branch_id = ${branch_id}` : '';
    
    const raw = await sequelize.query(`
      SELECT 
        status,
        COUNT(*) as count,
        COUNT(*) * 100.0 / (SELECT COUNT(*) FROM appointments WHERE appointment_date >= DATE_SUB(CURDATE(), INTERVAL ${months} MONTH) ${branchCondition}) as percentage
      FROM appointments
      WHERE appointment_date >= DATE_SUB(CURDATE(), INTERVAL ${months} MONTH)
      ${branchCondition}
      GROUP BY status
      ORDER BY count DESC
    `);

    res.json(raw[0]);
  } catch (err) {
    console.error('Appointment status distribution error:', err);
    res.status(500).json({ error: "Failed to fetch appointment status distribution", details: err });
  }
};

export const getRevenueBySpecialty = async (req: Request, res: Response) => {
  try {
    const { branch_id } = req.user as any;
    const { months = 6 } = req.query;
    
    const branchCondition = branch_id ? `AND a.branch_id = ${branch_id}` : '';
    
    const raw = await sequelize.query(`
      SELECT 
        s.name as specialty_name,
        COUNT(DISTINCT a.appointment_id) as appointment_count,
        SUM(i.total_amount) as total_revenue,
        AVG(i.total_amount) as avg_revenue
      FROM appointments a
      JOIN users u ON a.doctor_id = u.user_id
      JOIN doctor_specialties ds ON u.user_id = ds.user_id
      JOIN specialties s ON ds.specialty_id = s.specialty_id
      JOIN invoices i ON a.appointment_id = i.appointment_id
      WHERE a.appointment_date >= DATE_SUB(CURDATE(), INTERVAL ${months} MONTH)
      ${branchCondition}
      GROUP BY s.specialty_id, s.name
      ORDER BY total_revenue DESC
      LIMIT 10
    `);

    res.json(raw[0]);
  } catch (err) {
    console.error('Revenue by specialty error:', err);
    res.status(500).json({ error: "Failed to fetch revenue by specialty", details: err });
  }
};
