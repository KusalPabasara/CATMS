-- Initial data migration for CATMS
USE catms_db;

-- Insert initial specialties
INSERT IGNORE INTO specialties (name) VALUES 
('General Medicine'),
('Cardiology'),
('Dermatology'),
('Orthopedics'),
('Pediatrics'),
('Gynecology'),
('Neurology'),
('Psychiatry'),
('Ophthalmology'),
('ENT'),
('Dentistry'),
('Emergency Medicine');

-- Insert initial branches
INSERT IGNORE INTO branches (name, location, phone, email) VALUES 
('Main Branch', '123 Main Street, City Center', '+1-555-0100', 'main@catms.com'),
('North Branch', '456 North Avenue, North District', '+1-555-0101', 'north@catms.com'),
('South Branch', '789 South Road, South District', '+1-555-0102', 'south@catms.com');

-- Insert system settings
INSERT IGNORE INTO system_settings (key_name, value) VALUES 
('appointment_duration', '30'),
('max_appointments_per_day', '50'),
('payment_terms_days', '30'),
('notification_retry_attempts', '3'),
('file_upload_max_size', '10485760'),
('session_timeout_minutes', '480'),
('backup_retention_days', '30');

-- Insert initial treatments
INSERT IGNORE INTO treatments (name, description, cost, duration, category, is_active) VALUES 
('General Consultation', 'Basic medical consultation', 50.00, 30, 'Consultation', TRUE),
('Follow-up Visit', 'Follow-up medical consultation', 30.00, 20, 'Consultation', TRUE),
('Blood Test', 'Complete blood count and basic tests', 25.00, 15, 'Laboratory', TRUE),
('X-Ray', 'Basic X-ray examination', 75.00, 30, 'Imaging', TRUE),
('ECG', 'Electrocardiogram', 40.00, 20, 'Cardiology', TRUE),
('Ultrasound', 'Basic ultrasound examination', 100.00, 45, 'Imaging', TRUE),
('Vaccination', 'Standard vaccination', 35.00, 15, 'Preventive', TRUE),
('Minor Surgery', 'Minor surgical procedure', 200.00, 60, 'Surgery', TRUE);
