#!/bin/bash

echo "🔧 Setting up CATMS Database..."

# Check if MySQL is running
if ! systemctl is-active --quiet mysql; then
    echo "❌ MySQL is not running. Please start MySQL first."
    exit 1
fi

echo "✅ MySQL is running"

# Create database and user
echo "📊 Creating database and user..."
mysql -u root -pWEB@2024 << EOF
CREATE DATABASE IF NOT EXISTS catms_db;
CREATE USER IF NOT EXISTS 'catms_user'@'localhost' IDENTIFIED BY 'catms_password_2024';
GRANT ALL PRIVILEGES ON catms_db.* TO 'catms_user'@'localhost';
FLUSH PRIVILEGES;
EOF

if [ $? -eq 0 ]; then
    echo "✅ Database and user created successfully!"
    
    # Update .env file
    echo "🔧 Updating .env file..."
    cat > .env << EOF
DB_NAME=catms_db
DB_USER=catms_user
DB_PASSWORD=catms_password_2024
DB_HOST=localhost
DB_PORT=3306
EOF
    
    echo "✅ .env file updated!"
    echo "📋 Database credentials:"
    echo "   Database: catms_db"
    echo "   User: catms_user"
    echo "   Password: catms_password_2024"
    echo ""
    echo "🚀 You can now run: npm run sync"
else
    echo "❌ Failed to create database. Please check MySQL permissions."
    exit 1
fi
