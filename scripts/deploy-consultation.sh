#!/bin/bash

# Consultation Micro-App Deployment Script
# HT-030.4.3: Production Deployment Pipeline & Infrastructure

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOYMENT_LOG="/tmp/consultation-deploy-$(date +%Y%m%d-%H%M%S).log"
ROLLBACK_INFO="/tmp/consultation-rollback-info.json"

# Default values
ENVIRONMENT=""
DOCKER_IMAGE=""
FORCE_DEPLOY=false
SKIP_HEALTH_CHECK=false
DRY_RUN=false

# Logging function
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    case $level in
        "INFO")
            echo -e "${GREEN}[INFO]${NC} $message" | tee -a "$DEPLOYMENT_LOG"
            ;;
        "WARN")
            echo -e "${YELLOW}[WARN]${NC} $message" | tee -a "$DEPLOYMENT_LOG"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} $message" | tee -a "$DEPLOYMENT_LOG"
            ;;
        "DEBUG")
            echo -e "${BLUE}[DEBUG]${NC} $message" | tee -a "$DEPLOYMENT_LOG"
            ;;
    esac
}

# Usage function
usage() {
    cat << EOF
Usage: $0 <environment> [options]

Deploy consultation micro-app to specified environment.

ARGUMENTS:
    environment     Target environment (staging|production)

OPTIONS:
    --image <image>         Docker image to deploy (default: from DOCKER_IMAGE env var)
    --force                 Force deployment without confirmations
    --skip-health-check     Skip post-deployment health checks
    --dry-run              Show what would be deployed without actually deploying
    --help                 Show this help message

ENVIRONMENT VARIABLES:
    DOCKER_IMAGE           Docker image to deploy
    STAGING_HOST           Staging server hostname
    STAGING_USER           Staging server username
    STAGING_KEY            Staging server private key
    PRODUCTION_HOST        Production server hostname
    PRODUCTION_USER        Production server username
    PRODUCTION_KEY         Production server private key
    DATABASE_URL           Database connection URL
    REDIS_URL              Redis connection URL
    OPENAI_API_KEY         OpenAI API key
    RESEND_API_KEY         Resend API key

EXAMPLES:
    $0 staging
    $0 production --force
    $0 staging --image ghcr.io/owner/consultation-micro-app:latest
    $0 production --dry-run

EOF
}

# Parse command line arguments
parse_args() {
    if [[ $# -eq 0 ]]; then
        usage
        exit 1
    fi

    ENVIRONMENT="$1"
    shift

    while [[ $# -gt 0 ]]; do
        case $1 in
            --image)
                DOCKER_IMAGE="$2"
                shift 2
                ;;
            --force)
                FORCE_DEPLOY=true
                shift
                ;;
            --skip-health-check)
                SKIP_HEALTH_CHECK=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --help)
                usage
                exit 0
                ;;
            *)
                log "ERROR" "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done

    # Validate environment
    if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
        log "ERROR" "Invalid environment: $ENVIRONMENT. Must be 'staging' or 'production'"
        exit 1
    fi

    # Set Docker image from environment variable if not provided
    if [[ -z "$DOCKER_IMAGE" ]]; then
        DOCKER_IMAGE="${DOCKER_IMAGE:-}"
        if [[ -z "$DOCKER_IMAGE" ]]; then
            log "ERROR" "Docker image not specified. Use --image or set DOCKER_IMAGE environment variable"
            exit 1
        fi
    fi
}

# Validate environment variables
validate_environment() {
    log "INFO" "Validating environment variables for $ENVIRONMENT..."

    local required_vars=()

    if [[ "$ENVIRONMENT" == "staging" ]]; then
        required_vars=("STAGING_HOST" "STAGING_USER" "STAGING_KEY")
    else
        required_vars=("PRODUCTION_HOST" "PRODUCTION_USER" "PRODUCTION_KEY")
    fi

    required_vars+=("DATABASE_URL" "REDIS_URL" "OPENAI_API_KEY" "RESEND_API_KEY")

    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            log "ERROR" "Required environment variable $var is not set"
            exit 1
        fi
    done

    log "INFO" "Environment validation passed"
}

# Pre-deployment checks
pre_deployment_checks() {
    log "INFO" "Running pre-deployment checks..."

    # Check Docker image exists
    if ! docker manifest inspect "$DOCKER_IMAGE" >/dev/null 2>&1; then
        log "ERROR" "Docker image $DOCKER_IMAGE not found or not accessible"
        exit 1
    fi

    # Validate consultation-specific components
    log "INFO" "Validating consultation components in image..."

    # Create a temporary container to check components
    local temp_container
    temp_container=$(docker create "$DOCKER_IMAGE")

    # Check required consultation files exist in image
    local required_files=(
        "/app/lib/consultation"
        "/app/lib/ai"
        "/app/lib/pdf"
        "/app/lib/email"
        "/app/lib/performance"
        "/app/lib/caching"
        "/app/app/consultation"
    )

    for file in "${required_files[@]}"; do
        if ! docker run --rm "$DOCKER_IMAGE" test -e "$file"; then
            log "ERROR" "Required consultation component missing: $file"
            docker rm "$temp_container" >/dev/null 2>&1 || true
            exit 1
        fi
    done

    docker rm "$temp_container" >/dev/null 2>&1 || true

    log "INFO" "Pre-deployment checks passed"
}

# Get server connection details
get_server_details() {
    if [[ "$ENVIRONMENT" == "staging" ]]; then
        SERVER_HOST="$STAGING_HOST"
        SERVER_USER="$STAGING_USER"
        SERVER_KEY="$STAGING_KEY"
    else
        SERVER_HOST="$PRODUCTION_HOST"
        SERVER_USER="$PRODUCTION_USER"
        SERVER_KEY="$PRODUCTION_KEY"
    fi
}

# SSH command helper
ssh_cmd() {
    ssh -i <(echo "$SERVER_KEY") \
        -o StrictHostKeyChecking=no \
        -o UserKnownHostsFile=/dev/null \
        -o LogLevel=ERROR \
        "$SERVER_USER@$SERVER_HOST" "$@"
}

# SCP command helper
scp_cmd() {
    scp -i <(echo "$SERVER_KEY") \
        -o StrictHostKeyChecking=no \
        -o UserKnownHostsFile=/dev/null \
        -o LogLevel=ERROR \
        "$@"
}

# Create deployment configuration
create_deployment_config() {
    log "INFO" "Creating deployment configuration..."

    local config_file="/tmp/consultation-${ENVIRONMENT}.env"

    cat > "$config_file" << EOF
# Consultation Micro-App Configuration
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3000

# Database Configuration
DATABASE_URL=${DATABASE_URL}
REDIS_URL=${REDIS_URL}

# AI Configuration
OPENAI_API_KEY=${OPENAI_API_KEY}

# Email Configuration
RESEND_API_KEY=${RESEND_API_KEY}

# Consultation-specific Configuration
CONSULTATION_CACHE_TTL=3600
CONSULTATION_MAX_FILE_SIZE=10485760
CONSULTATION_PDF_TIMEOUT=30000
CONSULTATION_EMAIL_TIMEOUT=10000

# Security Configuration
FORCE_HTTPS=1
HSTS_MAX_AGE=31536000
CSP_ENABLED=1

# Performance Configuration
NODE_OPTIONS=--max-old-space-size=1024 --optimize-for-size
CONSULTATION_PERFORMANCE_MONITORING=true
CONSULTATION_CACHE_ENABLED=true
EOF

    echo "$config_file"
}

# Save rollback information
save_rollback_info() {
    log "INFO" "Saving rollback information..."

    get_server_details

    # Get current running container info
    local current_image
    current_image=$(ssh_cmd "docker ps --format '{{.Image}}' --filter 'name=consultation-app' | head -1" 2>/dev/null || echo "none")

    cat > "$ROLLBACK_INFO" << EOF
{
    "environment": "$ENVIRONMENT",
    "previous_image": "$current_image",
    "new_image": "$DOCKER_IMAGE",
    "deployment_time": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "deployer": "$(whoami)",
    "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
    "server_host": "$SERVER_HOST",
    "server_user": "$SERVER_USER"
}
EOF

    log "INFO" "Rollback information saved to $ROLLBACK_INFO"
}

# Deploy to server
deploy_to_server() {
    log "INFO" "Deploying to $ENVIRONMENT server..."

    get_server_details

    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "[DRY RUN] Would deploy $DOCKER_IMAGE to $SERVER_HOST"
        return 0
    fi

    # Create configuration file
    local config_file
    config_file=$(create_deployment_config)

    # Copy configuration to server
    log "INFO" "Uploading configuration to server..."
    scp_cmd "$config_file" "$SERVER_USER@$SERVER_HOST:/tmp/consultation.env"

    # Create deployment script on server
    ssh_cmd "cat > /tmp/deploy-consultation.sh << 'EOF'
#!/bin/bash
set -euo pipefail

DOCKER_IMAGE=\"$DOCKER_IMAGE\"
CONTAINER_NAME=\"consultation-app\"
CONFIG_FILE=\"/tmp/consultation.env\"

# Stop existing container
echo \"Stopping existing container...\"
if docker ps -q -f name=\$CONTAINER_NAME | grep -q .; then
    docker stop \$CONTAINER_NAME || true
    docker rm \$CONTAINER_NAME || true
fi

# Pull new image
echo \"Pulling new image: \$DOCKER_IMAGE\"
docker pull \$DOCKER_IMAGE

# Run new container
echo \"Starting new container...\"
docker run -d \\
    --name \$CONTAINER_NAME \\
    --restart unless-stopped \\
    --env-file \$CONFIG_FILE \\
    -p 3000:3000 \\
    -v /app/uploads:/app/uploads \\
    -v /app/cache:/app/cache \\
    -v /app/logs:/app/logs \\
    --memory=1g \\
    --cpus=1.0 \\
    --health-cmd=\"curl -f http://localhost:3000/api/performance/consultation/health || exit 1\" \\
    --health-interval=30s \\
    --health-timeout=10s \\
    --health-retries=3 \\
    \$DOCKER_IMAGE

# Wait for container to be healthy
echo \"Waiting for container to be healthy...\"
timeout 120 bash -c 'while [[ \"\$(docker inspect --format=\"{{.State.Health.Status}}\" consultation-app)\" != \"healthy\" ]]; do sleep 2; done' || {
    echo \"Container failed to become healthy\"
    docker logs \$CONTAINER_NAME --tail 50
    exit 1
}

echo \"Deployment completed successfully\"
EOF"

    # Execute deployment script
    log "INFO" "Executing deployment on server..."
    ssh_cmd "chmod +x /tmp/deploy-consultation.sh && /tmp/deploy-consultation.sh"

    # Cleanup
    rm -f "$config_file"
    ssh_cmd "rm -f /tmp/consultation.env /tmp/deploy-consultation.sh"

    log "INFO" "Deployment to $ENVIRONMENT completed successfully"
}

# Health check
health_check() {
    if [[ "$SKIP_HEALTH_CHECK" == "true" ]]; then
        log "INFO" "Skipping health check"
        return 0
    fi

    log "INFO" "Running post-deployment health checks..."

    get_server_details

    # Wait for application to be ready
    log "INFO" "Waiting for application to be ready..."
    sleep 10

    # Health check endpoints
    local health_endpoints=(
        "/api/performance/consultation/health"
        "/api/performance/consultation"
    )

    for endpoint in "${health_endpoints[@]}"; do
        log "INFO" "Checking endpoint: $endpoint"

        if ssh_cmd "curl -f -s http://localhost:3000$endpoint >/dev/null"; then
            log "INFO" "✓ Health check passed: $endpoint"
        else
            log "ERROR" "✗ Health check failed: $endpoint"
            return 1
        fi
    done

    # Consultation-specific health checks
    log "INFO" "Running consultation-specific health checks..."

    # Check if consultation cache is working
    if ssh_cmd "curl -f -s 'http://localhost:3000/api/performance/consultation?format=json' | grep -q 'cache'"; then
        log "INFO" "✓ Consultation cache system is operational"
    else
        log "WARN" "⚠ Consultation cache system health check inconclusive"
    fi

    # Check if performance monitoring is active
    if ssh_cmd "curl -f -s 'http://localhost:3000/api/performance/consultation/health' | grep -q 'healthy'"; then
        log "INFO" "✓ Performance monitoring is active"
    else
        log "ERROR" "✗ Performance monitoring is not active"
        return 1
    fi

    log "INFO" "All health checks passed"
}

# Post-deployment tasks
post_deployment() {
    log "INFO" "Running post-deployment tasks..."

    get_server_details

    # Warm up cache
    log "INFO" "Warming up consultation cache..."
    ssh_cmd "curl -s -X POST 'http://localhost:3000/api/performance/consultation/health' -H 'Content-Type: application/json' -d '{\"warm_cache\": true}' >/dev/null || true"

    # Start performance monitoring
    log "INFO" "Enabling performance monitoring..."
    ssh_cmd "curl -s 'http://localhost:3000/api/performance/consultation?format=detailed' >/dev/null || true"

    # Cleanup old images (keep last 3)
    log "INFO" "Cleaning up old Docker images..."
    ssh_cmd "docker image prune -f && docker images | grep consultation-micro-app | tail -n +4 | awk '{print \$3}' | xargs -r docker rmi || true"

    log "INFO" "Post-deployment tasks completed"
}

# Confirmation prompt
confirm_deployment() {
    if [[ "$FORCE_DEPLOY" == "true" || "$DRY_RUN" == "true" ]]; then
        return 0
    fi

    echo -e "\n${YELLOW}Deployment Summary:${NC}"
    echo "  Environment: $ENVIRONMENT"
    echo "  Docker Image: $DOCKER_IMAGE"
    echo "  Target Server: $(get_server_details; echo "$SERVER_HOST")"
    echo ""

    read -p "Continue with deployment? (y/N): " -n 1 -r
    echo ""

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "INFO" "Deployment cancelled by user"
        exit 0
    fi
}

# Main deployment function
main() {
    log "INFO" "Starting consultation micro-app deployment..."
    log "INFO" "Deployment log: $DEPLOYMENT_LOG"

    parse_args "$@"
    validate_environment
    pre_deployment_checks
    confirm_deployment
    save_rollback_info
    deploy_to_server
    health_check
    post_deployment

    log "INFO" "🚀 Consultation micro-app deployment completed successfully!"
    log "INFO" "Environment: $ENVIRONMENT"
    log "INFO" "Image: $DOCKER_IMAGE"
    log "INFO" "Deployment log: $DEPLOYMENT_LOG"
    log "INFO" "Rollback info: $ROLLBACK_INFO"
}

# Handle script interruption
trap 'log "ERROR" "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"