import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { startAllReminderJobs } from "./jobs/reminder.job";
import "./models/index"; // Import models to establish associations

dotenv.config();

const app = express();
app.use(cors({ 
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'], 
  credentials: true 
}));
app.use(helmet());
app.use(bodyParser.json());
app.use(morgan("dev"));

// Serve static files for uploads
app.use('/uploads', express.static('uploads'));

// Import routes
import authRoutes from './auth/auth.routes';
import patientRoutes from './routes/patient.routes';
import appointmentRoutes from './routes/appointment.routes';
import treatmentRoutes from './routes/treatment.routes';
import invoiceRoutes from './routes/invoice.routes';
import userRoutes from './routes/user.routes';
import paymentRoutes from './routes/payment.routes';
import reportRoutes from './routes/report.routes';
import notificationRoutes from './routes/notification.routes';
import auditRoutes from './routes/audit.routes';
import emailRoutes from './routes/email.routes';
import patientAuthRoutes from './routes/patient.auth.routes';

// Routes
app.use('/api/patient-auth', patientAuthRoutes); // Patient self-service - different path
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes); // Admin patient management
app.use('/api/appointments', appointmentRoutes);
app.use('/api/treatments', treatmentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/email', emailRoutes);

app.get("/", (_req, res) => res.send("CATMS API"));

// Health check endpoint for Docker
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "CATMS Backend API",
    version: "1.0.0"
  });
});

// Start reminder jobs
startAllReminderJobs();

export default app;
