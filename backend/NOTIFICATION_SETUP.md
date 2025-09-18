# Notification System Setup Guide

## Overview
The CATMS notification system supports both email and SMS notifications for various events like appointment reminders, payment reminders, and welcome messages.

## Email Configuration

### Gmail Setup (Recommended for development)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Add to your `.env` file:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Alternative Email Services

#### Mailgun
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASS=your_mailgun_password
```

#### SendGrid
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your_sendgrid_api_key
```

## SMS Configuration (Twilio)

1. Sign up for a Twilio account at https://www.twilio.com
2. Get your Account SID and Auth Token from the Twilio Console
3. Purchase a phone number for sending SMS
4. Add to your `.env` file:
```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
```

## Automated Jobs

The system includes automated cron jobs that run daily:

- **Appointment Reminders**: 8:00 AM - Sends reminders for today's appointments
- **Payment Reminders**: 9:00 AM - Sends reminders for overdue invoices

## Manual Notifications

### API Endpoints

#### Send Appointment Reminder
```http
POST /api/notifications/appointment/:appointmentId/reminder
Authorization: Bearer <token>
```

#### Send Payment Reminder
```http
POST /api/notifications/invoice/:invoiceId/reminder
Authorization: Bearer <token>
```

#### Send Custom Notification
```http
POST /api/notifications/custom
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": 1,
  "type": "both", // "email_only", "sms_only", "both"
  "subject": "Custom Subject",
  "message": "Your custom message here"
}
```

#### Send Bulk Notifications
```http
POST /api/notifications/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientIds": [1, 2, 3],
  "type": "both",
  "subject": "Bulk Notification",
  "message": "Your bulk message here"
}
```

## Testing

### Test Email Service
```javascript
// In your development environment
const { sendEmail } = require('./services/email.service');

sendEmail(
  'test@example.com',
  'Test Email',
  '<h1>Test</h1><p>This is a test email from CATMS</p>'
);
```

### Test SMS Service
```javascript
// In your development environment
const { sendSMS } = require('./services/sms.service');

sendSMS(
  '+1234567890',
  'Test SMS from CATMS'
);
```

## Troubleshooting

### Email Issues
- Check your email credentials in `.env`
- Ensure 2FA is enabled for Gmail
- Verify app password is correct
- Check firewall/network restrictions

### SMS Issues
- Verify Twilio credentials
- Check phone number format (must include country code)
- Ensure sufficient Twilio credits
- Verify phone number is verified (for trial accounts)

### Cron Job Issues
- Check server timezone settings
- Verify cron job is started in app.ts
- Check console logs for job execution
- Ensure database connection is stable

## Security Notes

1. Never commit `.env` files to version control
2. Use environment variables for all sensitive data
3. Regularly rotate API keys and passwords
4. Monitor notification logs for unusual activity
5. Implement rate limiting for manual notifications
