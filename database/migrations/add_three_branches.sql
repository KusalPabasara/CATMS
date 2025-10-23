-- Add 3 branches (Colombo, Kandy, Galle) to the database
-- This migration adds the required branches for the application

-- Insert the 3 branches
INSERT INTO branches (name, location, phone, email) VALUES 
('Main Clinic', 'Colombo', '011-2345678', 'colombo@medsync.lk'),
('Kandy Branch', 'Kandy', '081-2345678', 'kandy@medsync.lk'),
('Galle Branch', 'Galle', '091-2345678', 'galle@medsync.lk')
ON DUPLICATE KEY UPDATE 
location = VALUES(location),
phone = VALUES(phone),
email = VALUES(email);

-- Verify the branches were inserted
SELECT * FROM branches ORDER BY branch_id;
