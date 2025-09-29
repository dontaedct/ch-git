# Consultation Micro-App Production Deployment Runbook
## HT-030.4.3: Production Deployment Pipeline & Infrastructure

### Overview

This runbook provides step-by-step instructions for deploying the consultation micro-app to production environments. The consultation micro-app provides AI-powered consultation generation, multi-step questionnaire flows, and automated document delivery.

---

## Prerequisites

### Required Tools
- Docker and Docker Compose
- Node.js 20+
- Git
- SSH access to target servers
- GitHub CLI (optional)

### Required Environment Variables

#### Database & Cache
```bash
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
REDIS_URL=redis://user:password@host:6379
```

#### AI & Email Services
```bash
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Server Access
```bash
# For Staging
STAGING_HOST=staging.example.com
STAGING_USER=deploy
STAGING_KEY="-----BEGIN OPENSSH PRIVATE KEY-----..."

# For Production
PRODUCTION_HOST=production.example.com
PRODUCTION_USER=deploy
PRODUCTION_KEY="-----BEGIN OPENSSH PRIVATE KEY-----..."
```

---

## Pre-Deployment Checklist

### 1. Code Readiness
- [ ] All consultation features tested
- [ ] Performance optimization validated
- [ ] Security scanning completed
- [ ] Documentation updated

### 2. Infrastructure Readiness
- [ ] Target servers accessible
- [ ] Database migrations ready
- [ ] SSL certificates valid
- [ ] Monitoring configured

### 3. Configuration Validation
```bash
# Validate production configuration
npx tsx scripts/production-config-validator.ts
```

### 4. Performance Validation
```bash
# Run performance tests
npx tsx scripts/validate-consultation-performance.ts
```

---

## Deployment Process

### Staging Deployment

#### 1. Automated Deployment (Recommended)
```bash
# Via GitHub Actions
# Push to main branch triggers automatic staging deployment
git push origin main
```

#### 2. Manual Deployment
```bash
# Set environment variables
export DOCKER_IMAGE="ghcr.io/owner/consultation-micro-app:latest"
export STAGING_HOST="staging.example.com"
export STAGING_USER="deploy"
export STAGING_KEY="$(cat ~/.ssh/staging_key)"

# Deploy to staging
./scripts/deploy-consultation.sh staging
```

#### 3. Staging Validation
```bash
# Health check
curl -f https://staging.example.com/api/performance/consultation/health

# Run smoke tests
npm run test:smoke
```

### Production Deployment

#### 1. Pre-Production Validation
```bash
# Validate staging environment
curl -f https://staging.example.com/api/performance/consultation/health

# Run production readiness checks
npx tsx scripts/production-config-validator.ts
```

#### 2. Production Deployment
```bash
# Set environment variables
export DOCKER_IMAGE="ghcr.io/owner/consultation-micro-app:v1.0.0"
export PRODUCTION_HOST="production.example.com"
export PRODUCTION_USER="deploy"
export PRODUCTION_KEY="$(cat ~/.ssh/production_key)"

# Deploy to production
./scripts/deploy-consultation.sh production
```

#### 3. Post-Deployment Validation
```bash
# Health checks
curl -f https://production.example.com/api/performance/consultation/health

# Performance validation
curl -f https://production.example.com/api/performance/consultation

# Run production smoke tests
npm run test:smoke:production
```

---

## Rollback Procedures

### When to Rollback
- Health checks failing
- Performance degradation
- Critical bugs discovered
- User-reported issues

### Rollback Process
```bash
# Execute rollback
./scripts/rollback-consultation.sh

# Verify rollback success
curl -f https://production.example.com/api/performance/consultation/health
```

### Post-Rollback Actions
1. Investigate root cause
2. Fix issues in development
3. Update tests to prevent regression
4. Plan new deployment

---

## Monitoring & Alerting

### Health Check Endpoints
```
GET /api/performance/consultation/health
GET /api/performance/consultation
```

### Key Metrics to Monitor
- Response time (<500ms for API endpoints)
- Error rate (<1%)
- Memory usage (<1GB)
- CPU usage (<80%)
- Cache hit rate (>80%)

### Performance Targets
- Page load time: <2 seconds
- AI generation time: <30 seconds
- PDF generation time: <10 seconds
- Email delivery time: <5 seconds

---

## Troubleshooting

### Common Issues

#### 1. Container Won't Start
```bash
# Check container logs
docker logs consultation-app

# Common causes:
# - Missing environment variables
# - Database connection issues
# - Invalid configuration
```

#### 2. Health Checks Failing
```bash
# Check application logs
docker exec consultation-app cat /app/logs/application.log

# Verify database connectivity
docker exec consultation-app curl http://localhost:3000/api/performance/consultation/health
```

#### 3. Performance Issues
```bash
# Check performance metrics
curl https://production.example.com/api/performance/consultation

# Check cache status
curl https://production.example.com/api/performance/consultation/health
```

#### 4. Database Connection Issues
```bash
# Verify DATABASE_URL format
echo $DATABASE_URL

# Test database connectivity
docker exec consultation-app npm run db:test
```

### Log Locations
- Application logs: `/app/logs/application.log`
- Performance logs: `/app/logs/performance.log`
- Error logs: `/app/logs/error.log`
- Nginx logs: `/var/log/nginx/`

---

## Security Considerations

### SSL/TLS Configuration
- Ensure HTTPS is enforced
- Verify SSL certificates are valid
- Configure HSTS headers

### Environment Variables
- Never commit secrets to Git
- Use secure secret management
- Rotate API keys regularly

### Access Control
- Limit SSH access to deployment users
- Use SSH keys instead of passwords
- Implement IP whitelisting where possible

---

## Performance Optimization

### Caching Strategy
- Redis for consultation data caching
- CDN for static assets
- Browser caching for images

### Resource Allocation
- Memory: 1GB limit, 512MB reserved
- CPU: 1.0 limit, 0.5 reserved
- Disk: SSD recommended for database

### Monitoring
- Set up performance alerts
- Monitor cache hit rates
- Track API response times

---

## Backup & Recovery

### Database Backups
```bash
# Daily automated backups recommended
pg_dump $DATABASE_URL > consultation_backup_$(date +%Y%m%d).sql
```

### Configuration Backups
- Environment variables
- SSL certificates
- Docker images (tagged)

### Recovery Procedures
1. Restore from backup
2. Verify data integrity
3. Run health checks
4. Validate functionality

---

## Emergency Contacts

### On-Call Rotation
- Primary: DevOps Team
- Secondary: Development Team
- Escalation: Technical Lead

### Communication Channels
- Slack: #consultation-alerts
- Email: consultation-ops@company.com
- Phone: Emergency hotline

---

## Appendix

### File Locations
```
.github/workflows/consultation-deploy.yml    # CI/CD pipeline
docker/consultation-app.Dockerfile           # Production container
docker/docker-compose.production.yml        # Production orchestration
scripts/deploy-consultation.sh               # Deployment script
scripts/rollback-consultation.sh             # Rollback script
scripts/production-config-validator.ts       # Configuration validator
```

### Useful Commands
```bash
# View container status
docker ps --filter name=consultation-app

# View container logs
docker logs consultation-app --follow

# Execute commands in container
docker exec -it consultation-app /bin/sh

# Check resource usage
docker stats consultation-app

# Restart container
docker restart consultation-app
```

---

*Last Updated: 2025-09-19*
*Version: 1.0.0*
*Maintained by: Consultation Micro-App Team*