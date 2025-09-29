# Production Deployment Guide

## Overview

This guide covers the complete production deployment process for client template applications using the automated deployment pipeline. The system supports both staging and production deployments with comprehensive validation, monitoring, and rollback capabilities.

## Prerequisites

### System Requirements

- Node.js 18+ installed
- npm or yarn package manager
- Git repository access
- Vercel account with appropriate permissions
- Supabase project configured
- GitHub Actions enabled

### Required Secrets

Configure the following secrets in your GitHub repository:

```bash
# Vercel Configuration
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Monitoring and Alerts
MONITORING_WEBHOOK_URL=your_monitoring_webhook
SLACK_WEBHOOK_URL=your_slack_webhook (optional)
```

## Deployment Process

### 1. Automated Deployment via GitHub Actions

The primary deployment method uses the GitHub Actions workflow `.github/workflows/client-template-deploy.yml`.

#### Trigger Deployment

```bash
# Via GitHub UI
1. Go to Actions tab in GitHub
2. Select "Client Template Production Deployment"
3. Click "Run workflow"
4. Fill in required parameters:
   - Client ID: unique-client-identifier
   - Template ID: template-name
   - Environment: staging|production
   - Customizations: JSON configuration (optional)

# Via GitHub CLI
gh workflow run client-template-deploy.yml \
  -f client_id="unique-client-identifier" \
  -f template_id="template-name" \
  -f environment="production" \
  -f customizations='{"domain":"client.example.com","theme":"dark"}'
```

#### Deployment Stages

1. **Input Validation**
   - Validates client ID format
   - Validates template ID format
   - Validates customizations JSON
   - Security checks for secrets

2. **Pre-Deployment Validation**
   - Production validation checks
   - Security scanning
   - Dependency auditing
   - Creates deployment record

3. **Build and Test**
   - Generates client application
   - Runs comprehensive tests
   - Performance validation
   - Creates build artifacts

4. **Staging Deployment** (for production deployments)
   - Deploys to staging environment
   - Runs health checks
   - Validates functionality

5. **Production Deployment**
   - Final validation checks
   - Deploys to production
   - Configures custom domain (if specified)
   - Sets up monitoring and alerts

6. **Post-Deployment**
   - Updates deployment records
   - Generates handover documentation
   - Sends notifications

### 2. Manual Deployment

For emergency or special cases, manual deployment is supported:

#### Generate Client Application

```bash
# Generate client application
npx tsx bin/create-micro-app.mjs \
  --client-id="client-identifier" \
  --template-id="template-name" \
  --customizations='{"key":"value"}' \
  --output-dir="./client-apps/client-identifier"

cd client-apps/client-identifier
```

#### Build and Test

```bash
# Install dependencies
npm ci

# Run tests
npm run test
npm run lint
npm run type-check

# Build for production
npm run build
```

#### Deploy to Vercel

```bash
# Deploy to staging
npx vercel deploy \
  --token="$VERCEL_TOKEN" \
  --scope="$VERCEL_ORG_ID" \
  --project="client-identifier-staging"

# Deploy to production
npx vercel deploy \
  --prod \
  --token="$VERCEL_TOKEN" \
  --scope="$VERCEL_ORG_ID" \
  --project="client-identifier"
```

## Validation Checks

### Pre-Deployment Validation

The production validator (`lib/deployment/production-validator.ts`) performs comprehensive checks:

#### Client Configuration
- Client exists in database
- Valid configuration schema
- Active subscription status
- Customization limits validation

#### Template Compatibility
- Template exists and is accessible
- Version compatibility
- Customization compatibility
- Dependency validation

#### Security Compliance
- Dependency vulnerability scanning
- Secret detection in configurations
- HTTPS compliance validation
- Security headers verification
- API security validation

#### Performance Requirements
- Bundle size limits (5MB max)
- Performance budget validation
- Image optimization settings
- Caching strategy verification
- CDN configuration (production)

#### Infrastructure Readiness
- Vercel deployment limits
- Supabase database connectivity
- Environment variables validation
- Domain configuration (if specified)
- Monitoring setup verification

#### Dependencies
- Node.js version compatibility (18+)
- Package.json integrity
- Dependency conflict detection
- Build dependencies validation

### Production-Specific Checks

For production deployments, additional validation includes:

- Full build test execution
- Rollback capability verification
- Backup and recovery procedures
- Incident response readiness
- Final security scan

## Monitoring and Health Checks

### Automated Monitoring

The production monitoring system (`lib/monitoring/production-monitoring.ts`) provides:

#### Health Checks
- API endpoint health
- Database connectivity
- External services status
- SSL certificate validation
- DNS resolution

#### Performance Monitoring
- Response time measurement
- Throughput monitoring
- Memory and CPU usage
- Page load time tracking
- Cache hit rate monitoring

#### Security Monitoring
- Security headers validation
- HTTPS enforcement
- Content Security Policy
- Authentication security
- Rate limiting verification

#### Availability Monitoring
- Uptime tracking (99.9% target)
- Geographic availability
- CDN performance
- Failover mechanism validation

#### Resource Monitoring
- Disk usage monitoring
- Network bandwidth tracking
- Database connection pool
- Error rate tracking

### Alert Configuration

Monitoring alerts are triggered for:

- **Critical Issues:**
  - Service outages
  - High error rates (>1%)
  - SSL certificate issues
  - Security breaches

- **Warning Conditions:**
  - High response times (>2s)
  - Memory usage >80%
  - CPU usage >80%
  - Low cache hit rates (<80%)

## Rollback Procedures

### Automatic Rollback

Automatic rollback triggers:
- Failed health checks after deployment
- Critical security issues detected
- Performance degradation >50%
- Error rate spike >5%

### Manual Rollback

```bash
# Rollback via Vercel CLI
npx vercel rollback [deployment-url] \
  --token="$VERCEL_TOKEN" \
  --scope="$VERCEL_ORG_ID"

# Rollback via GitHub Actions
gh workflow run rollback-deployment.yml \
  -f client_id="client-identifier" \
  -f rollback_to="previous-deployment-id"
```

### Database Rollback

```bash
# Restore from backup (if needed)
npx supabase db reset --linked

# Apply specific migration rollback
npx supabase migration down [migration-file]
```

## Troubleshooting

### Common Issues

#### Deployment Failures

**Issue:** Client validation failed
```bash
# Solution: Verify client exists and is active
npx tsx scripts/verify-client.ts --client-id="client-identifier"
```

**Issue:** Template compatibility issues
```bash
# Solution: Validate template configuration
npx tsx scripts/validate-template.ts --template-id="template-name"
```

**Issue:** Build failures
```bash
# Solution: Check build logs and dependencies
npm run build 2>&1 | tee build.log
npm audit fix
```

#### Runtime Issues

**Issue:** Application not loading
```bash
# Check health endpoints
curl https://client-app.example.com/api/health

# Check monitoring dashboard
npx tsx lib/monitoring/production-monitoring.ts \
  --url="https://client-app.example.com" \
  --client-id="client-identifier" \
  --environment="production"
```

**Issue:** Performance problems
```bash
# Run performance analysis
npm run lighthouse:ci

# Check resource usage
npx tsx scripts/check-resources.ts --url="https://client-app.example.com"
```

### Emergency Procedures

#### Service Outage

1. **Immediate Response**
   ```bash
   # Create incident
   npx tsx lib/operations/incident-response.ts create \
     --type="outage" \
     --severity="critical" \
     --description="Service outage detected"

   # Activate incident response
   npx tsx lib/operations/incident-response.ts respond \
     --incident-id="incident-id" \
     --action="investigate"
   ```

2. **Mitigation Steps**
   - Enable maintenance mode
   - Switch to backup systems
   - Notify stakeholders
   - Begin investigation

3. **Recovery Process**
   - Identify root cause
   - Apply fixes
   - Gradual traffic restoration
   - Monitor stability

#### Security Incident

1. **Immediate Actions**
   - Isolate affected systems
   - Revoke compromised credentials
   - Enable enhanced monitoring
   - Document timeline

2. **Investigation**
   - Analyze security logs
   - Assess impact scope
   - Identify attack vectors
   - Collect evidence

3. **Recovery**
   - Apply security patches
   - Reset affected credentials
   - Update security policies
   - Conduct security audit

## Best Practices

### Pre-Deployment

- Always test in staging first
- Review customizations for security
- Validate all environment variables
- Confirm backup procedures
- Schedule maintenance windows

### During Deployment

- Monitor deployment progress
- Watch for alerts and warnings
- Keep communication channels open
- Have rollback plan ready
- Document any issues

### Post-Deployment

- Verify all functionality
- Monitor performance metrics
- Check error rates
- Validate monitoring alerts
- Update documentation

### Security

- Never commit secrets to repositories
- Use environment variables for configuration
- Regularly audit dependencies
- Monitor for security vulnerabilities
- Implement least privilege access

### Performance

- Optimize bundle sizes
- Configure CDN properly
- Implement proper caching
- Monitor core web vitals
- Regular performance testing

## Support and Escalation

### Contact Information

- **On-Call Engineer:** [Contact details]
- **Engineering Manager:** [Contact details]
- **Director of Engineering:** [Contact details]

### Escalation Matrix

- **Low Severity:** Team Lead
- **Medium Severity:** Team Lead → Engineering Manager
- **High Severity:** Team Lead → Engineering Manager → Director
- **Critical Severity:** All levels + CTO + CEO

### Documentation

- [Incident Response Playbook](./incident-response-playbook.md)
- [Operational Procedures](./operational-procedures.md)
- [Architecture Documentation](../architecture/README.md)
- [API Documentation](../api/README.md)

---

*This guide is maintained by the Platform Engineering team. Last updated: $(date)*