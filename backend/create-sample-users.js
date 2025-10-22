const mysql = require('mysql2/promise');

async function addSampleUsers() {
  try {
    // Connect to database using the same config as the backend
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'catms_db'
    });

    console.log('Connected to database');

    // Add Nurse role
    await connection.execute(`
      INSERT INTO roles (name) VALUES ('Nurse') 
      ON DUPLICATE KEY UPDATE name = name
    `);

    // Add staff_title column if it doesn't exist
    try {
      await connection.execute(`
        ALTER TABLE users ADD COLUMN staff_title VARCHAR(100)
      `);
      console.log('Added staff_title column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('staff_title column already exists');
      } else {
        throw error;
      }
    }

    // Update existing users with staff titles
    await connection.execute(`
      UPDATE users SET staff_title = 'Doctor' 
      WHERE role_id = (SELECT role_id FROM roles WHERE name = 'Doctor')
    `);

    await connection.execute(`
      UPDATE users SET staff_title = 'Branch Manager' 
      WHERE role_id = (SELECT role_id FROM roles WHERE name = 'Branch Manager')
    `);

    await connection.execute(`
      UPDATE users SET staff_title = 'Receptionist' 
      WHERE role_id = (SELECT role_id FROM roles WHERE name = 'Receptionist')
    `);

    // Create branch managers for each branch
    const branchManagers = [
      [1, 'Sarah Johnson', 'sarah.johnson@medsync.lk', '+94 77 123 4001'],
      [2, 'Rajesh Kumar', 'rajesh.kumar@medsync.lk', '+94 77 123 4002'],
      [3, 'Nimal Fernando', 'nimal.fernando@medsync.lk', '+94 77 123 4003']
    ];

    for (const [branchId, name, email, phone] of branchManagers) {
      await connection.execute(`
        INSERT INTO users (branch_id, role_id, full_name, email, phone, password_hash, staff_title, is_active) 
        VALUES (?, (SELECT role_id FROM roles WHERE name = 'Branch Manager'), ?, ?, ?, '$2b$10$un9h9Pc4WhoNFqPyDtywS.3VxP/tWPSnD0cHO4d79s/RgfWT3los2', 'Branch Manager', TRUE)
        ON DUPLICATE KEY UPDATE staff_title = 'Branch Manager'
      `, [branchId, name, email, phone]);
    }

    // Create nurses for each branch
    const nurses = [
      [1, 'Emma Wilson', 'emma.wilson@medsync.lk', '+94 77 123 5001'],
      [2, 'Kamala Perera', 'kamala.perera@medsync.lk', '+94 77 123 5002'],
      [3, 'Samantha Silva', 'samantha.silva@medsync.lk', '+94 77 123 5003']
    ];

    for (const [branchId, name, email, phone] of nurses) {
      await connection.execute(`
        INSERT INTO users (branch_id, role_id, full_name, email, phone, password_hash, staff_title, is_active) 
        VALUES (?, (SELECT role_id FROM roles WHERE name = 'Nurse'), ?, ?, ?, '$2b$10$un9h9Pc4WhoNFqPyDtywS.3VxP/tWPSnD0cHO4d79s/RgfWT3los2', 'Nurse', TRUE)
      `, [branchId, name, email, phone]);
    }

    // Create non-medical staff
    const nonMedicalStaff = [
      [1, 'David Brown', 'david.brown@medsync.lk', '+94 77 123 6001'],
      [2, 'Lakshmi Devi', 'lakshmi.devi@medsync.lk', '+94 77 123 6002'],
      [3, 'James Anderson', 'james.anderson@medsync.lk', '+94 77 123 6003']
    ];

    for (const [branchId, name, email, phone] of nonMedicalStaff) {
      await connection.execute(`
        INSERT INTO users (branch_id, role_id, full_name, email, phone, password_hash, staff_title, is_active) 
        VALUES (?, (SELECT role_id FROM roles WHERE name = 'Receptionist'), ?, ?, ?, '$2b$10$un9h9Pc4WhoNFqPyDtywS.3VxP/tWPSnD0cHO4d79s/RgfWT3los2', 'Receptionist', TRUE)
      `, [branchId, name, email, phone]);
    }

    console.log('Sample users created successfully');
    await connection.end();

  } catch (error) {
    console.error('Failed to create sample users:', error);
  }
}

addSampleUsers();
