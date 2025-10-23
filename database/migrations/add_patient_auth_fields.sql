-- Migration: Add authentication fields to patients table
-- Date: 2025-10-22
-- Description: Adds last_login and is_active columns to support authentication tracking
-- Note: password_hash column already exists in the schema

-- Add last_login column to track last successful login (if not exists)
SET @exist := (SELECT COUNT(*) FROM information_schema.columns 
               WHERE table_schema = DATABASE() AND table_name = 'patients' 
               AND column_name = 'last_login');
SET @sqlstmt := IF(@exist > 0, 'SELECT ''Column last_login already exists'' AS status', 
                   'ALTER TABLE patients ADD COLUMN last_login TIMESTAMP NULL AFTER active');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add is_active column for account activation status (if not exists)
SET @exist := (SELECT COUNT(*) FROM information_schema.columns 
               WHERE table_schema = DATABASE() AND table_name = 'patients' 
               AND column_name = 'is_active');
SET @sqlstmt := IF(@exist > 0, 'SELECT ''Column is_active already exists'' AS status', 
                   'ALTER TABLE patients ADD COLUMN is_active BOOLEAN DEFAULT TRUE NOT NULL AFTER last_login');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index on email for faster authentication lookups (if not exists)
-- Check and create index only if it doesn't exist
SET @exist := (SELECT COUNT(*) FROM information_schema.statistics 
               WHERE table_schema = DATABASE() AND table_name = 'patients' 
               AND index_name = 'idx_patients_email');
SET @sqlstmt := IF(@exist > 0, 'SELECT ''Index idx_patients_email already exists'' AS status', 
                   'CREATE INDEX idx_patients_email ON patients(email)');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index on is_active for filtering active accounts (if not exists)
SET @exist := (SELECT COUNT(*) FROM information_schema.statistics 
               WHERE table_schema = DATABASE() AND table_name = 'patients' 
               AND index_name = 'idx_patients_is_active');
SET @sqlstmt := IF(@exist > 0, 'SELECT ''Index idx_patients_is_active already exists'' AS status', 
                   'CREATE INDEX idx_patients_is_active ON patients(is_active)');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing records to set is_active to TRUE
UPDATE patients SET is_active = TRUE WHERE is_active IS NULL;

-- Verify the changes
SELECT 'Migration completed successfully' AS status;
