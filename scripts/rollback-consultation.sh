#!/bin/bash

# Consultation Micro-App Rollback Script
# HT-030.4.3: Production Deployment Pipeline & Infrastructure

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ROLLBACK_INFO="/tmp/consultation-rollback-info.json"
ROLLBACK_LOG="/tmp/consultation-rollback-$(date +%Y%m%d-%H%M%S).log"

# Logging function
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    case $level in
        "INFO")
            echo -e "${GREEN}[INFO]${NC} $message" | tee -a "$ROLLBACK_LOG"
            ;;
        "WARN")
            echo -e "${YELLOW}[WARN]${NC} $message" | tee -a "$ROLLBACK_LOG"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} $message" | tee -a "$ROLLBACK_LOG"
            ;;
        "DEBUG")
            echo -e "${BLUE}[DEBUG]${NC} $message" | tee -a "$ROLLBACK_LOG"
            ;;
    esac
}

# Check if rollback info exists
check_rollback_info() {
    if [[ ! -f "$ROLLBACK_INFO" ]]; then
        log "ERROR" "Rollback information file not found: $ROLLBACK_INFO"
        log "ERROR" "Cannot perform rollback without deployment information"
        exit 1
    fi

    log "INFO" "Found rollback information file"
}

# Parse rollback information
parse_rollback_info() {
    log "INFO" "Parsing rollback information..."

    if ! command -v jq >/dev/null 2>&1; then
        log "ERROR" "jq is required for parsing rollback information"
        exit 1
    fi

    ENVIRONMENT=$(jq -r '.environment' "$ROLLBACK_INFO")
    PREVIOUS_IMAGE=$(jq -r '.previous_image' "$ROLLBACK_INFO")
    NEW_IMAGE=$(jq -r '.new_image' "$ROLLBACK_INFO")
    SERVER_HOST=$(jq -r '.server_host' "$ROLLBACK_INFO")
    SERVER_USER=$(jq -r '.server_user' "$ROLLBACK_INFO")
    DEPLOYMENT_TIME=$(jq -r '.deployment_time' "$ROLLBACK_INFO")

    if [[ "$PREVIOUS_IMAGE" == "null" || "$PREVIOUS_IMAGE" == "none" ]]; then
        log "ERROR" "No previous image found to rollback to"
        exit 1
    fi

    log "INFO" "Rollback details:"
    log "INFO" "  Environment: $ENVIRONMENT"
    log "INFO" "  Current Image: $NEW_IMAGE"
    log "INFO" "  Rollback to: $PREVIOUS_IMAGE"
    log "INFO" "  Server: $SERVER_HOST"
    log "INFO" "  Deployment Time: $DEPLOYMENT_TIME"
}

# Get SSH key from environment
get_ssh_key() {
    if [[ "$ENVIRONMENT" == "staging" ]]; then
        SSH_KEY="$STAGING_KEY"
    else
        SSH_KEY="$PRODUCTION_KEY"
    fi

    if [[ -z "$SSH_KEY" ]]; then
        log "ERROR" "SSH key not found in environment variables"
        exit 1
    fi
}

# SSH command helper
ssh_cmd() {
    ssh -i <(echo "$SSH_KEY") \
        -o StrictHostKeyChecking=no \
        -o UserKnownHostsFile=/dev/null \
        -o LogLevel=ERROR \
        "$SERVER_USER@$SERVER_HOST" "$@"
}

# Confirm rollback
confirm_rollback() {
    echo -e "\n${RED}⚠️  ROLLBACK CONFIRMATION${NC}"
    echo -e "${YELLOW}This will rollback the consultation micro-app deployment:${NC}"
    echo "  Environment: $ENVIRONMENT"
    echo "  Current Image: $NEW_IMAGE"
    echo "  Rollback to: $PREVIOUS_IMAGE"
    echo "  Server: $SERVER_HOST"
    echo ""
    echo -e "${RED}This action cannot be undone without another deployment.${NC}"
    echo ""

    read -p "Are you sure you want to proceed with rollback? (yes/NO): " -r
    echo ""

    if [[ ! $REPLY == "yes" ]]; then
        log "INFO" "Rollback cancelled by user"
        exit 0
    fi
}

# Perform rollback
perform_rollback() {
    log "INFO" "Starting rollback process..."

    # Create rollback script on server
    ssh_cmd "cat > /tmp/rollback-consultation.sh << 'EOF'
#!/bin/bash
set -euo pipefail

PREVIOUS_IMAGE=\"$PREVIOUS_IMAGE\"
CONTAINER_NAME=\"consultation-app\"

echo \"Starting consultation micro-app rollback...\"

# Get current container status
if docker ps -q -f name=\$CONTAINER_NAME | grep -q .; then
    echo \"Stopping current container...\"
    docker stop \$CONTAINER_NAME || true
    docker rm \$CONTAINER_NAME || true
else
    echo \"No running container found\"
fi

# Check if previous image exists locally
if ! docker images -q \$PREVIOUS_IMAGE | grep -q .; then
    echo \"Previous image not found locally, pulling from registry...\"
    docker pull \$PREVIOUS_IMAGE || {
        echo \"Failed to pull previous image: \$PREVIOUS_IMAGE\"
        exit 1
    }
fi

# Start container with previous image
echo \"Starting container with previous image: \$PREVIOUS_IMAGE\"
docker run -d \\
    --name \$CONTAINER_NAME \\
    --restart unless-stopped \\
    --env-file /tmp/consultation.env \\
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
    \$PREVIOUS_IMAGE

# Wait for container to be healthy
echo \"Waiting for container to be healthy...\"
timeout 120 bash -c 'while [[ \"\$(docker inspect --format=\"{{.State.Health.Status}}\" consultation-app)\" != \"healthy\" ]]; do sleep 2; done' || {
    echo \"Rollback container failed to become healthy\"
    docker logs \$CONTAINER_NAME --tail 50
    exit 1
}

echo \"Rollback completed successfully\"
EOF"

    # Execute rollback script
    log "INFO" "Executing rollback on server..."
    ssh_cmd "chmod +x /tmp/rollback-consultation.sh && /tmp/rollback-consultation.sh"

    # Cleanup
    ssh_cmd "rm -f /tmp/rollback-consultation.sh"

    log "INFO" "Rollback executed successfully"
}

# Health check after rollback
health_check_rollback() {
    log "INFO" "Running post-rollback health checks..."

    # Wait for application to be ready
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
            log "ERROR" "Rollback may have failed or service is not responding"
            return 1
        fi
    done

    log "INFO" "All health checks passed after rollback"
}

# Create rollback record
create_rollback_record() {
    log "INFO" "Creating rollback record..."

    local rollback_record="/tmp/consultation-rollback-record-$(date +%Y%m%d-%H%M%S).json"

    cat > "$rollback_record" << EOF
{
    "rollback_time": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "environment": "$ENVIRONMENT",
    "rolled_back_from": "$NEW_IMAGE",
    "rolled_back_to": "$PREVIOUS_IMAGE",
    "server_host": "$SERVER_HOST",
    "operator": "$(whoami)",
    "original_deployment_time": "$DEPLOYMENT_TIME",
    "rollback_reason": "Manual rollback execution",
    "status": "completed"
}
EOF

    log "INFO" "Rollback record created: $rollback_record"
}

# Post-rollback notifications
send_notifications() {
    log "INFO" "Sending rollback notifications..."

    # Log to console
    echo -e "\n${GREEN}✅ ROLLBACK COMPLETED SUCCESSFULLY${NC}"
    echo "  Environment: $ENVIRONMENT"
    echo "  Rolled back from: $NEW_IMAGE"
    echo "  Rolled back to: $PREVIOUS_IMAGE"
    echo "  Rollback time: $(date)"
    echo "  Rollback log: $ROLLBACK_LOG"

    # If Slack webhook is available, send notification
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        curl -X POST "$SLACK_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{
                \"text\": \"🔄 Consultation micro-app rollback completed\",
                \"attachments\": [{
                    \"color\": \"warning\",
                    \"fields\": [
                        {\"title\": \"Environment\", \"value\": \"$ENVIRONMENT\", \"short\": true},
                        {\"title\": \"Rolled back to\", \"value\": \"$PREVIOUS_IMAGE\", \"short\": true},
                        {\"title\": \"Time\", \"value\": \"$(date)\", \"short\": true}
                    ]
                }]
            }" 2>/dev/null || log "WARN" "Failed to send Slack notification"
    fi
}

# Main rollback function
main() {
    log "INFO" "Starting consultation micro-app rollback..."
    log "INFO" "Rollback log: $ROLLBACK_LOG"

    check_rollback_info
    parse_rollback_info
    get_ssh_key
    confirm_rollback
    perform_rollback
    health_check_rollback
    create_rollback_record
    send_notifications

    log "INFO" "🔄 Consultation micro-app rollback completed successfully!"
}

# Handle script interruption
trap 'log "ERROR" "Rollback interrupted"; exit 1' INT TERM

# Run main function
main "$@"