# Production Deployment Guide - Integrated Agency Toolkit Systems

## Overview

This guide provides comprehensive instructions for deploying the integrated agency toolkit systems to production, including all HT-035 components (Orchestration, Modules, Marketplace, Handover) unified with the existing agency toolkit infrastructure.

## Pre-Deployment Checklist

### System Verification
- [ ] All HT-036 integration tasks completed successfully
- [ ] Database schema unification completed and tested
- [ ] Conflict resolution implemented for all systems
- [ ] Dashboard integration functional and tested
- [ ] API integration verified and validated
- [ ] Performance benchmarks met across all systems

### Environment Preparation
- [ ] Production environment provisioned with adequate resources
- [ ] Database migration scripts prepared and tested
- [ ] Environment variables configured for production
- [ ] SSL certificates installed and validated
- [ ] CDN configuration updated for static assets
- [ ] Load balancer configuration optimized

### Security Validation
- [ ] Security audit completed with no critical issues
- [ ] Authentication and authorization tested across all systems
- [ ] API security validated for all integrated endpoints
- [ ] Data encryption verified for sensitive information
- [ ] Access controls validated for all user roles
- [ ] Rate limiting configured and tested

## Deployment Process

### Phase 1: Infrastructure Preparation (30 minutes)
1. **Database Migration**
   ```bash
   # Run unified schema migration
   npm run migrate:production

   # Verify migration success
   npm run verify:schema
   ```

2. **Environment Configuration**
   ```bash
   # Set production environment variables
   export NODE_ENV=production
   export DATABASE_URL="your-production-database-url"
   export SUPABASE_URL="your-supabase-url"
   export SUPABASE_ANON_KEY="your-supabase-anon-key"
   ```

3. **Build System Preparation**
   ```bash
   # Install production dependencies
   npm ci --production

   # Build optimized production bundle
   npm run build

   # Generate design tokens for production
   npm run tokens:build
   ```

### Phase 2: System Deployment (45 minutes)
1. **Deploy Application**
   ```bash
   # Run integrated system deployment script
   ./scripts/deployment/integrated-system-deploy.sh
   ```

2. **Verify System Health**
   ```bash
   # Check application startup
   curl -f http://localhost:3000/api/health

   # Verify database connectivity
   curl -f http://localhost:3000/api/health/database

   # Test integrated systems
   curl -f http://localhost:3000/api/health/integrated-systems
   ```

3. **Initialize Monitoring**
   ```bash
   # Start monitoring services
   npm run monitoring:start

   # Configure alerting
   npm run alerting:configure
   ```

### Phase 3: Integration Validation (15 minutes)
1. **Dashboard Integration Test**
   - Navigate to `/agency-toolkit`
   - Verify all 4 HT-035 module cards are visible
   - Test navigation to each integrated system
   - Confirm real-time status indicators

2. **System Integration Test**
   - Test orchestration workflow creation and execution
   - Verify module management and activation
   - Test marketplace template installation
   - Confirm handover automation functionality

3. **Performance Validation**
   - Dashboard load time < 2 seconds
   - API response times < 500ms
   - Database query performance within limits
   - Memory usage within acceptable ranges

## Monitoring and Alerting

### Key Metrics to Monitor
- **Application Performance**
  - Dashboard load time
  - API response times
  - Database query performance
  - Memory and CPU usage

- **System Integration Health**
  - Orchestration workflow execution success rate
  - Module activation/deactivation success rate
  - Marketplace installation success rate
  - Handover automation completion rate

- **Error Rates**
  - Application error rate < 1%
  - API error rate < 0.5%
  - Database connection errors
  - Integration point failures

### Alert Thresholds
- **Critical Alerts**
  - Application down for > 1 minute
  - Database connectivity issues
  - Memory usage > 90%
  - Error rate > 5%

- **Warning Alerts**
  - Dashboard load time > 3 seconds
  - API response time > 1 second
  - Memory usage > 80%
  - Error rate > 2%

## Rollback Procedures

### Quick Rollback (Emergency)
```bash
# Stop current deployment
pm2 stop all

# Rollback to previous version
git checkout [PREVIOUS_RELEASE_TAG]
npm ci --production
npm run build
pm2 restart all
```

### Database Rollback
```bash
# Rollback database migration
npm run migrate:rollback

# Verify rollback success
npm run verify:rollback
```

## Post-Deployment Verification

### Functional Testing
1. **User Authentication**
   - Login/logout functionality
   - Role-based access control
   - Session management

2. **Core Agency Toolkit Features**
   - Dashboard navigation
   - Template management
   - Form builder functionality
   - Document generation

3. **Integrated HT-035 Features**
   - Orchestration workflow creation
   - Module management operations
   - Marketplace browsing and installation
   - Handover automation setup

### Performance Testing
1. **Load Testing**
   ```bash
   # Run production load test
   npm run test:load:production
   ```

2. **Stress Testing**
   ```bash
   # Run stress test on integrated systems
   npm run test:stress:integrated
   ```

## Maintenance and Support

### Regular Health Checks
- Daily: System health dashboard review
- Weekly: Performance metrics analysis
- Monthly: Security audit and update review

### Backup Procedures
- **Database Backups**: Automated daily backups with 30-day retention
- **Application Backups**: Weekly code repository snapshots
- **Configuration Backups**: Monthly environment configuration backups

### Support Escalation
1. **Level 1**: Basic system monitoring and restart procedures
2. **Level 2**: Performance optimization and minor bug fixes
3. **Level 3**: Architecture changes and major system modifications

## Troubleshooting Common Issues

### Dashboard Not Loading
1. Check application logs: `npm run logs:dashboard`
2. Verify database connectivity
3. Check static asset loading
4. Validate CDN configuration

### Integration Points Failing
1. Review API logs: `npm run logs:api`
2. Check database connection pool
3. Verify service-to-service authentication
4. Test individual system endpoints

### Performance Degradation
1. Monitor resource usage
2. Analyze slow query logs
3. Review cache performance
4. Check network connectivity

## Security Considerations

### Production Security Checklist
- [ ] All secrets stored in secure environment variables
- [ ] Database connections encrypted
- [ ] API endpoints properly authenticated
- [ ] Rate limiting configured on all public endpoints
- [ ] CORS policies properly configured
- [ ] Security headers implemented
- [ ] Input validation on all user inputs
- [ ] SQL injection protection verified

### Regular Security Tasks
- Weekly: Security log review
- Monthly: Dependency vulnerability scan
- Quarterly: Penetration testing
- Annually: Security architecture review

## Performance Optimization

### Caching Strategy
- **Application Cache**: Redis for session and API responses
- **Database Cache**: Query result caching for frequently accessed data
- **Static Assets**: CDN caching with 1-year expiry
- **Template Cache**: Compiled template caching

### Scaling Configuration
- **Horizontal Scaling**: Load balancer with 2+ application instances
- **Database Scaling**: Read replicas for query distribution
- **Cache Scaling**: Redis clustering for high availability
- **CDN Scaling**: Multi-region CDN distribution

---

**Deployment Completed:** Verify all systems are operational and monitoring is active.
**Next Steps:** Monitor system performance for first 24 hours and address any issues immediately.