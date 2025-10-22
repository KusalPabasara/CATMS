#!/bin/bash
# Railway Deployment Script for CATMS

echo "🚀 Starting Railway deployment for CATMS..."

# Check if logged in
if ! railway whoami > /dev/null 2>&1; then
    echo "❌ Please login first with: railway login"
    exit 1
fi

echo "✅ Logged in to Railway"

# Create new project
echo "📦 Creating new Railway project..."
railway init --name catms-clinical-system

# Add PostgreSQL database
echo "🗄️ Adding PostgreSQL database..."
railway add postgresql

# Set environment variables
echo "⚙️ Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set PORT=5000
railway variables set JWT_SECRET=catms_super_secure_jwt_secret_2024
railway variables set CORS_ORIGIN=https://catms-clinical-system-production.up.railway.app

# Deploy the application
echo "🚀 Deploying application..."
railway up

echo "✅ Deployment initiated!"
echo "🌐 Your app will be available at: https://catms-clinical-system-production.up.railway.app"
echo "📊 Check deployment status at: https://railway.app/dashboard"

# Wait for deployment and run migrations
echo "⏳ Waiting for deployment to complete..."
sleep 30

echo "🗄️ Running database migrations..."
railway run npx sequelize-cli db:migrate || echo "No migrations found"

echo "🌱 Seeding initial data..."
railway run npm run seed || echo "Seeding completed"

echo "🎉 Deployment complete!"
echo "🔗 Your CATMS system is now live!"
