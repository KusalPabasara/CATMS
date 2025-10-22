# Marga.lk Database Export - Instructions for Setup

## 📋 Database Export Information
- **File**: `catms_database_export.sql`
- **Size**: 42KB
- **Database**: catms_db
- **Export Date**: October 20, 2025
- **MySQL Version**: 8.0.43

## 🗄️ Database Contents
The export includes:
- **15 INSERT statements** with sample data
- **Complete table structure** for all tables
- **Sample users, patients, appointments, and treatments**
- **All relationships and constraints**

### 📊 Sample Data Included:
- **Users**: Admin, Doctor, Test User accounts
- **Patients**: 11 sample patients including "Kusal Test" (kusal@gmail.com / kusal123)
- **Appointments**: 3 appointments (2 pending, 1 scheduled)
- **Staff**: Doctors, nurses, receptionist
- **Treatments**: General consultation, blood test, X-ray
- **Branches**: Main clinic locations

## 🚀 Setup Instructions for Your Friend

### 1. Prerequisites
```bash
# Install MySQL 8.0+ on their system
sudo apt update
sudo apt install mysql-server
```

### 2. Create Database
```sql
-- Login to MySQL as root
mysql -u root -p

-- Create the database
CREATE DATABASE catms_db;
USE catms_db;

-- Import the data
SOURCE /path/to/catms_database_export.sql;
```

### 3. Create User (Optional)
```sql
-- Create a dedicated user for the application
CREATE USER 'catms_user'@'localhost' IDENTIFIED BY 'catms_password';
GRANT ALL PRIVILEGES ON catms_db.* TO 'catms_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Update Environment Variables
Create a `.env` file in the backend directory:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=catms_db
DB_USER=root
DB_PASSWORD=your_mysql_root_password
# OR use the dedicated user:
# DB_USER=catms_user
# DB_PASSWORD=catms_password

# JWT Secret (generate a new one for security)
JWT_SECRET=your_jwt_secret_here

# Other required variables
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

## 🔐 Test Accounts Available

### Admin Account
- **Email**: admin@catms.com
- **Password**: admin123
- **Role**: System Administrator

### Doctor Account
- **Email**: doctor@catms.com
- **Password**: doctor123
- **Role**: Doctor

### Patient Account
- **Email**: kusal@gmail.com
- **Password**: kusal123
- **Role**: Patient

## 📝 Notes
- The database includes the latest schema with appointment approval workflow
- All recent migrations have been applied
- Profile pictures and file uploads are included
- The export is ready for immediate use with the Marga.lk application

## 🔧 Troubleshooting
If your friend encounters issues:
1. Ensure MySQL 8.0+ is installed
2. Check that the database user has proper permissions
3. Verify the `.env` file has correct database credentials
4. Make sure the backend can connect to the database before starting the frontend

## 📞 Support
If there are any issues with the database setup, they can refer to the project documentation or contact you for assistance.
