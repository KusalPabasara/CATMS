# CATMS Makefile
# Provides convenient commands for development and deployment

.PHONY: help build up down logs clean test deploy backup restore

# Default target
help:
	@echo "CATMS Management Commands:"
	@echo ""
	@echo "Development:"
	@echo "  dev          Start development environment"
	@echo "  dev-down     Stop development environment"
	@echo "  dev-logs     View development logs"
	@echo ""
	@echo "Production:"
	@echo "  prod         Start production environment"
	@echo "  prod-down    Stop production environment"
	@echo "  prod-logs    View production logs"
	@echo ""
	@echo "Testing:"
	@echo "  test         Run test environment"
	@echo "  test-down    Stop test environment"
	@echo "  test-logs    View test logs"
	@echo ""
	@echo "Deployment:"
	@echo "  deploy       Deploy to production"
	@echo "  build        Build all images"
	@echo "  pull         Pull latest images"
	@echo ""
	@echo "Database:"
	@echo "  backup       Create database backup"
	@echo "  restore      Restore database from backup"
	@echo "  migrate      Run database migrations"
	@echo ""
	@echo "Maintenance:"
	@echo "  clean        Clean up containers and images"
	@echo "  logs         View all logs"
	@echo "  status       Show service status"
	@echo "  health       Check service health"

# Development commands
dev:
	@echo "Starting development environment..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Development environment started!"
	@echo "Frontend: http://localhost:5173"
	@echo "Backend: http://localhost:5000"
	@echo "Database: localhost:3307"

dev-down:
	@echo "Stopping development environment..."
	docker-compose -f docker-compose.dev.yml down

dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

# Production commands
prod:
	@echo "Starting production environment..."
	docker-compose -f docker-compose.prod.yml up -d
	@echo "Production environment started!"
	@echo "Frontend: http://localhost:80"
	@echo "Backend: http://localhost:5000"
	@echo "Nginx: http://localhost:8080"

prod-down:
	@echo "Stopping production environment..."
	docker-compose -f docker-compose.prod.yml down

prod-logs:
	docker-compose -f docker-compose.prod.yml logs -f

# Test commands
test:
	@echo "Starting test environment..."
	docker-compose -f docker-compose.test.yml up -d
	@echo "Test environment started!"
	@echo "Frontend: http://localhost:8081"
	@echo "Backend: http://localhost:5001"

test-down:
	@echo "Stopping test environment..."
	docker-compose -f docker-compose.test.yml down

test-logs:
	docker-compose -f docker-compose.test.yml logs -f

# Deployment commands
deploy:
	@echo "Deploying to production..."
	./scripts/deploy.sh production

build:
	@echo "Building all images..."
	docker-compose -f docker-compose.prod.yml build --no-cache

pull:
	@echo "Pulling latest images..."
	docker-compose -f docker-compose.prod.yml pull

# Database commands
backup:
	@echo "Creating database backup..."
	mkdir -p backups
	docker-compose -f docker-compose.prod.yml exec -T mysql mysqldump -u root -p"${MYSQL_ROOT_PASSWORD:-rootpassword}" catms_db > backups/catms_backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "Backup created in backups/ directory"

restore:
	@echo "Available backups:"
	@ls -la backups/*.sql 2>/dev/null || echo "No backups found"
	@echo "To restore, run: docker-compose -f docker-compose.prod.yml exec -T mysql mysql -u root -p catms_db < backups/backup_file.sql"

migrate:
	@echo "Running database migrations..."
	docker-compose -f docker-compose.prod.yml exec backend npm run migrate

# Maintenance commands
clean:
	@echo "Cleaning up containers and images..."
	docker-compose -f docker-compose.prod.yml down -v
	docker-compose -f docker-compose.dev.yml down -v
	docker-compose -f docker-compose.test.yml down -v
	docker system prune -f
	docker volume prune -f
	@echo "Cleanup completed!"

logs:
	docker-compose -f docker-compose.prod.yml logs -f

status:
	@echo "Service Status:"
	@docker-compose -f docker-compose.prod.yml ps

health:
	@echo "Checking service health..."
	@echo -n "Backend: "
	@curl -s -f http://localhost:5000/health > /dev/null && echo "✅ Healthy" || echo "❌ Unhealthy"
	@echo -n "Frontend: "
	@curl -s -f http://localhost:80 > /dev/null && echo "✅ Healthy" || echo "❌ Unhealthy"
	@echo -n "Database: "
	@docker-compose -f docker-compose.prod.yml exec -T mysql mysqladmin ping -h localhost > /dev/null 2>&1 && echo "✅ Healthy" || echo "❌ Unhealthy"

# Quick start for new users
setup:
	@echo "Setting up CATMS for first time..."
	@cp env.production.example .env.production
	@echo "Please edit .env.production with your configuration"
	@echo "Then run: make deploy"
