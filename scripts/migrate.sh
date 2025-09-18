#!/bin/bash

echo "🔄 Running schema creation..."

mysql -u root -p catms_db < ../database/schema.sql

echo "✅ Database schema applied successfully!"