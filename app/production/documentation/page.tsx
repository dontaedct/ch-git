'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Download,
  ExternalLink,
  BookOpen,
  Settings,
  Shield,
  Zap,
  Database,
  Server,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

interface DocumentSection {
  id: string;
  title: string;
  description: string;
  category: 'operational' | 'deployment' | 'readiness' | 'troubleshooting';
  lastUpdated: string;
  version: string;
  status: 'current' | 'draft' | 'archived';
  content: string[];
}

const ProductionDocumentationPage: React.FC = () => {
  const [activeDocument, setActiveDocument] = useState<string>('deployment-guide');

  const documentationSections: DocumentSection[] = [
    {
      id: 'deployment-guide',
      title: 'Production Deployment Guide',
      description: 'Complete guide for deploying applications to production',
      category: 'deployment',
      lastUpdated: '2025-09-16',
      version: '2.1',
      status: 'current',
      content: [
        '## Pre-Deployment Checklist',
        '- [ ] Code review completed and approved',
        '- [ ] All tests passing (unit, integration, e2e)',
        '- [ ] Security scan completed with no critical issues',
        '- [ ] Performance benchmarks met',
        '- [ ] Database migrations tested in staging',
        '- [ ] Rollback plan documented and tested',
        '- [ ] Monitoring and alerting configured',
        '- [ ] Stakeholders notified of deployment window',
        '',
        '## Deployment Process',
        '### Step 1: Environment Preparation',
        '```bash',
        '# Verify environment health',
        'kubectl get nodes',
        'kubectl get pods --all-namespaces',
        'docker system df',
        '```',
        '',
        '### Step 2: Backup Current State',
        '```bash',
        '# Create database backup',
        'pg_dump production_db > backup_$(date +%Y%m%d_%H%M%S).sql',
        '',
        '# Export current configuration',
        'kubectl get all -o yaml > current_state_$(date +%Y%m%d_%H%M%S).yaml',
        '```',
        '',
        '### Step 3: Deploy Application',
        '```bash',
        '# Apply new deployment',
        'kubectl apply -f deployment.yaml',
        '',
        '# Watch rollout status',
        'kubectl rollout status deployment/my-app',
        '',
        '# Verify pods are running',
        'kubectl get pods -l app=my-app',
        '```',
        '',
        '### Step 4: Post-Deployment Validation',
        '- Run smoke tests on critical endpoints',
        '- Verify database connectivity and performance',
        '- Check application logs for errors',
        '- Monitor key metrics for 15 minutes',
        '- Update status page if applicable',
        '',
        '## Rollback Procedure',
        '### Automatic Rollback Triggers',
        '- Error rate > 1% for 5 minutes',
        '- Response time > 2x baseline for 10 minutes',
        '- Health check failures > 50%',
        '- Critical security alert',
        '',
        '### Manual Rollback Process',
        '```bash',
        '# Rollback to previous version',
        'kubectl rollout undo deployment/my-app',
        '',
        '# Verify rollback success',
        'kubectl rollout status deployment/my-app',
        '',
        '# Restore database if needed',
        'psql production_db < backup_file.sql',
        '```'
      ]
    },
    {
      id: 'operational-procedures',
      title: 'Operational Procedures',
      description: 'Day-to-day operational procedures and best practices',
      category: 'operational',
      lastUpdated: '2025-09-16',
      version: '1.8',
      status: 'current',
      content: [
        '## Daily Operations',
        '### Morning Health Check (09:00 UTC)',
        '- [ ] Review overnight alerts and incidents',
        '- [ ] Check system resource utilization',
        '- [ ] Verify backup completion status',
        '- [ ] Review security monitoring dashboard',
        '- [ ] Update team on any issues or maintenance',
        '',
        '### System Monitoring',
        '#### Key Metrics to Monitor',
        '- **Response Time**: < 500ms (95th percentile)',
        '- **Error Rate**: < 0.1%',
        '- **CPU Utilization**: < 70%',
        '- **Memory Usage**: < 80%',
        '- **Disk Usage**: < 85%',
        '- **Database Connections**: < 80% of max',
        '',
        '#### Alert Escalation Matrix',
        '**P1 - Critical (Immediate Response)**',
        '- Complete system outage',
        '- Security breach detected',
        '- Data corruption or loss',
        '- Response: Page on-call engineer immediately',
        '',
        '**P2 - High (30 minutes)**',
        '- Major feature unavailable',
        '- Significant performance degradation',
        '- Database connectivity issues',
        '- Response: Contact on-call engineer via phone',
        '',
        '**P3 - Medium (2 hours)**',
        '- Minor feature issues',
        '- Elevated error rates',
        '- Non-critical service degradation',
        '- Response: Create ticket and notify team',
        '',
        '## Maintenance Procedures',
        '### Weekly Maintenance (Sundays 02:00 UTC)',
        '```bash',
        '# System updates',
        'sudo apt update && sudo apt upgrade',
        '',
        '# Docker cleanup',
        'docker system prune -f',
        '',
        '# Log rotation',
        'sudo logrotate -f /etc/logrotate.conf',
        '',
        '# Certificate check',
        'openssl x509 -in /etc/ssl/certs/server.crt -text -noout | grep "Not After"',
        '```',
        '',
        '### Monthly Tasks',
        '- [ ] Review and update security policies',
        '- [ ] Audit user access and permissions',
        '- [ ] Review and archive old logs',
        '- [ ] Update disaster recovery documentation',
        '- [ ] Conduct backup restoration test',
        '- [ ] Review and update monitoring thresholds'
      ]
    },
    {
      id: 'production-readiness',
      title: 'Production Readiness Checklist',
      description: 'Comprehensive checklist for production readiness assessment',
      category: 'readiness',
      lastUpdated: '2025-09-16',
      version: '3.0',
      status: 'current',
      content: [
        '## Infrastructure Readiness',
        '### Compute Resources',
        '- [ ] Adequate CPU and memory allocation',
        '- [ ] Auto-scaling configured and tested',
        '- [ ] Load balancing properly configured',
        '- [ ] Health checks implemented',
        '- [ ] Resource limits and requests defined',
        '',
        '### Storage & Database',
        '- [ ] Database backup strategy implemented',
        '- [ ] Database performance optimized',
        '- [ ] Connection pooling configured',
        '- [ ] Storage encryption enabled',
        '- [ ] Disaster recovery plan tested',
        '',
        '### Network & Security',
        '- [ ] SSL/TLS certificates valid and monitored',
        '- [ ] Firewall rules properly configured',
        '- [ ] DDoS protection enabled',
        '- [ ] VPN access configured for admin tasks',
        '- [ ] Security scanning automated',
        '',
        '## Application Readiness',
        '### Code Quality',
        '- [ ] Code coverage > 80%',
        '- [ ] Security vulnerabilities addressed',
        '- [ ] Performance benchmarks met',
        '- [ ] Error handling comprehensive',
        '- [ ] Logging properly implemented',
        '',
        '### Configuration Management',
        '- [ ] Environment variables properly set',
        '- [ ] Configuration externalized',
        '- [ ] Secrets management implemented',
        '- [ ] Feature flags configured',
        '- [ ] Environment parity maintained',
        '',
        '### API & Integration',
        '- [ ] API rate limiting implemented',
        '- [ ] API documentation updated',
        '- [ ] Integration tests passing',
        '- [ ] Timeout and retry logic implemented',
        '- [ ] Circuit breakers configured',
        '',
        '## Operational Readiness',
        '### Monitoring & Alerting',
        '- [ ] Application metrics collected',
        '- [ ] Infrastructure monitoring active',
        '- [ ] Log aggregation configured',
        '- [ ] Alert rules defined and tested',
        '- [ ] Dashboards created for key metrics',
        '',
        '### Documentation',
        '- [ ] Runbooks created and updated',
        '- [ ] API documentation complete',
        '- [ ] Architecture diagrams current',
        '- [ ] Troubleshooting guides available',
        '- [ ] Contact information updated',
        '',
        '### Team Readiness',
        '- [ ] On-call rotation established',
        '- [ ] Team trained on systems',
        '- [ ] Escalation procedures documented',
        '- [ ] Communication channels established',
        '- [ ] Post-incident review process defined',
        '',
        '## Compliance & Governance',
        '### Security Compliance',
        '- [ ] Data privacy requirements met',
        '- [ ] Access controls implemented',
        '- [ ] Audit logging enabled',
        '- [ ] Compliance scans passing',
        '- [ ] Security policies documented',
        '',
        '### Business Continuity',
        '- [ ] Disaster recovery plan tested',
        '- [ ] Business impact assessment completed',
        '- [ ] SLA requirements documented',
        '- [ ] Risk assessment completed',
        '- [ ] Insurance and legal requirements met'
      ]
    },
    {
      id: 'troubleshooting-guide',
      title: 'Troubleshooting Guide',
      description: 'Common issues and their solutions for production systems',
      category: 'troubleshooting',
      lastUpdated: '2025-09-16',
      version: '2.5',
      status: 'current',
      content: [
        '## Common Issues & Solutions',
        '',
        '### Application Not Starting',
        '**Symptoms:**',
        '- Pods in CrashLoopBackOff state',
        '- Application containers failing to start',
        '- Health checks failing',
        '',
        '**Diagnosis:**',
        '```bash',
        '# Check pod status',
        'kubectl get pods',
        '',
        '# Check pod logs',
        'kubectl logs <pod-name> --previous',
        '',
        '# Describe pod for events',
        'kubectl describe pod <pod-name>',
        '```',
        '',
        '**Common Causes & Solutions:**',
        '1. **Configuration Error**',
        '   - Check environment variables',
        '   - Verify ConfigMap and Secret mounts',
        '   - Validate configuration syntax',
        '',
        '2. **Resource Constraints**',
        '   - Increase CPU/memory limits',
        '   - Check node resource availability',
        '   - Review resource requests vs limits',
        '',
        '3. **Dependency Issues**',
        '   - Check database connectivity',
        '   - Verify external service availability',
        '   - Test network connectivity',
        '',
        '### High Response Times',
        '**Symptoms:**',
        '- API endpoints responding slowly',
        '- User reports of slow page loads',
        '- Monitoring shows elevated response times',
        '',
        '**Diagnosis:**',
        '```bash',
        '# Check application metrics',
        'curl http://localhost:8080/metrics',
        '',
        '# Monitor database performance',
        'psql -c "SELECT * FROM pg_stat_activity;"',
        '',
        '# Check system resources',
        'top',
        'iostat',
        'free -h',
        '```',
        '',
        '**Common Causes & Solutions:**',
        '1. **Database Performance**',
        '   - Identify slow queries',
        '   - Check for missing indexes',
        '   - Analyze query execution plans',
        '   - Consider connection pooling',
        '',
        '2. **Resource Bottlenecks**',
        '   - Scale horizontal replicas',
        '   - Increase vertical resources',
        '   - Optimize code hot paths',
        '   - Implement caching',
        '',
        '3. **External Dependencies**',
        '   - Check third-party service status',
        '   - Implement circuit breakers',
        '   - Add timeout configurations',
        '   - Use bulkhead patterns',
        '',
        '### Database Connection Issues',
        '**Symptoms:**',
        '- Connection timeout errors',
        '- "Too many connections" errors',
        '- Intermittent database failures',
        '',
        '**Diagnosis:**',
        '```sql',
        '-- Check active connections',
        'SELECT count(*) FROM pg_stat_activity;',
        '',
        '-- Check connection limits',
        'SHOW max_connections;',
        '',
        '-- Check for long-running queries',
        'SELECT pid, now() - pg_stat_activity.query_start AS duration, query ',
        'FROM pg_stat_activity ',
        'WHERE (now() - pg_stat_activity.query_start) > interval \'5 minutes\';',
        '```',
        '',
        '**Solutions:**',
        '1. **Connection Pool Tuning**',
        '   - Adjust pool size settings',
        '   - Configure connection timeouts',
        '   - Implement connection health checks',
        '',
        '2. **Query Optimization**',
        '   - Kill long-running queries',
        '   - Optimize slow queries',
        '   - Add proper indexes',
        '',
        '3. **Infrastructure Scaling**',
        '   - Increase database connections limit',
        '   - Add read replicas',
        '   - Implement database sharding',
        '',
        '### Memory Leaks',
        '**Symptoms:**',
        '- Gradually increasing memory usage',
        '- Out of Memory (OOM) kills',
        '- Application becoming unresponsive',
        '',
        '**Diagnosis:**',
        '```bash',
        '# Monitor memory usage over time',
        'watch -n 1 "free -h"',
        '',
        '# Check process memory usage',
        'ps aux --sort=-%mem | head',
        '',
        '# Analyze heap dumps (for Java apps)',
        'jcmd <pid> GC.run_finalization',
        'jcmd <pid> VM.gc',
        '```',
        '',
        '**Solutions:**',
        '1. **Application Level**',
        '   - Profile application memory usage',
        '   - Fix identified memory leaks',
        '   - Implement proper resource cleanup',
        '   - Tune garbage collection settings',
        '',
        '2. **Container Level**',
        '   - Adjust memory limits and requests',
        '   - Implement memory monitoring',
        '   - Configure OOM handling',
        '',
        '## Emergency Procedures',
        '',
        '### Complete System Outage',
        '1. **Immediate Actions (0-5 minutes)**',
        '   - Confirm outage scope',
        '   - Page on-call team',
        '   - Post status update',
        '   - Begin incident response',
        '',
        '2. **Investigation (5-15 minutes)**',
        '   - Check monitoring dashboards',
        '   - Review recent deployments',
        '   - Analyze error logs',
        '   - Test basic connectivity',
        '',
        '3. **Resolution (15+ minutes)**',
        '   - Implement fix or rollback',
        '   - Verify system recovery',
        '   - Monitor for stability',
        '   - Communicate resolution',
        '',
        '### Security Incident',
        '1. **Immediate Response**',
        '   - Isolate affected systems',
        '   - Preserve evidence',
        '   - Notify security team',
        '   - Begin incident logging',
        '',
        '2. **Investigation**',
        '   - Analyze attack vectors',
        '   - Assess data impact',
        '   - Review access logs',
        '   - Coordinate with legal/compliance',
        '',
        '3. **Recovery**',
        '   - Implement security patches',
        '   - Reset compromised credentials',
        '   - Update security policies',
        '   - Conduct post-incident review'
      ]
    }
  ];

  const activeDoc = documentationSections.find(doc => doc.id === activeDocument);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'operational': return <Settings className="h-4 w-4" />;
      case 'deployment': return <Zap className="h-4 w-4" />;
      case 'readiness': return <CheckCircle className="h-4 w-4" />;
      case 'troubleshooting': return <AlertTriangle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'operational': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'deployment': return 'text-green-600 bg-green-50 border-green-200';
      case 'readiness': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'troubleshooting': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatContent = (content: string[]) => {
    return content.map((line, index) => {
      if (line.startsWith('##')) {
        return <h2 key={index} className="text-xl font-bold mt-6 mb-3">{line.replace('##', '').trim()}</h2>;
      } else if (line.startsWith('###')) {
        return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{line.replace('###', '').trim()}</h3>;
      } else if (line.startsWith('####')) {
        return <h4 key={index} className="text-md font-medium mt-3 mb-2">{line.replace('####', '').trim()}</h4>;
      } else if (line.startsWith('```')) {
        return line === '```' ? null : <div key={index} className="bg-gray-900 text-gray-100 p-3 rounded text-sm font-mono mt-2 mb-2">{line.replace('```', '')}</div>;
      } else if (line.startsWith('- [ ]')) {
        return <div key={index} className="flex items-center gap-2 ml-4 my-1"><input type="checkbox" className="rounded" /><span className="text-sm">{line.replace('- [ ]', '').trim()}</span></div>;
      } else if (line.startsWith('- ')) {
        return <div key={index} className="ml-4 my-1 text-sm">• {line.replace('- ', '').trim()}</div>;
      } else if (line.startsWith('**') && line.endsWith('**')) {
        return <div key={index} className="font-semibold mt-2 mb-1">{line.replace(/\*\*/g, '')}</div>;
      } else if (line.trim() === '') {
        return <div key={index} className="h-2"></div>;
      } else {
        return <p key={index} className="my-2 text-sm text-muted-foreground">{line}</p>;
      }
    }).filter(Boolean);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Production Excellence Documentation</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive operational documentation, deployment guides, and production readiness resources
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
          <Badge variant="outline" className="text-green-600 border-green-600">
            Documentation Complete
          </Badge>
        </div>
      </div>

      {/* Documentation Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">4</p>
                <p className="text-sm text-muted-foreground">Guides</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">100%</p>
                <p className="text-sm text-muted-foreground">Coverage</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">Current</p>
                <p className="text-sm text-muted-foreground">All Updated</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Info className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">Live</p>
                <p className="text-sm text-muted-foreground">Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Document List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Documentation Sections</h2>
          {documentationSections.map((doc) => (
            <Card
              key={doc.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                activeDocument === doc.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setActiveDocument(doc.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(doc.category)}
                  <CardTitle className="text-sm">{doc.title}</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  {doc.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-xs">
                  <Badge
                    variant="outline"
                    className={`text-xs ${getCategoryColor(doc.category)}`}
                  >
                    {doc.category}
                  </Badge>
                  <span className="text-muted-foreground">v{doc.version}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Document Content */}
        <div className="lg:col-span-3">
          {activeDoc && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(activeDoc.category)}
                    <div>
                      <CardTitle>{activeDoc.title}</CardTitle>
                      <CardDescription>{activeDoc.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Version: {activeDoc.version}</span>
                  <span>Updated: {activeDoc.lastUpdated}</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {activeDoc.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {formatContent(activeDoc.content)}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Access */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Access Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Emergency Contacts
              </h4>
              <ul className="text-sm space-y-1">
                <li>• On-Call Engineer: +1-555-0123</li>
                <li>• DevOps Lead: devops@company.com</li>
                <li>• Security Team: security@company.com</li>
                <li>• Incident Commander: incidents@company.com</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-blue-500" />
                External Resources
              </h4>
              <ul className="text-sm space-y-1">
                <li>• Monitoring Dashboard</li>
                <li>• Status Page</li>
                <li>• Log Aggregation</li>
                <li>• Incident Management</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-500" />
                Related Documentation
              </h4>
              <ul className="text-sm space-y-1">
                <li>• API Documentation</li>
                <li>• Architecture Diagrams</li>
                <li>• Security Policies</li>
                <li>• Compliance Reports</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionDocumentationPage;