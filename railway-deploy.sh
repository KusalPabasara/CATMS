#!/bin/bash
# Railway deployment script

echo "🚀 Starting CATMS deployment on Railway..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Run database migrations
echo "🗄️ Running database migrations..."
cd backend
npx sequelize-cli db:migrate || echo "No migrations found, continuing..."

# Seed initial data
echo "🌱 Seeding initial data..."
npm run seed || echo "Seeding completed or skipped"

echo "✅ Deployment preparation complete!"
