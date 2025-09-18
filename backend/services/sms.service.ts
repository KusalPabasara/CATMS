import twilio from 'twilio';

// Initialize Twilio client only if valid credentials are provided
let client: any = null;

try {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (accountSid && authToken && accountSid.startsWith('AC') && authToken.length > 0) {
    client = twilio(accountSid, authToken);
    console.log('✅ Twilio client initialized successfully');
  } else {
    console.log('⚠️  Twilio credentials not configured, SMS service will be disabled');
  }
} catch (error) {
  console.log('⚠️  Failed to initialize Twilio client, SMS service will be disabled:', error);
}

export const sendSMS = async (to: string, message: string) => {
  try {
    if (!client) {
      console.log("⚠️  SMS service not available - Twilio not configured");
      return { success: false, error: "SMS service not configured" };
    }

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    console.log("📱 SMS sent to", to, "Message ID:", result.sid);
    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error("❌ SMS sending failed:", error);
    return { success: false, error };
  }
};

// Predefined SMS templates
export const smsTemplates = {
  appointmentReminder: (patientName: string, appointmentTime: string, doctorName: string) => 
    `Hi ${patientName}! You have an appointment today at ${appointmentTime} with Dr. ${doctorName} at MedSync Clinic. Please arrive 10 minutes early.`,

  paymentReminder: (patientName: string, amount: number) => 
    `Hi ${patientName}! You have an outstanding payment of Rs. ${amount.toFixed(2)} at MedSync Clinic. Please make your payment soon to avoid service interruptions.`,

  welcome: (patientName: string) => 
    `Welcome to MedSync Clinic, ${patientName}! Your registration is complete. We're here to provide you with excellent healthcare.`,

  insuranceClaimStatus: (patientName: string, status: string) => 
    `Hi ${patientName}! Your insurance claim status has been updated to: ${status}. We'll keep you informed of any changes.`,

  emergencyConsult: (doctorName: string, patientName: string) => 
    `URGENT: Dr. ${doctorName}, emergency consult requested for ${patientName}. Please respond immediately.`,

  appointmentConfirmation: (patientName: string, appointmentTime: string, doctorName: string, clinicName: string, reason: string) => 
    `Hi ${patientName}! Your appointment is confirmed for ${appointmentTime} with Dr. ${doctorName} at ${clinicName}. Reason: ${reason}. Please arrive 15 minutes early.`,

  invoiceCreated: (patientName: string, invoiceNumber: string, amount: number, dueDate: string) => 
    `Hi ${patientName}! New invoice ${invoiceNumber} for Rs. ${amount.toFixed(2)} is due on ${dueDate}. Please make payment to avoid late fees.`,

  paymentConfirmation: (patientName: string, amount: number, invoiceNumber: string, status: string) => 
    `Hi ${patientName}! Payment of Rs. ${amount.toFixed(2)} for invoice ${invoiceNumber} received. Status: ${status}. Thank you!`,

  treatmentSessionScheduled: (patientName: string, sessionDate: string, treatmentName: string) => 
    `Hi ${patientName}! Your ${treatmentName} session is scheduled for ${sessionDate}. Please arrive 15 minutes early.`
};
