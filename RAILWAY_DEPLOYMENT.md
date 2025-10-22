# Railway Deployment Commands for CATMS

## Quick Deployment Steps:

1. **Login to Railway:**
   ```bash
   railway login
   ```

2. **Create Project:**
   ```bash
   railway init --name catms-clinical-system
   ```

3. **Add PostgreSQL Database:**
   ```bash
   railway add postgresql
   ```

4. **Set Environment Variables:**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set PORT=5000
   railway variables set JWT_SECRET=catms_super_secure_jwt_secret_2024
   ```

5. **Deploy:**
   ```bash
   railway up
   ```

6. **Run Migrations (after deployment):**
   ```bash
   railway run npx sequelize-cli db:migrate
   ```

7. **Seed Data:**
   ```bash
   railway run npm run seed
   ```

## Alternative: Use the automated script
```bash
./deploy-to-railway.sh
```

## Test Credentials:
- Admin: admin@catms.com / admin123
- Doctor: doctor@catms.com / doctor123

## Health Check:
- https://your-app-name.up.railway.app/health
