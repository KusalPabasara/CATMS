-- Create the database
CREATE DATABASE IF NOT EXISTS catms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE catms_db;

-- ---------------------
-- 1. Branches
-- ---------------------
CREATE TABLE branches (
    branch_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    UNIQUE(name)
);

-- ---------------------
-- 2. Roles
-- ---------------------
CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Seed roles
INSERT INTO roles (name) VALUES 
('System Administrator'),
('Branch Manager'),
('Doctor'),
('Receptionist'),
('Billing Staff'),
('Patient');

-- ---------------------
-- 3. Users
-- System & staff accounts
-- ---------------------
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    branch_id INT,
    role_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE SET NULL,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
);

-- ---------------------
-- 4. Specialties (for doctors)
-- ---------------------
CREATE TABLE specialties (
    specialty_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- Doctor specialties mapping (many-to-many)
CREATE TABLE doctor_specialties (
    user_id INT,
    specialty_id INT,
    PRIMARY KEY (user_id, specialty_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (specialty_id) REFERENCES specialties(specialty_id) ON DELETE CASCADE
);

-- ---------------------
-- 5. Patients
-- ---------------------
CREATE TABLE patients (
    patient_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    national_id VARCHAR(20) UNIQUE,
    dob DATE,
    gender ENUM('Male', 'Female', 'Other'),
    blood_type VARCHAR(3),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    insurance_provider VARCHAR(100),
    insurance_policy_number VARCHAR(50),
    allergies TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------
-- 6. Appointments
-- ---------------------
CREATE TABLE appointments (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    branch_id INT NOT NULL,
    appointment_date DATETIME NOT NULL,
    status ENUM('Scheduled', 'Completed', 'Cancelled', 'No-Show') DEFAULT 'Scheduled',
    is_walkin BOOLEAN DEFAULT FALSE,
    reason TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES users(user_id),
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- Index to prevent double booking
CREATE UNIQUE INDEX idx_unique_appointment
ON appointments(doctor_id, appointment_date);

-- ---------------------
-- 7. Treatments
-- ---------------------
CREATE TABLE treatments (
    treatment_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    cost DECIMAL(10,2) NOT NULL,
    duration INT,
    category VARCHAR(100),
    icd10_code VARCHAR(20),
    cpt_code VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE
);

-- ---------------------
-- 8. Treatment Records
-- ---------------------
CREATE TABLE treatment_records (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL,
    doctor_id INT NOT NULL,
    treatment_id INT NOT NULL,
    notes TEXT,
    prescription TEXT,
    image_url TEXT,
    digitally_signed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(user_id),
    FOREIGN KEY (treatment_id) REFERENCES treatments(treatment_id)
);

-- ---------------------
-- 9. Invoice / Billing
-- ---------------------
CREATE TABLE invoices (
    invoice_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    appointment_id INT,
    branch_id INT,
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0.0,
    due_date DATE,
    status ENUM('Pending', 'Partially Paid', 'Paid', 'Refunded') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id),
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
);

-- ---------------------
-- 10. Payments
-- ---------------------
CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    method ENUM('Cash', 'Card', 'Bank Transfer', 'Mobile Wallet') NOT NULL,
    transaction_id VARCHAR(100),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id)
);

-- ---------------------
-- 11. Insurance Claims
-- ---------------------
CREATE TABLE insurance_claims (
    claim_id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    provider_name VARCHAR(100),
    claim_status ENUM('Submitted', 'Paid', 'Rejected', 'Pending') DEFAULT 'Pending',
    submitted_at DATETIME,
    processed_at DATETIME,
    response_notes TEXT,
    FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id)
);

-- ---------------------
-- 12. Staff Schedule
-- ---------------------
CREATE TABLE staff_schedule (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    branch_id INT NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
);

-- ---------------------
-- 13. Audit Logs (Critical user actions)
-- ---------------------
CREATE TABLE audit_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(255),
    ip_address VARCHAR(45),
    target_table VARCHAR(50),
    target_id INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- ---------------------
-- 14. System Configurations (Payments, Timeouts)
-- ---------------------
CREATE TABLE system_settings (
    setting_id INT AUTO_INCREMENT PRIMARY KEY,
    key_name VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL
);

-- ---------------------
-- TRIGGERS / Example
-- Prevent doctor double-booking within 30 mins
-- ---------------------
DELIMITER ;
-- Additional rules and stored procedures can be added later

-- ---------------------
-- INDEXES
-- ---------------------
CREATE INDEX idx_patients_name ON patients(full_name);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_treatment_records_doc ON treatment_records(doctor_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- Done ✨