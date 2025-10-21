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

// Serve static files for uploads with CORS headers
app.use('/uploads', (req, res, next) => {
  // Set CORS headers for all requests
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Set CORP header to allow cross-origin resource sharing
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  next();
}, express.static('uploads', {
  setHeaders: (res, path) => {
    // Additional headers for static files
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Import routes
import authRoutes from './auth/auth.routes';
import patientRoutes from './routes/patient.routes';
import appointmentRoutes from './routes/appointment.routes';
import branchRoutes from './routes/branch.routes';
import paymentRoutes from './routes/payment.routes';
import reportRoutes from './routes/report.routes';
import notificationRoutes from './routes/notification.routes';
import auditRoutes from './routes/audit.routes';
import emailRoutes from './routes/email.routes';
import treatmentRoutes from './routes/treatment.routes';
import invoiceRoutes from './routes/invoice.routes';
import aiMedicalRoutes from './routes/ai-medical.routes';
import treatmentCatalogueRoutes from './routes/treatment_catalogue.routes';
import userRoutes from './routes/user.routes';
import patientAuthRoutes from './routes/patient.auth.routes';
import doctorRoutes from './routes/doctor.routes';
import staffRoutes from './routes/staff.routes'; // ADD THIS LINE

// Routes
app.use('/api/patient-auth', patientAuthRoutes); // Patient self-service - different path
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes); // Admin patient management
app.use('/api/doctors', doctorRoutes); // Admin doctor management
app.use('/api/staff', staffRoutes); // ADD THIS LINE - Staff management
app.use('/api/appointments', appointmentRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/treatments', treatmentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/treatment-catalogue', treatmentCatalogueRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/ai-medical', aiMedicalRoutes);

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

// Alias under /api for clients expecting /api/health
app.get("/api/health", (_req, res) => {
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