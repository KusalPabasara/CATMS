-- Add password_hash, first_name, last_name to patients table
ALTER TABLE patients
ADD COLUMN first_name VARCHAR(25) GENERATED ALWAYS AS (SUBSTRING_INDEX(full_name, ' ', 1)) STORED,
ADD COLUMN last_name VARCHAR(25) GENERATED ALWAYS AS (
    CASE 
        WHEN CHAR_LENGTH(full_name) - CHAR_LENGTH(REPLACE(full_name, ' ', '')) > 0 
        THEN SUBSTRING(full_name, CHAR_LENGTH(SUBSTRING_INDEX(full_name, ' ', 1)) + 2)
        ELSE NULL
    END
) STORED,
ADD COLUMN password_hash VARCHAR(255) AFTER email;

-- Update existing records to split full_name
UPDATE patients 
SET first_name = SUBSTRING_INDEX(full_name, ' ', 1),
    last_name = CASE 
        WHEN CHAR_LENGTH(full_name) - CHAR_LENGTH(REPLACE(full_name, ' ', '')) > 0 
        THEN SUBSTRING(full_name, CHAR_LENGTH(SUBSTRING_INDEX(full_name, ' ', 1)) + 2)
        ELSE NULL
    END;

-- Add email uniqueness constraint
ALTER TABLE patients
MODIFY COLUMN email VARCHAR(100) UNIQUE;