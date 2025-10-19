import { Request, Response } from "express";
import Invoice from "../models/invoice.model";
import Patient from "../models/patient.model";
import Appointment from "../models/appointment.model";
import Branch from "../models/branch.model";
import { logAuditWithRequest, auditActions } from "../services/audit.service";

export const getAllInvoices = async (_req: Request, res: Response) => {
  try {
    const invoices = await Invoice.findAll({
      order: [['created_at', 'DESC']]
    });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch invoices", details: err });
  }
};

export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch invoice", details: err });
  }
};

import { generateInvoiceNumber } from '../utils/invoice.util';
import { sendEmail, emailTemplates } from '../services/email.service';
import { sendSMS, smsTemplates } from '../services/sms.service';
import { schedulePaymentReminder } from '../jobs/reminder.job';

export const createInvoice = async (req: Request, res: Response) => {
  try {
    const { patient_id, appointment_id, items, due_date } = req.body;

    // Validate required fields
    if (!patient_id || !items || !items.length) {
      return res.status(400).json({ error: "Patient ID and at least one item are required" });
    }

    // Calculate total amount
    const total_amount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0);

    // Generate invoice number
    const invoice_number = await generateInvoiceNumber();

    // Set due date (default to 30 days if not provided)
    const invoiceDueDate = due_date ? new Date(due_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Create invoice
    const invoice = await Invoice.create({
      invoice_number,
      patient_id,
      appointment_id,
      total_amount,
      paid_amount: 0,
      status: 'Pending',
      due_date: invoiceDueDate,
      items: JSON.stringify(items),
      created_at: new Date()
    });

    // Fetch patient details
    const patient = await Patient.findByPk(patient_id);
    
    // Send invoice notification
    if (patient?.email) {
      const emailTemplate = (emailTemplates as any).invoiceCreated(
        patient.getDataValue('full_name'),
        invoice_number,
        total_amount,
        invoiceDueDate,
        items
      );
      await sendEmail(
        patient.getDataValue('email'),
        emailTemplate.subject,
        emailTemplate.html
      );
    }

    if (patient?.phone) {
      const smsText = smsTemplates.invoiceCreated(
        patient.getDataValue('full_name'),
        invoice_number,
        total_amount,
        invoiceDueDate.toLocaleDateString()
      );
      await sendSMS(patient.getDataValue('phone'), smsText);
    }

    // Schedule payment reminder
    await schedulePaymentReminder(invoice.getDataValue('invoice_id'));
    
    // Log audit trail
    await logAuditWithRequest(
      req,
      auditActions.INVOICE_CREATED,
      'invoices',
      invoice.getDataValue('invoice_id'),
      `Created invoice ${invoice_number} for patient ${patient?.getDataValue('full_name')}`
    );
    
    res.status(201).json({
      invoice,
      message: 'Invoice created successfully. Notification sent to patient.'
    });
  } catch (err) {
    console.error('Failed to create invoice:', err);
    res.status(400).json({ error: "Failed to create invoice", details: err });
  }
};

export const updateInvoice = async (req: Request, res: Response) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    
    await invoice.update(req.body);
    
    // Log audit trail
    await logAuditWithRequest(
      req,
      auditActions.INVOICE_UPDATED,
      'invoices',
      (invoice as any).invoice_id,
      `Updated invoice ID: ${(invoice as any).invoice_id}`
    );
    
    res.json(invoice);
  } catch (err) {
    res.status(400).json({ error: "Update failed", details: err });
  }
};

export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    
    await invoice.destroy();
    res.json({ message: "Invoice deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: "Deletion failed", details: err });
  }
};
