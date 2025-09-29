#!/bin/bash

# ============================================================================
# Integrated System Deployment Script
# Deploys unified agency toolkit with all HT-035 integrated components
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
DEPLOYMENT_LOG="$PROJECT_ROOT/deployment.log"
BACKUP_DIR="$PROJECT_ROOT/backups/$(date +%Y%m%d_%H%M%S)"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    case $level in
        "INFO")  echo -e "${BLUE}[INFO]${NC} $message" ;;
        "WARN")  echo -e "${YELLOW}[WARN]${NC} $message" ;;
        "ERROR") echo -e "${RED}[ERROR]${NC} $message" ;;
        "SUCCESS") echo -e "${GREEN}[SUCCESS]${NC} $message" ;;
    esac

    echo "[$timestamp] [$level] $message" >> "$DEPLOYMENT_LOG"
}

# Error handler
error_handler() {
    local line_number=$1
    log "ERROR" "Deployment failed at line $line_number"
    log "ERROR" "Check $DEPLOYMENT_LOG for details"
    exit 1
}

trap 'error_handler $LINENO' ERR

# Pre-deployment validation
validate_environment() {
    log "INFO" "Validating deployment environment..."

    # Check Node.js version
    if ! command -v node &> /dev/null; then
        log "ERROR" "Node.js is not installed"
        return 1
    fi

    local node_version=$(node -v | cut -d'v' -f2)
    local required_version="18.0.0"
    if ! [[ "$(printf '%s\n' "$required_version" "$node_version" | sort -V | head -n1)" = "$required_version" ]]; then
        log "ERROR" "Node.js version $node_version is below required $required_version"
        return 1
    fi

    # Check npm
    if ! command -v npm &> /dev/null; then
        log "ERROR" "npm is not installed"
        return 1
    fi

    # Check environment variables
    local required_vars=("NODE_ENV" "DATABASE_URL" "SUPABASE_URL" "SUPABASE_ANON_KEY")
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            log "ERROR" "Required environment variable $var is not set"
            return 1
        fi
    done

    # Check database connectivity
    log "INFO" "Testing database connectivity..."
    if ! timeout 10 bash -c "npm run db:test-connection" &>/dev/null; then
        log "ERROR" "Cannot connect to database"
        return 1
    fi

    log "SUCCESS" "Environment validation completed"
}

# Create deployment backup
create_backup() {
    log "INFO" "Creating deployment backup..."

    mkdir -p "$BACKUP_DIR"

    # Backup current build
    if [[ -d "$PROJECT_ROOT/.next" ]]; then
        cp -r "$PROJECT_ROOT/.next" "$BACKUP_DIR/.next.backup"
        log "INFO" "Build backup created"
    fi

    # Backup package-lock.json
    if [[ -f "$PROJECT_ROOT/package-lock.json" ]]; then
        cp "$PROJECT_ROOT/package-lock.json" "$BACKUP_DIR/package-lock.json.backup"
        log "INFO" "Package lock backup created"
    fi

    # Backup environment files
    if [[ -f "$PROJECT_ROOT/.env.local" ]]; then
        cp "$PROJECT_ROOT/.env.local" "$BACKUP_DIR/.env.local.backup"
        log "INFO" "Environment backup created"
    fi

    log "SUCCESS" "Backup created at $BACKUP_DIR"
}

# Install dependencies
install_dependencies() {
    log "INFO" "Installing production dependencies..."

    cd "$PROJECT_ROOT"

    # Clean install with production dependencies
    npm ci --production --silent || {
        log "ERROR" "Failed to install dependencies"
        return 1
    }

    log "SUCCESS" "Dependencies installed successfully"
}

# Build application
build_application() {
    log "INFO" "Building integrated application..."

    cd "$PROJECT_ROOT"

    # Clean previous build
    rm -rf .next

    # Build design tokens first
    log "INFO" "Building design tokens..."
    timeout 300 npm run tokens:build || {
        log "ERROR" "Design tokens build failed"
        return 1
    }

    # Build Next.js application
    log "INFO" "Building Next.js application..."
    timeout 600 npm run build || {
        log "ERROR" "Application build failed"
        return 1
    }

    log "SUCCESS" "Application build completed"
}

# Database migration
migrate_database() {
    log "INFO" "Running database migrations..."

    cd "$PROJECT_ROOT"

    # Run migrations
    npm run db:migrate:production || {
        log "ERROR" "Database migration failed"
        return 1
    }

    # Verify schema
    npm run db:verify:schema || {
        log "ERROR" "Schema verification failed"
        return 1
    }

    log "SUCCESS" "Database migration completed"
}

# Deploy application
deploy_application() {
    log "INFO" "Deploying integrated application..."

    cd "$PROJECT_ROOT"

    # Stop existing application (if running)
    if command -v pm2 &> /dev/null; then
        pm2 stop ecosystem.config.js 2>/dev/null || true
        log "INFO" "Stopped existing application"
    fi

    # Start application
    if command -v pm2 &> /dev/null; then
        pm2 start ecosystem.config.js --env production
        log "INFO" "Started application with PM2"
    else
        # Fallback to npm start
        nohup npm start > application.log 2>&1 &
        log "INFO" "Started application with npm start"
    fi

    # Wait for application to start
    local max_attempts=30
    local attempt=1

    while [[ $attempt -le $max_attempts ]]; do
        if curl -f http://localhost:3000/api/health &>/dev/null; then
            log "SUCCESS" "Application is responding"
            break
        fi

        log "INFO" "Waiting for application to start (attempt $attempt/$max_attempts)..."
        sleep 2
        ((attempt++))
    done

    if [[ $attempt -gt $max_attempts ]]; then
        log "ERROR" "Application failed to start within timeout"
        return 1
    fi
}

# Verify deployment
verify_deployment() {
    log "INFO" "Verifying deployment..."

    # Test health endpoints
    local endpoints=(
        "/api/health"
        "/api/health/database"
        "/api/health/integrated-systems"
    )

    for endpoint in "${endpoints[@]}"; do
        if curl -f "http://localhost:3000$endpoint" &>/dev/null; then
            log "SUCCESS" "Health check passed: $endpoint"
        else
            log "ERROR" "Health check failed: $endpoint"
            return 1
        fi
    done

    # Test dashboard accessibility
    if curl -f http://localhost:3000/agency-toolkit &>/dev/null; then
        log "SUCCESS" "Dashboard accessibility verified"
    else
        log "ERROR" "Dashboard accessibility failed"
        return 1
    fi

    # Test integrated system endpoints
    local integrated_endpoints=(
        "/agency-toolkit/orchestration"
        "/agency-toolkit/modules"
        "/agency-toolkit/marketplace"
        "/agency-toolkit/handover"
    )

    for endpoint in "${integrated_endpoints[@]}"; do
        if curl -f "http://localhost:3000$endpoint" &>/dev/null; then
            log "SUCCESS" "Integrated system accessible: $endpoint"
        else
            log "WARN" "Integrated system check failed: $endpoint (may require authentication)"
        fi
    done

    log "SUCCESS" "Deployment verification completed"
}

# Setup monitoring
setup_monitoring() {
    log "INFO" "Setting up monitoring and alerting..."

    cd "$PROJECT_ROOT"

    # Initialize monitoring configuration
    if [[ -f "configs/production/monitoring-config.yml" ]]; then
        cp configs/production/monitoring-config.yml /etc/monitoring/config.yml 2>/dev/null || {
            log "WARN" "Could not copy monitoring config to system location"
        }
    fi

    # Setup alerting rules
    if [[ -f "configs/production/alerting-rules.yml" ]]; then
        cp configs/production/alerting-rules.yml /etc/alerting/rules.yml 2>/dev/null || {
            log "WARN" "Could not copy alerting rules to system location"
        }
    fi

    # Start monitoring services if available
    if command -v systemctl &> /dev/null; then
        systemctl enable app-monitoring 2>/dev/null || log "WARN" "Could not enable monitoring service"
        systemctl start app-monitoring 2>/dev/null || log "WARN" "Could not start monitoring service"
    fi

    log "SUCCESS" "Monitoring setup completed"
}

# Cleanup temporary files
cleanup() {
    log "INFO" "Cleaning up temporary files..."

    cd "$PROJECT_ROOT"

    # Remove temporary build files
    rm -rf node_modules/.cache
    rm -rf .next/cache

    # Clean npm cache
    npm cache clean --force &>/dev/null || true

    log "SUCCESS" "Cleanup completed"
}

# Main deployment function
main() {
    local start_time=$(date +%s)

    log "INFO" "Starting integrated system deployment..."
    log "INFO" "Deployment log: $DEPLOYMENT_LOG"
    log "INFO" "Backup directory: $BACKUP_DIR"

    # Pre-flight checks
    validate_environment || exit 1
    create_backup || exit 1

    # Deployment steps
    install_dependencies || exit 1
    build_application || exit 1
    migrate_database || exit 1
    deploy_application || exit 1
    verify_deployment || exit 1
    setup_monitoring || exit 1
    cleanup || exit 1

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    log "SUCCESS" "Integrated system deployment completed successfully!"
    log "INFO" "Total deployment time: ${duration} seconds"
    log "INFO" "Application URL: http://localhost:3000"
    log "INFO" "Dashboard URL: http://localhost:3000/agency-toolkit"

    # Display post-deployment information
    echo ""
    echo "=========================================="
    echo "🎉 DEPLOYMENT SUCCESSFUL 🎉"
    echo "=========================================="
    echo "Application is running at: http://localhost:3000"
    echo "Dashboard: http://localhost:3000/agency-toolkit"
    echo "Health check: http://localhost:3000/api/health"
    echo ""
    echo "Integrated Systems Available:"
    echo "• Orchestration: http://localhost:3000/agency-toolkit/orchestration"
    echo "• Modules: http://localhost:3000/agency-toolkit/modules"
    echo "• Marketplace: http://localhost:3000/agency-toolkit/marketplace"
    echo "• Handover: http://localhost:3000/agency-toolkit/handover"
    echo ""
    echo "Logs: $DEPLOYMENT_LOG"
    echo "Backup: $BACKUP_DIR"
    echo "=========================================="
}

# Execute main function if script is run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi