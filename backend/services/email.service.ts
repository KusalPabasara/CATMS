import nodemailer from 'nodemailer';
import path from 'path';

// Initialize email transporter only if valid credentials are provided
let transporter: any = null;

try {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  if (emailUser && emailPass && emailUser.includes('@') && emailPass.length > 0) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: +(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
    console.log('✅ Email transporter initialized successfully');
  } else {
    console.log('⚠️  Email credentials not configured, email service will be disabled');
  }
} catch (error) {
  console.log('⚠️  Failed to initialize email transporter, email service will be disabled:', error);
}

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    if (!transporter) {
      console.log("⚠️  Email service not available - email not configured");
      return { success: false, error: "Email service not configured" };
    }

    const info = await transporter.sendMail({
      from: `"MedSync Clinic" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("📧 Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    return { success: false, error };
  }
};

export const sendEmailWithAttachment = async (to: string, subject: string, html: string, file: string) => {
  try {
    if (!transporter) {
      console.log("⚠️  Email service not available - email not configured");
      return { success: false, error: "Email service not configured" };
    }

    const info = await transporter.sendMail({
      from: `"MedSync Clinic" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments: [
        {
          filename: path.basename(file),
          path: file,
        }
      ]
    });

    console.log('📧 Email with PDF sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email with attachment failed:", error);
    return { success: false, error };
  }
};

// Predefined email templates
import { formatCurrency, formatInvoiceItems } from '../utils/invoice.util';

export const emailTemplates = {
  paymentConfirmation: (patientName: string, amount: number, invoiceNumber: string, status: string) => ({
    subject: `Payment Confirmation - Invoice ${invoiceNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Payment Received</h2>
        <p>Dear ${patientName},</p>
        <p>We have received your payment:</p>
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
          <p><strong>Amount Paid:</strong> ${formatCurrency(amount)}</p>
          <p><strong>Invoice Status:</strong> ${status}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p>Thank you for your payment. A detailed receipt will be sent separately.</p>
        <br>
        <p>Best regards,</p>
        <p>The MedSync Team</p>
      </div>
    `
  }),

  documentUploaded: (patientName: string, documentTitle: string, documentType: string) => ({
    subject: 'New Medical Document Available - MedSync Clinic',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">New Document Available</h2>
        <p>Dear ${patientName},</p>
        <p>A new medical document has been uploaded to your patient portal:</p>
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Document:</strong> ${documentTitle}</p>
          <p><strong>Type:</strong> ${documentType}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <p>You can view this document in your patient portal at any time.</p>
        <br>
        <p>Best regards,</p>
        <p>The MedSync Team</p>
      </div>
    `
  }),

  treatmentSessionScheduled: (patientName: string, sessionDate: Date, treatmentName: string) => ({
    subject: 'Treatment Session Scheduled - MedSync Clinic',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Treatment Session Scheduled</h2>
        <p>Dear ${patientName},</p>
        <p>Your treatment session has been scheduled:</p>
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Treatment:</strong> ${treatmentName}</p>
          <p><strong>Date & Time:</strong> ${sessionDate.toLocaleString()}</p>
        </div>
        <p>Please arrive 10 minutes before your scheduled time. If you need to reschedule, please contact us at least 24 hours in advance.</p>
        <p>Remember to:</p>
        <ul>
          <li>Bring any relevant medical records</li>
          <li>Wear comfortable clothing</li>
          <li>Report any changes in your condition</li>
        </ul>
        <br>
        <p>Best regards,</p>
        <p>The MedSync Team</p>
      </div>
    `
  }),

  paymentReceipt: (patientName: string, amount: number, method: string, transactionId: string, invoiceNumber: string, date: Date) => ({
    subject: `Payment Receipt - Invoice ${invoiceNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Payment Receipt</h2>
        <div style="border: 1px solid #d1d5db; padding: 20px; border-radius: 5px;">
          <h3>MedSync Clinic</h3>
          <p>123 Medical Center Drive<br>Healthcare City, HC 12345</p>
          <hr style="border: 1px solid #d1d5db; margin: 15px 0;">
          <p><strong>Receipt for:</strong> ${patientName}</p>
          <p><strong>Date:</strong> ${date.toLocaleString()}</p>
          <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
          <p><strong>Payment Method:</strong> ${method.toUpperCase()}</p>
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
          <p><strong>Amount Paid:</strong> ${formatCurrency(amount)}</p>
        </div>
        <p style="font-size: 0.8em; color: #6b7280; margin-top: 20px;">
          This is an official receipt for your records. Please keep it for your reference.
        </p>
      </div>
    `
  }),
  invoiceCreated: (patientName: string, invoiceNumber: string, amount: number, dueDate: Date, items: any[]) => ({
    subject: `Invoice ${invoiceNumber} - MedSync Clinic`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Invoice Generated</h2>
        <p>Dear ${patientName},</p>
        <p>A new invoice has been generated for your recent services:</p>
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
          <p><strong>Total Amount:</strong> ${formatCurrency(amount)}</p>
          <p><strong>Due Date:</strong> ${dueDate.toLocaleDateString()}</p>
          <hr style="border: 1px solid #d1d5db; margin: 10px 0;">
          <p><strong>Items:</strong></p>
          <pre style="margin: 0;">${formatInvoiceItems(items)}</pre>
        </div>
        <p>Please complete the payment before the due date to avoid any late fees.</p>
        <p>You can make your payment through our online portal or at our clinic.</p>
        <br>
        <p>Best regards,</p>
        <p>The MedSync Team</p>
      </div>
    `
  }),

  appointmentConfirmation: (patientName: string, appointmentTime: Date, doctorName: string, branchName: string, reason: string) => ({
    subject: 'Appointment Confirmation - MedSync Clinic',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Appointment Confirmed!</h2>
        <p>Dear ${patientName},</p>
        <p>Your appointment has been scheduled successfully:</p>
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Date & Time:</strong> ${appointmentTime.toLocaleString()}</p>
          <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
          <p><strong>Location:</strong> ${branchName}</p>
          <p><strong>Reason:</strong> ${reason}</p>
        </div>
        <p><strong>Important Notes:</strong></p>
        <ul>
          <li>Please arrive 10 minutes before your scheduled time</li>
          <li>Bring any relevant medical records or test results</li>
          <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
        </ul>
        <br>
        <p>Best regards,</p>
        <p>The MedSync Team</p>
      </div>
    `
  }),

  welcomeWithCredentials: (patientName: string, email: string, password: string) => ({
    subject: 'Welcome to MedSync Clinic - Your Account Details',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Welcome to MedSync Clinic!</h2>
        <p>Dear ${patientName},</p>
        <p>Your patient account has been created successfully. Here are your login credentials:</p>
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Temporary Password:</strong> ${password}</p>
        </div>
        <p><strong>Important:</strong> Please log in and change your password immediately for security purposes.</p>
        <p>You can access your account at: <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/patient/login">Patient Portal</a></p>
        <br>
        <p>Best regards,</p>
        <p>The MedSync Team</p>
      </div>
    `
  }),
  
  welcome: (patientName: string) => ({
    subject: 'Welcome to MedSync Clinic',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to MedSync Clinic</h2>
        <p>Dear ${patientName},</p>
        <p>Thank you for registering with MedSync Clinic. Your account has been successfully created.</p>
        <p>We're committed to providing you with the best healthcare experience.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <br>
        <p>Best regards,</p>
        <p>The MedSync Team</p>
      </div>
    `
  }),

  appointmentReminder: (patientName: string, appointmentDate: string, doctorName: string) => ({
    subject: 'Appointment Reminder: MedSync Clinic',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Appointment Reminder</h2>
        <p>Dear ${patientName},</p>
        <p>This is a friendly reminder that you have an appointment scheduled for:</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Date:</strong> ${appointmentDate}</p>
          <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
        </div>
        <p>Please arrive 10 minutes before your scheduled time.</p>
        <p>If you need to reschedule, please contact us as soon as possible.</p>
        <br>
        <p>Best regards,</p>
        <p>The MedSync Team</p>
      </div>
    `
  }),

  paymentReminder: (patientName: string, amount: number, dueDate: string) => ({
    subject: 'Payment Reminder: MedSync Clinic',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Payment Reminder</h2>
        <p>Dear ${patientName},</p>
        <p>This is a reminder that you have an outstanding payment:</p>
        <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Amount:</strong> Rs. ${amount.toFixed(2)}</p>
          <p><strong>Due Date:</strong> ${dueDate}</p>
        </div>
        <p>Please make your payment as soon as possible to avoid any service interruptions.</p>
        <p>You can make your payment online or contact us for assistance.</p>
        <br>
        <p>Best regards,</p>
        <p>The MedSync Team</p>
      </div>
    `
  }),

  insuranceClaimStatus: (patientName: string, status: string, claimId: string) => ({
    subject: `Insurance Claim Status Update: ${status}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Insurance Claim Status Update</h2>
        <p>Dear ${patientName},</p>
        <p>Your insurance claim has been updated:</p>
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Claim ID:</strong> ${claimId}</p>
          <p><strong>Status:</strong> ${status}</p>
        </div>
        <p>We will keep you informed of any further updates.</p>
        <br>
        <p>Best regards,</p>
        <p>The MedSync Team</p>
      </div>
    `
  }),

};
