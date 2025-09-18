-- Final Database Schema Update to Match ER Diagram
-- This migration will safely update the existing schema

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Create branch table
CREATE TABLE IF NOT EXISTS branch (
    branch_id INT AUTO_INCREMENT PRIMARY KEY,
    branch_name VARCHAR(20) NULL,
    location VARCHAR(20) NULL,
    phone VARCHAR(10) NULL,
    created_at DATETIME DEFAULT (NOW()) NULL
);

-- Update patient table structure - check if columns exist first
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'patients' 
     AND COLUMN_NAME = 'first_name') = 0,
    'ALTER TABLE patients ADD COLUMN first_name VARCHAR(25) NULL AFTER patient_id',
    'SELECT "Column first_name already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'patients' 
     AND COLUMN_NAME = 'last_name') = 0,
    'ALTER TABLE patients ADD COLUMN last_name VARCHAR(25) NULL AFTER first_name',
    'SELECT "Column last_name already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'patients' 
     AND COLUMN_NAME = 'date_of_birth') = 0,
    'ALTER TABLE patients ADD COLUMN date_of_birth DATE NULL AFTER last_name',
    'SELECT "Column date_of_birth already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'patients' 
     AND COLUMN_NAME = 'emergency_contact') = 0,
    'ALTER TABLE patients ADD COLUMN emergency_contact VARCHAR(10) NULL AFTER address',
    'SELECT "Column emergency_contact already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create insurance_policy table
CREATE TABLE IF NOT EXISTS insurance_policy (
    policy_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NULL,
    provider_name VARCHAR(25) NULL,
    policy_number VARCHAR(10) NULL,
    coverage_percentage DECIMAL(5, 2) NULL,
    deductable DECIMAL(10, 2) NULL,
    expiry_date DATE DEFAULT (CURDATE()) NULL,
    is_active TINYINT(1) NULL,
    created_at DATETIME DEFAULT (NOW()) NULL,
    CONSTRAINT insurance_policy_ibfk_1
        FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
);

-- Create staff table
CREATE TABLE IF NOT EXISTS staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(25) NULL,
    last_name VARCHAR(25) NULL,
    role ENUM('Admin', 'Doctor', 'Nurse', 'Receptionist', 'Other') NOT NULL,
    speciality VARCHAR(25) NULL,
    email VARCHAR(50) NULL,
    branch_id INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NULL,
    is_active TINYINT(1) NULL,
    CONSTRAINT staff_ibfk_1
        FOREIGN KEY (branch_id) REFERENCES branch(branch_id)
);

-- Create appointment table
CREATE TABLE IF NOT EXISTS appointment (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NULL,
    doctor_id INT NULL,
    branch_id INT NULL,
    appointment_date DATE NULL,
    appointment_time TIME NULL,
    status ENUM('Scheduled', 'Completed', 'Cancelled') NULL,
    created_at DATETIME DEFAULT (NOW()) NULL,
    updated_at DATETIME DEFAULT (NOW()) NULL,
    CONSTRAINT appointment_ibfk_1
        FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    CONSTRAINT appointment_ibfk_2
        FOREIGN KEY (doctor_id) REFERENCES staff(staff_id),
    CONSTRAINT appointment_ibfk_3
        FOREIGN KEY (branch_id) REFERENCES branch(branch_id)
);

-- Create appointment_history table
CREATE TABLE IF NOT EXISTS appointment_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NULL,
    previous_status ENUM('Scheduled', 'Completed', 'Cancelled') NULL,
    new_status ENUM('Scheduled', 'Completed', 'Cancelled') NULL,
    reason TEXT NULL,
    modified_by INT NULL,
    modified_at DATETIME DEFAULT (NOW()) NULL,
    CONSTRAINT appointment_history_ibfk_1
        FOREIGN KEY (appointment_id) REFERENCES appointment(appointment_id),
    CONSTRAINT appointment_history_ibfk_2
        FOREIGN KEY (modified_by) REFERENCES staff(staff_id)
);

-- Create audit_log table
CREATE TABLE IF NOT EXISTS audit_log (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NULL,
    table_name VARCHAR(25) NULL,
    operation_type ENUM('INSERT', 'UPDATE', 'DELETE') NULL,
    record_id INT NULL,
    timestamp DATETIME NULL,
    ip_address VARCHAR(61) NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    CONSTRAINT audit_log_ibfk_1
        FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
);

-- Create invoice table
CREATE TABLE IF NOT EXISTS invoice (
    invoice_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NULL,
    appointment_id INT NULL,
    total_amount DECIMAL(10, 2) NULL,
    insurance_amount DECIMAL(10, 2) NULL,
    patient_amount DECIMAL(10, 2) NULL,
    status ENUM('Pending', 'Paid', 'Cancelled') NULL,
    created_at DATETIME DEFAULT (NOW()) NULL,
    due_date DATETIME DEFAULT (NOW()) NULL,
    CONSTRAINT invoice_ibfk_1
        FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    CONSTRAINT invoice_ibfk_2
        FOREIGN KEY (appointment_id) REFERENCES appointment(appointment_id)
);

-- Create insurance_claim table
CREATE TABLE IF NOT EXISTS insurance_claim (
    claim_id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NULL,
    policy_id INT NULL,
    claim_amount DECIMAL(10, 2) NULL,
    submission_date DATE DEFAULT (NOW()) NULL,
    claim_status ENUM('Submitted', 'Approved', 'Rejected') NULL,
    reimbursement_amount DECIMAL(10, 2) NULL,
    denial_reason TEXT NULL,
    created_at DATETIME DEFAULT (NOW()) NULL,
    CONSTRAINT insurance_claim_ibfk_1
        FOREIGN KEY (invoice_id) REFERENCES invoice(invoice_id),
    CONSTRAINT insurance_claim_ibfk_2
        FOREIGN KEY (policy_id) REFERENCES insurance_policy(policy_id)
);

-- Create payment table
CREATE TABLE IF NOT EXISTS payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NULL,
    payment_date DATETIME NULL,
    amount DECIMAL(10, 2) NULL,
    payment_method ENUM('Cash', 'Card', 'Insurance', 'Online') NULL,
    transaction_reference VARCHAR(25) NULL,
    status ENUM('Pending', 'Paid', 'Cancelled') NULL,
    notes TEXT NULL,
    CONSTRAINT payment_ibfk_1
        FOREIGN KEY (invoice_id) REFERENCES invoice(invoice_id)
);

-- Create staff_branch_access table
CREATE TABLE IF NOT EXISTS staff_branch_access (
    access_id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NULL,
    branch_id INT NULL,
    access_level ENUM('Read', 'Write', 'Admin', 'Owner') NULL,
    granted_at DATETIME DEFAULT (NOW()) NULL,
    is_active TINYINT(1) NULL,
    CONSTRAINT staff_branch_access_ibfk_1
        FOREIGN KEY (staff_id) REFERENCES staff(staff_id),
    CONSTRAINT staff_branch_access_ibfk_2
        FOREIGN KEY (branch_id) REFERENCES branch(branch_id)
);

-- Create treatment_catalogue table
CREATE TABLE IF NOT EXISTS treatment_catalogue (
    treatment_type_id INT AUTO_INCREMENT PRIMARY KEY,
    treatment_name VARCHAR(25) NULL,
    description TEXT NULL,
    icd10_code VARCHAR(7) NULL,
    cpt_code VARCHAR(5) NULL,
    standard_cost DECIMAL(10, 2) NULL,
    category VARCHAR(25) NULL,
    is_active TINYINT(1) NULL
);

-- Create treatment table
CREATE TABLE IF NOT EXISTS treatment (
    treatment_id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NULL,
    treatment_type_id INT NULL,
    consultation_notes TEXT NULL,
    prescription TEXT NULL,
    treatment_date DATETIME DEFAULT CURRENT_TIMESTAMP NULL,
    cost DECIMAL(10, 2) NULL,
    doctor_signature TEXT NULL,
    created_at DATETIME DEFAULT (NOW()) NULL,
    CONSTRAINT treatment_ibfk_1
        FOREIGN KEY (appointment_id) REFERENCES appointment(appointment_id),
    CONSTRAINT treatment_ibfk_2
        FOREIGN KEY (treatment_type_id) REFERENCES treatment_catalogue(treatment_type_id)
);

-- Create user_session table
CREATE TABLE IF NOT EXISTS user_session (
    session_id VARCHAR(128) NOT NULL PRIMARY KEY,
    staff_id INT NULL,
    login_time DATETIME NULL,
    logout_time DATETIME NULL,
    ip_address VARCHAR(61) NULL,
    status ENUM('Active', 'Expired') NULL,
    last_activity DATETIME NULL,
    CONSTRAINT user_session_ibfk_1
        FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Insert sample data
INSERT IGNORE INTO branch (branch_id, branch_name, location, phone) VALUES 
(1, 'Main Branch', 'Colombo', '0112345678'),
(2, 'Branch 2', 'Kandy', '0812345678');

INSERT IGNORE INTO staff (staff_id, first_name, last_name, role, speciality, email, branch_id, is_active) VALUES 
(1, 'Admin', 'User', 'Admin', 'Administration', 'admin@catms.com', 1, 1),
(2, 'Dr. John', 'Smith', 'Doctor', 'Cardiology', 'john.smith@catms.com', 1, 1),
(3, 'Dr. Jane', 'Doe', 'Doctor', 'Neurology', 'jane.doe@catms.com', 1, 1),
(4, 'Nurse', 'Mary', 'Nurse', 'General', 'mary.nurse@catms.com', 1, 1),
(5, 'Reception', 'Staff', 'Receptionist', 'Administration', 'reception@catms.com', 1, 1);

-- Update existing patient data
UPDATE patients SET 
    first_name = 'Kusal',
    last_name = 'Test',
    date_of_birth = '1990-01-01'
WHERE patient_id = 2;

-- Insert sample appointments
INSERT IGNORE INTO appointment (appointment_id, patient_id, doctor_id, branch_id, appointment_date, appointment_time, status) VALUES 
(1, 2, 2, 1, '2025-09-20', '09:00:00', 'Scheduled'),
(2, 2, 3, 1, '2025-09-25', '14:00:00', 'Scheduled');

-- Insert sample treatment catalogue
INSERT IGNORE INTO treatment_catalogue (treatment_type_id, treatment_name, description, icd10_code, cpt_code, standard_cost, category, is_active) VALUES 
(1, 'General Consultation', 'General medical consultation', 'Z00.00', '99213', 50.00, 'Consultation', 1),
(2, 'Blood Test', 'Complete blood count test', 'Z13.1', '85025', 25.00, 'Diagnostic', 1),
(3, 'X-Ray', 'Chest X-ray examination', 'Z87.891', '71020', 75.00, 'Imaging', 1);

-- Insert sample invoices
INSERT IGNORE INTO invoice (invoice_id, patient_id, appointment_id, total_amount, insurance_amount, patient_amount, status) VALUES 
(1, 2, 1, 50.00, 0.00, 50.00, 'Pending'),
(2, 2, 2, 100.00, 20.00, 80.00, 'Pending');

-- Insert sample treatments
INSERT IGNORE INTO treatment (treatment_id, appointment_id, treatment_type_id, consultation_notes, prescription, cost) VALUES 
(1, 1, 1, 'Patient complains of chest pain. Recommend further tests.', 'Prescribed medication for pain relief', 50.00),
(2, 2, 2, 'Blood test results show normal range', 'Continue current medication', 25.00);
