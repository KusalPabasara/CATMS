# CATMS - Clinical Appointment and Treatment Management System

A comprehensive healthcare management system built with modern web technologies, featuring patient management, appointment scheduling, treatment tracking, and billing capabilities.

## Features

- **Patient Management**: Complete patient profiles with medical history
- **Appointment Scheduling**: Doctor-patient appointment booking system
- **Treatment Tracking**: Medical treatment records and progress monitoring
- **Billing & Invoicing**: Automated invoice generation and payment tracking
- **User Management**: Role-based access control for staff
- **Medical Documents**: Secure document storage and management
- **Notifications**: Email and SMS reminders
- **Reports**: Comprehensive reporting and analytics
- **Audit Logs**: Complete activity tracking for compliance

## Architecture

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript + Sequelize ORM
- **Database**: MySQL 8.0 with persistent storage
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions with automated testing and deployment

## Quick Start

### Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KusalPabasara/CATMS.git
   cd CATMS
   ```

2. **Configure environment**
   ```bash
   cp env.production.example .env.production
   # Edit .env.production with your configuration
   ```

3. **Deploy with Docker**
   ```bash
   # Make scripts executable
   chmod +x scripts/*.sh
   
   # Deploy to production
   make deploy
   
   # Or start development
   make dev
   ```

4. **Access the application**
   - Frontend: http://localhost:80
   - Backend API: http://localhost:5000
   - Nginx Proxy: http://localhost:8080

## Available Commands

```bash
# Development
make dev          # Start development environment
make dev-down     # Stop development environment
make dev-logs     # View development logs

# Production
make prod         # Start production environment
make prod-down    # Stop production environment
make prod-logs    # View production logs

# Testing
make test         # Start test environment
make test-down    # Stop test environment

# Deployment
make deploy       # Deploy to production
make build        # Build all images
make pull         # Pull latest images

# Database
make backup       # Create database backup
make restore      # Show restore options
make migrate      # Run database migrations

# Maintenance
make clean        # Clean up containers and images
make logs         # View all logs
make status       # Show service status
make health       # Check service health
```

## Configuration

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

| Service | Internal Port | External Port |
|---------|---------------|---------------|
| Frontend | 80 | 80 |
| Backend | 5000 | 5000 |
| MySQL | 3306 | 3306 |
| Nginx | 80 | 8080 |
| Redis | 6379 | 6379 |

## Docker Services

- **mysql**: MySQL 8.0 database with persistent storage
- **backend**: Node.js API server with TypeScript
- **frontend**: React frontend served by Nginx
- **nginx**: Reverse proxy with load balancing
- **redis**: Cache server for sessions and data

## Security Features

- Non-root container execution
- Security headers via Nginx
- Rate limiting on API endpoints
- Input validation and sanitization
- JWT token authentication
- Encrypted database connections
- File upload restrictions
- Health monitoring and logging

## Persistent Data

The following data is persisted across container restarts:

- **Database**: MySQL data in `mysql_data` volume
- **File Uploads**: User uploads in `backend_uploads` volume
- **Logs**: Application logs in `backend_logs` volume
- **Cache**: Redis data in `redis_data` volume

## CI/CD Pipeline

The project includes a complete CI/CD pipeline with:

- **Automated Testing**: Unit and integration tests
- **Security Scanning**: Vulnerability scanning with Trivy
- **Image Building**: Multi-stage Docker builds
- **Registry Push**: Automated image publishing
- **Production Deployment**: Automated deployment with health checks

## Project Structure

```
CATMS/
├── backend/                 # Node.js API server
│   ├── auth/               # Authentication modules
│   ├── controllers/        # API controllers
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   └── utils/              # Utility functions
├── frontend/               # React frontend
│   ├── src/                # Source code
│   ├── public/             # Static assets
│   └── dist/               # Build output
├── database/               # Database files
│   ├── schema.sql          # Database schema
│   └── migrations/         # Migration scripts
├── nginx/                  # Nginx configuration
├── scripts/                # Deployment scripts
├── .github/workflows/      # CI/CD pipeline
├── docker-compose.prod.yml # Production environment
├── docker-compose.dev.yml  # Development environment
└── docker-compose.test.yml # Testing environment
```

## 🛠Development

### Backend Development

```bash
cd backend
npm install
npm run dev
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Database Management

```bash
# Run migrations
make migrate

# Create backup
make backup

# Restore from backup
make restore
```

## API Documentation

The API documentation is available at `/api/docs` when running the application.

### Key Endpoints

- `POST /api/auth/login` - User authentication
- `GET /api/patients` - List patients
- `POST /api/appointments` - Create appointment
- `GET /api/treatments` - List treatments
- `POST /api/invoices` - Create invoice
- `GET /api/reports` - Generate reports

## Troubleshooting

### Common Issues

1. **Port conflicts**: Check if ports 80, 5000, 3306 are available
2. **Database connection**: Verify MySQL is running and credentials are correct
3. **Permission issues**: Check file permissions for upload directories

### Logs

```bash
# View all logs
make logs

# View specific service logs
docker-compose -f docker-compose.prod.yml logs backend
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- React team for the excellent frontend framework
- Node.js community for backend tools
- Docker team for containerization platform
- MySQL team for the robust database system

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section
- Review the deployment documentation

