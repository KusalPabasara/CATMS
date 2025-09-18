import { Router } from 'express';
import Invoice from '../models/invoice.model';
import Patient from '../models/patient.model';
import { generateInvoicePDF } from '../services/pdf.service';
import { sendEmailWithAttachment } from '../services/email.service';
import path from 'path';
import { authenticateToken } from '../auth/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import fs from 'fs';

const router = Router();

// Ensure tmp directory exists
const tmpDir = path.join(__dirname, '../tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

router.post('/send-invoice/:id', authenticateToken, authorizeRoles('Billing Staff', 'System Administrator'), async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [{ model: Patient, as: 'patient' }]
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const tmpPath = path.join(tmpDir, `invoice_${(invoice as any).invoice_id}.pdf`);

    // Generate PDF
    await generateInvoicePDF(invoice, tmpPath);

    // Send email with attachment
    const result = await sendEmailWithAttachment(
      (invoice as any).patient.email,
      'Your MedSync Invoice',
      `<p>Dear ${(invoice as any).patient.full_name},</p><p>Please find your invoice attached.</p><p>Thank you for choosing MedSync Clinic.</p>`,
      tmpPath
    );

    if (result.success) {
      // Clean up temporary PDF file
      setTimeout(() => {
        if (fs.existsSync(tmpPath)) {
          fs.unlinkSync(tmpPath);
        }
      }, 5000); // Delete after 5 seconds

      res.json({ 
        message: 'Invoice emailed with attachment ✅',
        messageId: result.messageId 
      });
    } else {
      res.status(500).json({ error: 'Failed to send email', details: result.error });
    }
  } catch (error) {
    console.error('Error sending invoice email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
