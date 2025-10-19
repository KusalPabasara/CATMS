import { Request, Response } from "express";
import Payment from "../models/payment.model";
import Invoice from "../models/invoice.model";
import { logAuditWithRequest, auditActions } from "../services/audit.service";

import Stripe from 'stripe';
import Patient from "../models/patient.model";
import { sendEmail, emailTemplates } from "../services/email.service";
import { sendSMS, smsTemplates } from "../services/sms.service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil'
});

export const createPayment = async (req: Request, res: Response) => {
  try {
    const { invoice_id, amount, method, transaction_id, payment_token } = req.body;

    // Validate required fields
    if (!invoice_id || !amount || !method) {
      return res.status(400).json({ error: "Invoice ID, amount, and method are required" });
    }

    // Check if invoice exists
    const invoice = await Invoice.findByPk(invoice_id);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    // Validate payment amount
    const remainingAmount = (invoice as any).total_amount - (invoice as any).paid_amount;
    if (amount > remainingAmount) {
      return res.status(400).json({ error: "Payment amount cannot exceed remaining balance" });
    }

    let stripePaymentId = transaction_id;

    // Handle online payment through Stripe
    if (method === 'card' && payment_token) {
      try {
        const stripePayment = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'usd',
          payment_method: payment_token,
          confirmation_method: 'manual',
          confirm: true,
          description: `Payment for Invoice #${invoice_id}`
        });
        stripePaymentId = stripePayment.id;
      } catch (stripeError: any) {
        console.error('Stripe payment failed:', stripeError);
        return res.status(400).json({
          error: "Payment processing failed",
          details: stripeError.message
        });
      }
    }

    // Create payment record
    const payment = await Payment.create({
      invoice_id,
      amount,
      method,
      transaction_id: stripePaymentId || null,
      payment_date: new Date(),
      status: 'completed'
    });
    
    // Log audit trail
    await logAuditWithRequest(
      req,
      auditActions.PAYMENT_CREATED,
      'payments',
      (payment as any).payment_id,
      `Payment of $${amount} for invoice ID: ${invoice_id}`
    );

    // Update invoice paid amount
    const newPaidAmount = (invoice as any).paid_amount + amount;
    const newStatus = newPaidAmount >= (invoice as any).total_amount ? 'Paid' : 'Partially Paid';
    
    await invoice.update({
      paid_amount: newPaidAmount,
      status: newStatus
    });

    // Get patient details for notification
    const patient = await Patient.findByPk((invoice as any).patient_id);

    // Send payment confirmation
    if (patient?.email) {
      const emailTemplate = (emailTemplates as any).paymentConfirmation(
        patient.getDataValue('full_name'),
        amount,
        (invoice as any).invoice_number,
        newStatus
      );
      await sendEmail(
        patient.getDataValue('email'),
        emailTemplate.subject,
        emailTemplate.html
      );
    }

    if (patient?.phone) {
      const smsText = smsTemplates.paymentConfirmation(
        patient.getDataValue('full_name'),
        amount,
        (invoice as any).invoice_number,
        newStatus
      );
      await sendSMS(patient.getDataValue('phone'), smsText);
    }

    // Generate and send receipt
    if (patient?.email) {
      const receiptTemplate = emailTemplates.paymentReceipt(
        patient.getDataValue('full_name'),
        amount,
        method,
        stripePaymentId || transaction_id,
        (invoice as any).invoice_number,
        new Date()
      );
      await sendEmail(
        patient.getDataValue('email'),
        receiptTemplate.subject,
        receiptTemplate.html
      );
    }

    res.json({
      payment,
      message: `Payment processed successfully. Receipt sent to ${patient?.email || 'patient email'}.`
    });
  } catch (err) {
    console.error('Payment processing failed:', err);
    res.status(400).json({ error: "Payment failed", details: err });
  }
};

export const getPaymentsByInvoice = async (req: Request, res: Response) => {
  try {
    const { invoice_id } = req.params;
    
    const payments = await Payment.findAll({
      where: { invoice_id },
      order: [['payment_date', 'DESC']]
    });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch payments", details: err });
  }
};

export const getAllPayments = async (_req: Request, res: Response) => {
  try {
    const payments = await Payment.findAll({
      include: [{
        model: Invoice,
        as: 'Invoice',
        include: [{
          model: require('../models/patient.model').default,
          as: 'Patient'
        }]
      }],
      order: [['payment_date', 'DESC']]
    });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch payments", details: err });
  }
};
