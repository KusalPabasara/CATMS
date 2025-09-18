# CATMS Deployment Guide

This guide covers containerizing and deploying the CATMS (Clinical Appointment and Treatment Management System) application with persistent data storage and CI/CD pipeline support.

## 🏗️ Architecture Overview

The application consists of:
- **Frontend**: React + TypeScript + Vite (served via Nginx)
- **Backend**: Node.js + Express + TypeScript + Sequelize
- **Database**: MySQL 8.0 with persistent volumes
- **Reverse Proxy**: Nginx (optional)
- **Cache**: Redis (optional)

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Git
- 4GB+ RAM available
- 10GB+ disk space

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd catms
cp env.production.example .env.production
```

### 2. Configure Environment

Edit `.env.production` with your production values:

```bash
# Database Configuration
MYSQL_ROOT_PASSWORD=your_secure_root_password
MYSQL_DATABASE=catms_db
MYSQL_USER=catms_user
MYSQL_PASSWORD=your_secure_password

# Application Configuration
JWT_SECRET=your_super_secure_jwt_secret
FRONTEND_API_URL=http://your-domain.com
```

### 3. Deploy

```bash
# Make deployment script executable
chmod +x scripts/deploy.sh

# Deploy to production
./scripts/deploy.sh production

# Or deploy to development
./scripts/deploy.sh dev
```

## 🐳 Docker Compose Files

### Production (`docker-compose.prod.yml`)
- Multi-stage builds for optimized images
- Persistent volumes for data
- Health checks for all services
- Security headers and rate limiting
- Resource limits and restart policies

### Development (`docker-compose.dev.yml`)
- Hot reloading for development
- Volume mounts for live code changes
- Debug-friendly configurations

### Testing (`docker-compose.test.yml`)
- Isolated test environment
- Test-specific database
- Clean state for each test run

## 📊 Persistent Data

The following data is persisted across container restarts:

### Database
- **Volume**: `mysql_data`
- **Location**: `/var/lib/mysql`
- **Backup**: Automatic backups in `./backups/`

### File Uploads
- **Volume**: `backend_uploads`
- **Location**: `/app/uploads`
- **Content**: Profile pictures, medical documents

### Logs
- **Backend Logs**: `backend_logs` volume
- **Nginx Logs**: `nginx_logs` volume
- **MySQL Logs**: `mysql_logs` volume

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `MYSQL_ROOT_PASSWORD` | MySQL root password | `rootpassword` |
| `MYSQL_DATABASE` | Database name | `catms_db` |
| `MYSQL_USER` | Database user | `catms_user` |
| `MYSQL_PASSWORD` | Database password | `catms_password` |
| `JWT_SECRET` | JWT signing secret | `supersecurejwt` |
| `FRONTEND_API_URL` | Frontend API URL | `http://localhost:5000` |

### Ports

| Service | Internal Port | External Port | Description |
|---------|---------------|---------------|-------------|
| Frontend | 80 | 80 | Web interface |
| Backend | 5000 | 5000 | API server |
| MySQL | 3306 | 3306 | Database |
| Nginx | 80 | 8080 | Reverse proxy |
| Redis | 6379 | 6379 | Cache (optional) |

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The CI/CD pipeline includes:

1. **Test Stage**
   - Unit tests for backend and frontend
   - Integration tests with test database
   - Code quality checks

2. **Security Stage**
   - Vulnerability scanning with Trivy
   - Dependency security audit
   - Container image scanning

3. **Build Stage**
   - Multi-stage Docker builds
   - Image optimization
   - Registry push

4. **Deploy Stage**
   - Production deployment
   - Health checks
   - Rollback capability

### Pipeline Triggers

- **Push to main**: Full CI/CD pipeline
- **Pull Request**: Test and security scan only
- **Manual**: Deploy to staging

## 🏥 Health Monitoring

### Health Check Endpoints

- **Backend**: `GET /health`
- **Frontend**: `GET /` (Nginx health check)
- **Database**: MySQL ping check
- **Nginx**: `GET /health`

### Monitoring Commands

```bash
# Check all services
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check specific service
docker-compose -f docker-compose.prod.yml logs backend

# Health check
curl http://localhost:5000/health
```

## 🔒 Security Features

### Container Security
- Non-root user execution
- Read-only filesystems where possible
- Minimal base images (Alpine Linux)
- Security headers via Nginx

### Network Security
- Internal Docker networks
- Rate limiting on API endpoints
- CORS configuration
- Request size limits

### Data Security
- Encrypted database connections
- Secure password hashing (bcrypt)
- JWT token authentication
- File upload restrictions

## 📈 Scaling

### Horizontal Scaling

```yaml
# Scale backend services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Use load balancer
# Configure Nginx upstream with multiple backend instances
```

### Vertical Scaling

```yaml
# In docker-compose.prod.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
```

## 🗄️ Database Management

### Backup

```bash
# Manual backup
docker-compose -f docker-compose.prod.yml exec mysql mysqldump -u root -p catms_db > backup.sql

# Automated backup (included in deployment script)
./scripts/deploy.sh production
```

### Migration

```bash
# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npm run migrate

# Seed initial data
docker-compose -f docker-compose.prod.yml exec backend npm run seed
```

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check port usage
   netstat -tulpn | grep :5000
   
   # Change ports in .env file
   ```

2. **Database connection issues**
   ```bash
   # Check database logs
   docker-compose -f docker-compose.prod.yml logs mysql
   
   # Test connection
   docker-compose -f docker-compose.prod.yml exec mysql mysql -u root -p
   ```

3. **Permission issues**
   ```bash
   # Fix upload directory permissions
   docker-compose -f docker-compose.prod.yml exec backend chown -R nodejs:nodejs /app/uploads
   ```

### Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs

# Specific service
docker-compose -f docker-compose.prod.yml logs backend

# Follow logs
docker-compose -f docker-compose.prod.yml logs -f backend
```

## 🔄 Updates and Maintenance

### Application Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and deploy
./scripts/deploy.sh production
```

### Database Updates

```bash
# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npm run migrate

# Backup before major updates
./scripts/deploy.sh production  # Includes backup
```

### System Updates

```bash
# Update Docker images
docker-compose -f docker-compose.prod.yml pull

# Rebuild with latest base images
docker-compose -f docker-compose.prod.yml build --no-cache
```

## 📞 Support

For deployment issues:
1. Check logs: `docker-compose logs`
2. Verify environment variables
3. Check port availability
4. Review this documentation

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] Database passwords secured
- [ ] SSL certificates configured (if using HTTPS)
- [ ] Backup strategy implemented
- [ ] Monitoring setup
- [ ] Health checks working
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Log rotation configured
- [ ] Resource limits set
