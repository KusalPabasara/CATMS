# Marga.lk - Digital Health Pathways

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Key Features](#key-features)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Frontend Components](#frontend-components)
9. [Authentication & Authorization](#authentication--authorization)
10. [File Upload System](#file-upload-system)
11. [Notification System](#notification-system)
12. [Audit Trail](#audit-trail)
13. [Reporting & Analytics](#reporting--analytics)
14. [Docker Configuration](#docker-configuration)
15. [Installation & Setup](#installation--setup)
16. [Development Workflow](#development-workflow)
17. [Deployment](#deployment)
18. [Troubleshooting](#troubleshooting)

---

## 🏥 Project Overview

**Marga.lk (Digital Health Pathways)** is a comprehensive healthcare management platform designed to streamline clinical operations, patient management, and administrative tasks for medical facilities.

### Core Objectives
- **Patient Management**: Complete patient lifecycle management from registration to treatment
- **Appointment Scheduling**: Advanced scheduling system with calendar integration
- **Treatment Records**: Digital treatment documentation and prescription management
- **Staff Management**: Multi-role user system with role-based access control
- **Financial Management**: Payment processing, invoicing, and financial reporting
- **Analytics & Reporting**: Comprehensive dashboards and business intelligence

---

## 🏗️ Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React/Vite)  │◄──►│   (Node.js)     │◄──►│   (MySQL)       │
│                 │    │                 │    │                 │
│ • Material UI   │    │ • Express.js    │    │ • Sequelize ORM │
│ • TypeScript    │    │ • TypeScript    │    │ • Multi-table   │
│ • Zustand Store │    │ • JWT Auth      │    │ • Relationships │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Microservices Components
- **Authentication Service**: JWT-based auth with role management
- **Patient Service**: Patient data and profile management
- **Appointment Service**: Scheduling and calendar management
- **Treatment Service**: Medical records and prescriptions
- **Payment Service**: Financial transactions and invoicing
- **Notification Service**: Email/SMS notifications
- **Audit Service**: Activity logging and compliance
- **Report Service**: Analytics and business intelligence

---

## 🛠️ Technology Stack

### Frontend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.1 | Core UI framework |
| **TypeScript** | 5.8.3 | Type-safe development |
| **Vite** | 7.1.2 | Build tool and dev server |
| **Material UI** | 7.3.2 | UI component library |
| **Zustand** | 5.0.8 | State management |
| **React Router** | 7.8.2 | Client-side routing |
| **Axios** | 1.11.0 | HTTP client |
| **Framer Motion** | Latest | Animation library |
| **Chart.js** | 4.5.0 | Data visualization |
| **FullCalendar** | 6.1.19 | Calendar component |
| **Tailwind CSS** | 3.4.17 | Utility-first CSS |

### Backend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | Latest LTS | Runtime environment |
| **Express.js** | Latest | Web framework |
| **TypeScript** | 5.9.2 | Type-safe development |
| **Sequelize** | Latest | ORM for database |
| **MySQL** | 8.0+ | Primary database |
| **JWT** | Latest | Authentication tokens |
| **Multer** | Latest | File upload handling |
| **Cors** | Latest | Cross-origin requests |
| **Bcrypt** | Latest | Password hashing |
| **Nodemailer** | Latest | Email service |
| **Twilio** | Latest | SMS service |
| **Stripe** | Latest | Payment processing |

### Development Tools
| Tool | Purpose |
|------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **ts-node-dev** | Development server |
| **Nodemon** | Auto-restart on changes |

---

## 📁 Project Structure

```
Marga.lk/
├── 📁 backend/                    # Backend API server
│   ├── 📁 auth/                   # Authentication modules
│   │   ├── auth.controller.ts     # Auth controller
│   │   ├── auth.middleware.ts     # Auth middleware
│   │   └── auth.routes.ts         # Auth routes
│   ├── 📁 config/                 # Configuration files
│   │   ├── config.json            # App configuration
│   │   └── database.ts            # Database config
│   ├── 📁 controllers/            # API controllers
│   │   ├── appointment.controller.ts
│   │   ├── audit.controller.ts
│   │   ├── invoice.controller.ts
│   │   ├── notification.controller.ts
│   │   ├── patient.controller.ts
│   │   ├── payment.controller.ts
│   │   ├── report.controller.ts
│   │   ├── treatment.controller.ts
│   │   └── user.controller.ts
│   ├── 📁 jobs/                   # Background jobs
│   │   └── reminder.job.ts        # Appointment reminders
│   ├── 📁 middlewares/            # Custom middlewares
│   │   └── role.middleware.ts     # Role-based access
│   ├── 📁 migrations/             # Database migrations
│   │   └── add_due_date_to_invoices.sql
│   ├── 📁 models/                 # Database models
│   │   ├── appointment.model.ts
│   │   ├── audit_log.model.ts
│   │   ├── branch.model.ts
│   │   ├── doctor_specialty.model.ts
│   │   ├── insurance_claim.model.ts
│   │   ├── invoice.model.ts
│   │   ├── patient.model.ts
│   │   ├── payment.model.ts
│   │   ├── role.model.ts
│   │   ├── specialty.model.ts
│   │   ├── staff_schedule.model.ts
│   │   ├── system_setting.model.ts
│   │   ├── treatment.model.ts
│   │   └── user.model.ts
│   ├── 📁 routes/                 # API routes
│   │   ├── appointment.routes.ts
│   │   ├── audit.routes.ts
│   │   ├── email.routes.ts
│   │   ├── invoice.routes.ts
│   │   ├── notification.routes.ts
│   │   ├── patient.routes.ts
│   │   ├── payment.routes.ts
│   │   ├── report.routes.ts
│   │   ├── treatment.routes.ts
│   │   └── user.routes.ts
│   ├── 📁 services/               # Business logic services
│   │   ├── audit.service.ts
│   │   ├── email.service.ts
│   │   ├── pdf.service.ts
│   │   └── sms.service.ts
│   ├── 📁 scripts/                # Utility scripts
│   │   ├── seed-initial-data.ts
│   │   └── setup-db.sh
│   ├── 📁 types/                  # TypeScript type definitions
│   │   └── express.d.ts
│   ├── 📁 utils/                  # Utility functions
│   │   ├── jwt.util.ts
│   │   └── sync.ts
│   ├── app.ts                     # Express app configuration
│   ├── server.ts                  # Server entry point
│   ├── package.json               # Backend dependencies
│   └── tsconfig.json              # TypeScript config
├── 📁 frontend/                   # Frontend React application
│   ├── 📁 src/
│   │   ├── 📁 components/         # Reusable components
│   │   │   ├── AnimatedBackground.tsx
│   │   │   ├── MetricCard.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── 📁 contexts/           # React contexts
│   │   │   └── ThemeContext.tsx
│   │   ├── 📁 layouts/            # Layout components
│   │   │   └── MainLayout.tsx
│   │   ├── 📁 pages/              # Page components
│   │   │   ├── 📁 Patient/        # Patient-specific pages
│   │   │   │   ├── AppointmentHistory.tsx
│   │   │   │   ├── BookAppointment.tsx
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Profile.tsx
│   │   │   │   └── Register.tsx
│   │   │   ├── Dashboard.tsx      # Admin dashboard
│   │   │   ├── Login.tsx          # Login page
│   │   │   ├── Patients.tsx       # Patient management
│   │   │   └── Reports.tsx        # Reports page
│   │   ├── 📁 services/           # API services
│   │   │   └── api.ts
│   │   ├── 📁 store/              # State management
│   │   │   ├── authStore.ts
│   │   │   └── patientStore.ts
│   │   ├── 📁 theme/              # Theme configuration
│   │   │   └── muiTheme.ts
│   │   ├── 📁 utils/              # Utility functions
│   │   │   └── utils.ts
│   │   ├── App.tsx                # Main app component
│   │   ├── main.tsx               # App entry point
│   │   ├── routes.tsx             # Route definitions
│   │   └── index.css              # Global styles
│   ├── 📁 public/                 # Static assets
│   ├── package.json               # Frontend dependencies
│   ├── vite.config.ts             # Vite configuration
│   └── tailwind.config.ts         # Tailwind configuration
├── 📁 database/                   # Database files
│   └── schema.sql                 # Database schema
├── 📁 scripts/                    # Deployment scripts
│   └── migrate.sh
├── docker-compose.yml             # Docker orchestration
├── Dockerfile                     # Docker configuration
├── .env                           # Environment variables
├── start-docker.sh               # Docker startup script
├── stop-docker.sh                # Docker shutdown script
└── README.md                      # Project documentation
```

---

## ✨ Key Features

### 1. **Multi-Role Authentication System**
- **Admin**: Full system access and management
- **Doctor**: Patient management and treatment records
- **Staff**: Appointment scheduling and basic operations
- **Patient**: Self-service portal for appointments and records

### 2. **Patient Management**
- Complete patient registration and profile management
- Medical history tracking
- Profile picture upload and management
- Insurance information management
- Emergency contact details

### 3. **Appointment Scheduling**
- Advanced calendar integration with FullCalendar
- Drag-and-drop appointment scheduling
- Multiple appointment types (scheduled, walk-in)
- Appointment status tracking
- Automated reminder system

### 4. **Treatment Management**
- Digital treatment records
- Prescription management
- Treatment history tracking
- Doctor notes and observations
- Digital signatures for prescriptions

### 5. **Financial Management**
- Invoice generation and management
- Payment processing with Stripe integration
- Insurance claim management
- Financial reporting and analytics
- Payment reminders

### 6. **Notification System**
- Email notifications for appointments
- SMS reminders via Twilio
- System notifications
- Customizable notification preferences

### 7. **Audit Trail**
- Complete activity logging
- User action tracking
- Data change history
- Compliance reporting
- Security monitoring

### 8. **Reporting & Analytics**
- Comprehensive dashboards
- Revenue analytics
- Patient statistics
- Appointment trends
- Export capabilities (PDF, Excel)

---

## 🗄️ Database Schema

### Core Tables

#### **Users Table**
```sql
CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(role_id)
);
```

#### **Patients Table**
```sql
CREATE TABLE patients (
  patient_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  full_name VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  national_id VARCHAR(50) UNIQUE,
  date_of_birth DATE NOT NULL,
  gender ENUM('Male', 'Female', 'Other') NOT NULL,
  blood_type VARCHAR(10),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  insurance_provider VARCHAR(255),
  insurance_number VARCHAR(100),
  profile_picture VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

#### **Appointments Table**
```sql
CREATE TABLE appointments (
  appointment_id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  branch_id INT,
  appointment_date DATETIME NOT NULL,
  status ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
  is_walkin BOOLEAN DEFAULT FALSE,
  reason TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
  FOREIGN KEY (doctor_id) REFERENCES users(user_id),
  FOREIGN KEY (branch_id) REFERENCES branches(branch_id),
  FOREIGN KEY (created_by) REFERENCES users(user_id)
);
```

#### **Treatment Records Table**
```sql
CREATE TABLE treatment_records (
  record_id INT PRIMARY KEY AUTO_INCREMENT,
  appointment_id INT NOT NULL,
  doctor_id INT NOT NULL,
  treatment_id INT,
  notes TEXT,
  prescription TEXT,
  image_url VARCHAR(500),
  digitally_signed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id),
  FOREIGN KEY (doctor_id) REFERENCES users(user_id),
  FOREIGN KEY (treatment_id) REFERENCES treatments(treatment_id)
);
```

### Additional Tables
- **roles**: User role definitions
- **branches**: Medical facility branches
- **specialties**: Medical specialties
- **doctor_specialties**: Doctor-specialty relationships
- **invoices**: Financial invoices
- **payments**: Payment records
- **insurance_claims**: Insurance claim management
- **audit_logs**: System audit trail
- **system_settings**: Application settings
- **staff_schedules**: Staff scheduling

---

## 🔌 API Endpoints

### Authentication Endpoints
```
POST   /api/auth/login              # User login
POST   /api/auth/logout             # User logout
POST   /api/auth/register           # User registration
GET    /api/auth/profile            # Get user profile
PUT    /api/auth/profile            # Update user profile
```

### Patient Endpoints
```
GET    /api/patients                # Get all patients
POST   /api/patients                # Create new patient
GET    /api/patients/:id           # Get patient by ID
PUT    /api/patients/:id           # Update patient
DELETE /api/patients/:id           # Delete patient
POST   /api/patients/:id/upload    # Upload profile picture
```

### Appointment Endpoints
```
GET    /api/appointments            # Get all appointments
POST   /api/appointments            # Create new appointment
GET    /api/appointments/:id        # Get appointment by ID
PUT    /api/appointments/:id        # Update appointment
DELETE /api/appointments/:id        # Cancel appointment
GET    /api/appointments/calendar   # Get calendar data
```

### Treatment Endpoints
```
GET    /api/treatments              # Get all treatments
POST   /api/treatments              # Create treatment record
GET    /api/treatments/:id          # Get treatment by ID
PUT    /api/treatments/:id          # Update treatment
DELETE /api/treatments/:id          # Delete treatment
```

### Payment Endpoints
```
GET    /api/payments                # Get all payments
POST   /api/payments                # Process payment
GET    /api/payments/:id            # Get payment by ID
POST   /api/payments/refund         # Process refund
```

### Report Endpoints
```
GET    /api/reports/overview        # Dashboard overview
GET    /api/reports/revenue         # Revenue reports
GET    /api/reports/patients        # Patient statistics
GET    /api/reports/appointments    # Appointment analytics
GET    /api/reports/export          # Export reports
```

---

## 🎨 Frontend Components

### Core Components

#### **AnimatedBackground**
- Framer Motion-powered animated background
- Medical-themed SVG with ECG lines and stethoscope
- Infinite diagonal animation with blur effects
- Used on login and registration pages

#### **MetricCard**
- Reusable metric display component
- Supports icons, values, and labels
- Dark/light mode compatible
- Used in dashboard analytics

#### **ThemeToggle**
- Advanced theme switching component
- Supports Light, Dark, and System modes
- Material UI IconButton with tooltips
- Persistent theme preferences

### Layout Components

#### **MainLayout**
- Primary application layout
- Material UI AppBar with navigation
- Responsive drawer navigation
- Theme-aware styling
- User profile integration

### Page Components

#### **Dashboard Pages**
- **Admin Dashboard**: System overview and analytics
- **Patient Dashboard**: Personal health information
- **Doctor Dashboard**: Patient management interface

#### **Authentication Pages**
- **Login**: Multi-role login with animated background
- **Register**: Patient registration with form validation

#### **Management Pages**
- **Patients**: Patient list with search and actions
- **Appointments**: Calendar view with drag-and-drop
- **Reports**: Analytics and export functionality

---

## 🔐 Authentication & Authorization

### JWT-Based Authentication
- **Token Structure**: User ID, role, permissions, expiration
- **Refresh Tokens**: Automatic token renewal
- **Secure Storage**: HTTP-only cookies for token storage

### Role-Based Access Control (RBAC)
```typescript
enum UserRole {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  STAFF = 'staff',
  PATIENT = 'patient'
}

interface Permission {
  resource: string;
  actions: string[];
}
```

### Middleware Stack
1. **Authentication Middleware**: Token validation
2. **Authorization Middleware**: Role-based access control
3. **Audit Middleware**: Activity logging
4. **Rate Limiting**: API protection

### Security Features
- Password hashing with bcrypt
- CORS configuration
- Input validation and sanitization
- SQL injection prevention
- XSS protection

---

## 📁 File Upload System

### Profile Picture Management
- **Multer Configuration**: File upload handling
- **File Validation**: Type and size restrictions
- **Storage**: Local filesystem with organized structure
- **URL Generation**: Dynamic image serving
- **CORS Headers**: Cross-origin image access

### File Structure
```
uploads/
├── profile-pictures/
│   ├── patient-{id}-{timestamp}-{random}.{ext}
│   └── doctor-{id}-{timestamp}-{random}.{ext}
├── documents/
│   ├── prescriptions/
│   └── reports/
└── temp/
```

### Upload Process
1. **Client**: File selection and validation
2. **API**: Multer processing and storage
3. **Database**: URL storage and metadata
4. **Frontend**: Dynamic image loading with fallbacks

---

## 📧 Notification System

### Email Notifications
- **Nodemailer Integration**: SMTP email service
- **Template System**: HTML email templates
- **Scheduling**: Automated appointment reminders
- **Delivery Tracking**: Email status monitoring

### SMS Notifications
- **Twilio Integration**: SMS service provider
- **Appointment Reminders**: Automated SMS alerts
- **Delivery Status**: SMS delivery tracking
- **Opt-out Management**: User preference handling

### Notification Types
- Appointment confirmations
- Appointment reminders (24h, 2h before)
- Payment confirmations
- System alerts
- Password reset notifications

---

## 📊 Audit Trail

### Activity Logging
- **User Actions**: Login, logout, data modifications
- **Data Changes**: Before/after values for critical data
- **System Events**: Error logs, security events
- **API Calls**: Request/response logging

### Audit Log Structure
```typescript
interface AuditLog {
  log_id: number;
  user_id: number;
  action: string;
  resource: string;
  resource_id: number;
  old_values: object;
  new_values: object;
  ip_address: string;
  user_agent: string;
  timestamp: Date;
}
```

### Compliance Features
- **Data Retention**: Configurable log retention periods
- **Export Capabilities**: Audit log exports
- **Search & Filter**: Advanced log querying
- **Real-time Monitoring**: Live activity tracking

---

## 📈 Reporting & Analytics

### Dashboard Analytics
- **Revenue Metrics**: Monthly, quarterly, yearly revenue
- **Patient Statistics**: Registration trends, demographics
- **Appointment Analytics**: Booking patterns, no-show rates
- **Staff Performance**: Doctor productivity metrics

### Report Types
- **Financial Reports**: Revenue, payments, outstanding invoices
- **Patient Reports**: Demographics, treatment history
- **Operational Reports**: Appointment efficiency, resource utilization
- **Compliance Reports**: Audit trails, regulatory compliance

### Export Formats
- **PDF Reports**: Formatted documents with charts
- **Excel Exports**: Data analysis and manipulation
- **CSV Downloads**: Raw data for external analysis
- **Chart Visualizations**: Interactive graphs and charts

---

## 🐳 Docker Configuration

### Docker Compose Setup
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
  
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
    depends_on:
      - mysql
  
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=catms
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

volumes:
  mysql_data:
```

### Dockerfile Configuration
- **Multi-stage Builds**: Optimized production images
- **Security**: Non-root user execution
- **Performance**: Layer caching and optimization
- **Health Checks**: Container health monitoring

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- MySQL 8.0+
- Docker and Docker Compose (optional)
- Git

### Local Development Setup

#### 1. Clone Repository
```bash
git clone <repository-url>
cd Marga.lk
```

#### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure .env with your database credentials
npm run dev
```

#### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

#### 4. Database Setup
```bash
# Create database
mysql -u root -p
CREATE DATABASE marga_lk;
USE marga_lk;

# Run schema
source database/schema.sql

# Seed initial data
cd backend
npm run seed
```

### Docker Setup
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 🔄 Development Workflow

### Code Organization
- **Feature-based Structure**: Components grouped by functionality
- **Separation of Concerns**: Clear separation between UI, business logic, and data
- **Type Safety**: Comprehensive TypeScript usage
- **Code Standards**: ESLint and Prettier configuration

### Git Workflow
- **Feature Branches**: Development in isolated branches
- **Pull Requests**: Code review process
- **Commit Standards**: Conventional commit messages
- **Version Tags**: Semantic versioning

### Testing Strategy
- **Unit Tests**: Component and function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full user workflow testing
- **Performance Tests**: Load and stress testing

---

## 🌐 Deployment

### Production Environment
- **Environment Variables**: Secure configuration management
- **Database**: Production MySQL with backups
- **File Storage**: Cloud storage for uploads
- **CDN**: Static asset delivery
- **SSL**: HTTPS encryption

### Deployment Options
1. **Traditional VPS**: Manual deployment on Linux server
2. **Cloud Platforms**: AWS, Google Cloud, Azure
3. **Container Orchestration**: Kubernetes deployment
4. **Serverless**: AWS Lambda, Vercel, Netlify

### Monitoring & Maintenance
- **Application Monitoring**: Error tracking and performance
- **Database Monitoring**: Query performance and health
- **Security Monitoring**: Intrusion detection and prevention
- **Backup Strategy**: Automated database and file backups

---

## 🔧 Troubleshooting

### Common Issues

#### Frontend Issues
- **CSS Loading Errors**: Clear Vite cache and restart
- **Module Resolution**: Check import paths and dependencies
- **Build Failures**: Verify TypeScript configuration
- **Theme Issues**: Check Material UI theme configuration

#### Backend Issues
- **Database Connection**: Verify MySQL credentials and connection
- **Authentication Errors**: Check JWT secret and token expiration
- **File Upload Issues**: Verify Multer configuration and permissions
- **CORS Errors**: Check CORS middleware configuration

#### Docker Issues
- **Container Startup**: Check Docker logs and port conflicts
- **Volume Mounting**: Verify file permissions and paths
- **Network Issues**: Check Docker network configuration
- **Resource Limits**: Monitor container resource usage

### Debugging Tools
- **Browser DevTools**: Frontend debugging and network monitoring
- **Node.js Debugger**: Backend debugging and profiling
- **Database Tools**: MySQL Workbench, phpMyAdmin
- **Docker Tools**: Docker Desktop, Portainer

### Performance Optimization
- **Frontend**: Code splitting, lazy loading, image optimization
- **Backend**: Database indexing, query optimization, caching
- **Database**: Connection pooling, query optimization
- **Infrastructure**: CDN, load balancing, horizontal scaling

---

## 📚 Additional Resources

### Documentation Links
- [React Documentation](https://react.dev/)
- [Material UI Documentation](https://mui.com/)
- [Express.js Documentation](https://expressjs.com/)
- [Sequelize Documentation](https://sequelize.org/)
- [Docker Documentation](https://docs.docker.com/)

### Best Practices
- **Security**: OWASP guidelines, secure coding practices
- **Performance**: Web performance optimization techniques
- **Accessibility**: WCAG compliance and inclusive design
- **Maintainability**: Clean code principles and documentation

### Future Enhancements
- **Mobile App**: React Native mobile application
- **Telemedicine**: Video consultation integration
- **AI Integration**: Predictive analytics and diagnosis assistance
- **Blockchain**: Secure medical record management
- **IoT Integration**: Medical device connectivity

---

## 📞 Support & Contact

For technical support, feature requests, or bug reports:
- **Email**: support@marga.lk
- **Documentation**: [Project Wiki](link-to-wiki)
- **Issue Tracker**: [GitHub Issues](link-to-issues)
- **Community**: [Discord Server](link-to-discord)

---

*This documentation is maintained and updated regularly. Last updated: October 2024*
