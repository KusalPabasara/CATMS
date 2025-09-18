import cron from 'node-cron';
import sequelize, { QueryTypes } from '../config/database';
import { sendEmail, emailTemplates } from '../services/email.service';
import { sendSMS, smsTemplates } from '../services/sms.service';

export const startAppointmentReminderJob = () => {
  // Run every day at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log("🕗 Running appointment reminder job...");

    try {
      const [appointments] = await sequelize.query(`
        SELECT 
          a.appointment_id, 
          a.appointment_date, 
          p.email, 
          p.phone, 
          p.full_name as patient_name, 
          u.full_name as doctor_name
        FROM appointments a
        JOIN patients p ON a.patient_id = p.patient_id
        JOIN users u ON u.user_id = a.doctor_id
        WHERE DATE(a.appointment_date) = CURDATE()
        AND a.status = 'scheduled'
      `);

      console.log(`📅 Found ${(appointments as any[]).length} appointments for today`);

      for (const appointment of appointments as any[]) {
        const appointmentTime = new Date(appointment.appointment_date).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        const appointmentDate = new Date(appointment.appointment_date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        // Send email reminder
        if (appointment.email) {
          const emailTemplate = emailTemplates.appointmentReminder(
            appointment.patient_name,
            appointmentDate + ' at ' + appointmentTime,
            appointment.doctor_name
          );

          await sendEmail(
            appointment.email,
            emailTemplate.subject,
            emailTemplate.html
          );
        }

        // Send SMS reminder (if phone number exists)
        if (appointment.phone) {
          const smsMessage = smsTemplates.appointmentReminder(
            appointment.patient_name,
            appointmentTime,
            appointment.doctor_name
          );

          await sendSMS(appointment.phone, smsMessage);
        }
      }

      console.log("✅ Appointment reminders sent successfully");
    } catch (error) {
      console.error("❌ Error in appointment reminder job:", error);
    }
  }, {
    timezone: "Asia/Colombo",
  });

  console.log("🕐 Appointment reminder job scheduled (runs daily at 8:00 AM)");
};

export const startPaymentReminderJob = () => {
  // Run every day at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log("💰 Running payment reminder job...");

    try {
      const [overdueInvoices] = await sequelize.query(`
        SELECT 
          i.invoice_id,
          i.amount,
          i.due_date,
          p.email,
          p.phone,
          p.full_name as patient_name
        FROM invoices i
        JOIN patients p ON i.patient_id = p.patient_id
        WHERE i.due_date < CURDATE()
        AND i.status = 'unpaid'
        AND i.amount > 0
      `);

      console.log(`💰 Found ${(overdueInvoices as any[]).length} overdue invoices`);

      for (const invoice of overdueInvoices as any[]) {
        const dueDate = new Date(invoice.due_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        // Send email reminder
        if (invoice.email) {
          const emailTemplate = emailTemplates.paymentReminder(
            invoice.patient_name,
            invoice.amount,
            dueDate
          );

          await sendEmail(
            invoice.email,
            emailTemplate.subject,
            emailTemplate.html
          );
        }

        // Send SMS reminder (if phone number exists)
        if (invoice.phone) {
          const smsMessage = smsTemplates.paymentReminder(
            invoice.patient_name,
            invoice.amount
          );

          await sendSMS(invoice.phone, smsMessage);
        }
      }

      console.log("✅ Payment reminders sent successfully");
    } catch (error) {
      console.error("❌ Error in payment reminder job:", error);
    }
  }, {
    timezone: "Asia/Colombo",
  });

  console.log("🕐 Payment reminder job scheduled (runs daily at 9:00 AM)");
};

// Start all reminder jobs
export const startAllReminderJobs = () => {
  startAppointmentReminderJob();
  startPaymentReminderJob();
};

// Individual reminder functions for controllers
export const scheduleReminder = async (appointmentId: number) => {
  try {
    const [appointments] = await sequelize.query(`
      SELECT 
        a.appointment_id, 
        a.appointment_date, 
        p.email, 
        p.phone, 
        p.full_name as patient_name, 
        u.full_name as doctor_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.patient_id
      JOIN users u ON a.doctor_id = u.user_id
      WHERE a.appointment_id = :appointmentId
    `, {
      replacements: { appointmentId },
      type: QueryTypes.SELECT
    });

    if (appointments && Array.isArray(appointments) && appointments.length > 0) {
      const appointment = appointments[0] as any;
      const appointmentTime = new Date(appointment.appointment_date).toLocaleString();
      
      const emailTemplate = emailTemplates.appointmentReminder(
        appointment.patient_name,
        appointmentTime,
        appointment.doctor_name
      );
      
      await sendEmail(appointment.email, emailTemplate.subject, emailTemplate.html);
      console.log(`✅ Appointment reminder sent for appointment ${appointmentId}`);
    }
  } catch (error) {
    console.error('❌ Error sending appointment reminder:', error);
  }
};

export const schedulePaymentReminder = async (invoiceId: number) => {
  try {
    const [invoices] = await sequelize.query(`
      SELECT 
        i.invoice_id,
        i.total_amount,
        i.due_date,
        p.email, 
        p.phone, 
        p.full_name as patient_name
      FROM invoices i
      JOIN patients p ON i.patient_id = p.patient_id
      WHERE i.invoice_id = :invoiceId
    `, {
      replacements: { invoiceId },
      type: QueryTypes.SELECT
    });

    if (invoices && Array.isArray(invoices) && invoices.length > 0) {
      const invoice = invoices[0] as any;
      
      const emailTemplate = emailTemplates.paymentReminder(
        invoice.patient_name,
        invoice.total_amount,
        new Date(invoice.due_date).toLocaleDateString()
      );
      
      await sendEmail(invoice.email, emailTemplate.subject, emailTemplate.html);
      console.log(`✅ Payment reminder sent for invoice ${invoiceId}`);
    }
  } catch (error) {
    console.error('❌ Error sending payment reminder:', error);
  }
};
