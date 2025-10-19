#!/bin/bash

# CATMS Deployment Script
# This script handles the deployment of the CATMS application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
COMPOSE_FILE="docker-compose.${ENVIRONMENT}.yml"
BACKUP_DIR="./backups"
LOG_FILE="./deployment.log"

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running. Please start Docker and try again."
    fi
    log "Docker is running"
}

# Check if Docker Compose file exists
check_compose_file() {
    if [ ! -f "$COMPOSE_FILE" ]; then
        error "Docker Compose file $COMPOSE_FILE not found"
    fi
    log "Using Docker Compose file: $COMPOSE_FILE"
}

# Create backup of database
backup_database() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log "Creating database backup..."
        mkdir -p "$BACKUP_DIR"
        BACKUP_FILE="$BACKUP_DIR/catms_backup_$(date +%Y%m%d_%H%M%S).sql"
        
        if docker-compose -f "$COMPOSE_FILE" exec -T mysql mysqldump -u root -p"${MYSQL_ROOT_PASSWORD:-rootpassword}" catms_db > "$BACKUP_FILE"; then
            log "Database backup created: $BACKUP_FILE"
        else
            warning "Failed to create database backup"
        fi
    fi
}

# Pull latest images
pull_images() {
    log "Pulling latest images..."
    docker-compose -f "$COMPOSE_FILE" pull
}

# Build images
build_images() {
    log "Building images..."
    docker-compose -f "$COMPOSE_FILE" build --no-cache
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    # Wait for database to be ready
    sleep 10
    
    # Run migrations if any exist
    if [ -d "./database/migrations" ]; then
        docker-compose -f "$COMPOSE_FILE" exec -T mysql mysql -u root -p"${MYSQL_ROOT_PASSWORD:-rootpassword}" catms_db < ./database/migrations/001_initial_data.sql || warning "Migration failed"
    fi
}

# Deploy services
deploy_services() {
    log "Deploying services..."
    docker-compose -f "$COMPOSE_FILE" up -d
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    sleep 30
    
    # Check service health
    check_service_health
}

# Check service health
check_service_health() {
    log "Checking service health..."
    
    # Check backend
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        log "Backend is healthy"
    else
        error "Backend health check failed"
    fi
    
    # Check frontend
    if curl -f http://localhost:80 > /dev/null 2>&1; then
        log "Frontend is healthy"
    else
        error "Frontend health check failed"
    fi
    
    # Check database
    if docker-compose -f "$COMPOSE_FILE" exec -T mysql mysqladmin ping -h localhost > /dev/null 2>&1; then
        log "Database is healthy"
    else
        error "Database health check failed"
    fi
}

# Cleanup old images
cleanup() {
    log "Cleaning up old images..."
    docker image prune -f
    docker volume prune -f
}

# Rollback function
rollback() {
    error "Deployment failed. Please check the logs and consider rolling back."
}

# Main deployment function
main() {
    log "Starting deployment for environment: $ENVIRONMENT"
    
    # Pre-deployment checks
    check_docker
    check_compose_file
    
    # Backup database
    backup_database
    
    # Pull and build images
    pull_images
    build_images
    
    # Deploy services
    deploy_services
    
    # Run migrations
    run_migrations
    
    # Cleanup
    cleanup
    
    log "Deployment completed successfully!"
    log "Application is available at:"
    log "  Frontend: http://localhost:80"
    log "  Backend API: http://localhost:5000"
    log "  Nginx Proxy: http://localhost:8080"
}

# Handle script interruption
trap rollback INT TERM

# Run main function
main "$@"
