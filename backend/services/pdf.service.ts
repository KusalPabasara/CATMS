import PDFDocument from 'pdfkit';
import { Response } from 'express';
import Invoice from '../models/invoice.model';
import User from '../models/user.model';
import Patient from '../models/patient.model';
import fs from 'fs';

export const generateInvoicePDF = async (invoice: any, outPath: string) => {
  return new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument();

    const stream = fs.createWriteStream(outPath);
    doc.pipe(stream);

    doc.fontSize(20).text('MedSync Clinic - Invoice', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Invoice ID: ${(invoice as any).invoice_id}`);
    doc.text(`Date: ${new Date((invoice as any).created_at).toLocaleString()}`);
    doc.text(`Patient: ${(invoice as any).patient?.full_name || 'N/A'}`);
    doc.text(`Email: ${(invoice as any).patient?.email || 'N/A'}`);
    doc.moveDown();

    doc.fontSize(14).text(`Total: Rs. ${(invoice as any).total_amount}`);
    doc.text(`Paid: Rs. ${(invoice as any).paid_amount}`);
    doc.text(`Status: ${(invoice as any).status}`);
    doc.moveDown();

    doc.fontSize(10).text('Thank you for choosing MedSync.', { align: 'center' });

    doc.end();

    stream.on('finish', () => {
      resolve();
    });
    stream.on('error', (err) => reject(err));
  });
};
