-- Create treatment_sessions table
CREATE TABLE treatment_sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    treatment_id INT NOT NULL,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    session_date DATETIME NOT NULL,
    status ENUM('scheduled', 'in-progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    notes TEXT,
    progress_scale INT CHECK (progress_scale >= 0 AND progress_scale <= 10),
    symptoms TEXT,
    vital_signs JSON,
    next_session_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (treatment_id) REFERENCES treatments(treatment_id),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES users(user_id)
);

-- Create medications table
CREATE TABLE medications (
    medication_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    prescribed_by INT NOT NULL,
    session_id INT,
    name VARCHAR(100) NOT NULL,
    dosage VARCHAR(50) NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    duration INT,
    start_date DATETIME NOT NULL,
    end_date DATETIME,
    instructions TEXT,
    side_effects TEXT,
    status ENUM('active', 'completed', 'discontinued') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (prescribed_by) REFERENCES users(user_id),
    FOREIGN KEY (session_id) REFERENCES treatment_sessions(session_id)
);

-- Create treatment_progress table
CREATE TABLE treatment_progress (
    progress_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    treatment_id INT NOT NULL,
    session_id INT NOT NULL,
    progress_date DATETIME NOT NULL,
    pain_level INT CHECK (pain_level >= 0 AND pain_level <= 10),
    mobility_level INT CHECK (mobility_level >= 0 AND mobility_level <= 10),
    symptoms TEXT,
    notes TEXT,
    complications TEXT,
    recovery_status ENUM('improving', 'stable', 'worsening', 'recovered') DEFAULT 'stable',
    next_assessment_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (treatment_id) REFERENCES treatments(treatment_id),
    FOREIGN KEY (session_id) REFERENCES treatment_sessions(session_id)
);