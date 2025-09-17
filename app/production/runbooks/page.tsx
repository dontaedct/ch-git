'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Book, Clock, CheckCircle, FileText, Settings, Shield } from 'lucide-react';

interface RunbookStep {
  id: string;
  title: string;
  description: string;
  commands?: string[];
  timeEstimate: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  completed?: boolean;
}

interface Runbook {
  id: string;
  title: string;
  category: 'incident' | 'maintenance' | 'deployment' | 'security';
  description: string;
  steps: RunbookStep[];
  lastUpdated: string;
  author: string;
}

const ProductionRunbooksPage: React.FC = () => {
  const [selectedRunbook, setSelectedRunbook] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const runbooks: Runbook[] = [
    {
      id: 'incident-response',
      title: 'Incident Response Procedures',
      category: 'incident',
      description: 'Emergency response procedures for production incidents',
      lastUpdated: '2025-09-16',
      author: 'DevOps Team',
      steps: [
        {
          id: 'inc-1',
          title: 'Assess Incident Severity',
          description: 'Determine the impact and urgency of the incident',
          timeEstimate: '2 minutes',
          severity: 'critical'
        },
        {
          id: 'inc-2',
          title: 'Notify Stakeholders',
          description: 'Alert the appropriate teams and management',
          commands: ['slack alert #incidents', 'email stakeholders'],
          timeEstimate: '3 minutes',
          severity: 'critical'
        },
        {
          id: 'inc-3',
          title: 'Isolate the Problem',
          description: 'Identify and isolate affected systems',
          commands: ['kubectl get pods', 'docker ps', 'systemctl status'],
          timeEstimate: '5 minutes',
          severity: 'high'
        },
        {
          id: 'inc-4',
          title: 'Implement Immediate Fix',
          description: 'Apply quick fixes or rollback if possible',
          commands: ['kubectl rollout undo deployment', 'docker restart'],
          timeEstimate: '10 minutes',
          severity: 'high'
        },
        {
          id: 'inc-5',
          title: 'Monitor and Verify',
          description: 'Confirm the issue is resolved',
          timeEstimate: '5 minutes',
          severity: 'medium'
        },
        {
          id: 'inc-6',
          title: 'Post-Incident Review',
          description: 'Document findings and lessons learned',
          timeEstimate: '30 minutes',
          severity: 'low'
        }
      ]
    },
    {
      id: 'maintenance-procedures',
      title: 'Maintenance Procedures',
      category: 'maintenance',
      description: 'Regular maintenance and system updates',
      lastUpdated: '2025-09-16',
      author: 'Operations Team',
      steps: [
        {
          id: 'maint-1',
          title: 'Pre-Maintenance Checklist',
          description: 'Verify all prerequisites before maintenance',
          timeEstimate: '10 minutes',
          severity: 'medium'
        },
        {
          id: 'maint-2',
          title: 'Create Backup',
          description: 'Backup critical data and configurations',
          commands: ['pg_dump database', 'kubectl get all -o yaml'],
          timeEstimate: '15 minutes',
          severity: 'high'
        },
        {
          id: 'maint-3',
          title: 'Schedule Downtime',
          description: 'Notify users and schedule maintenance window',
          timeEstimate: '5 minutes',
          severity: 'medium'
        },
        {
          id: 'maint-4',
          title: 'Perform Updates',
          description: 'Apply system updates and patches',
          commands: ['apt update && apt upgrade', 'kubectl apply -f manifests/'],
          timeEstimate: '30 minutes',
          severity: 'high'
        },
        {
          id: 'maint-5',
          title: 'Verify System Health',
          description: 'Run health checks and performance tests',
          timeEstimate: '15 minutes',
          severity: 'medium'
        },
        {
          id: 'maint-6',
          title: 'Update Documentation',
          description: 'Document changes and update runbooks',
          timeEstimate: '10 minutes',
          severity: 'low'
        }
      ]
    },
    {
      id: 'deployment-procedures',
      title: 'Deployment Procedures',
      category: 'deployment',
      description: 'Standard deployment and rollback procedures',
      lastUpdated: '2025-09-16',
      author: 'DevOps Team',
      steps: [
        {
          id: 'deploy-1',
          title: 'Pre-Deployment Validation',
          description: 'Validate code quality and test results',
          timeEstimate: '5 minutes',
          severity: 'high'
        },
        {
          id: 'deploy-2',
          title: 'Prepare Deployment Environment',
          description: 'Ensure target environment is ready',
          commands: ['kubectl get nodes', 'docker system prune'],
          timeEstimate: '3 minutes',
          severity: 'medium'
        },
        {
          id: 'deploy-3',
          title: 'Deploy Application',
          description: 'Execute deployment process',
          commands: ['kubectl apply -f deployment.yaml', 'docker-compose up -d'],
          timeEstimate: '10 minutes',
          severity: 'high'
        },
        {
          id: 'deploy-4',
          title: 'Post-Deployment Testing',
          description: 'Verify deployment success',
          timeEstimate: '8 minutes',
          severity: 'high'
        },
        {
          id: 'deploy-5',
          title: 'Monitor Application',
          description: 'Monitor for any issues post-deployment',
          timeEstimate: '15 minutes',
          severity: 'medium'
        }
      ]
    },
    {
      id: 'security-procedures',
      title: 'Security Incident Procedures',
      category: 'security',
      description: 'Security incident response and mitigation',
      lastUpdated: '2025-09-16',
      author: 'Security Team',
      steps: [
        {
          id: 'sec-1',
          title: 'Identify Security Threat',
          description: 'Assess the nature and scope of security incident',
          timeEstimate: '5 minutes',
          severity: 'critical'
        },
        {
          id: 'sec-2',
          title: 'Isolate Affected Systems',
          description: 'Quarantine compromised systems',
          commands: ['iptables -A INPUT -s <ip> -j DROP', 'kubectl delete pod <pod>'],
          timeEstimate: '3 minutes',
          severity: 'critical'
        },
        {
          id: 'sec-3',
          title: 'Collect Evidence',
          description: 'Preserve logs and forensic evidence',
          commands: ['tar -czf logs.tar.gz /var/log/', 'kubectl logs <pod>'],
          timeEstimate: '10 minutes',
          severity: 'high'
        },
        {
          id: 'sec-4',
          title: 'Notify Security Team',
          description: 'Alert security personnel and management',
          timeEstimate: '2 minutes',
          severity: 'critical'
        },
        {
          id: 'sec-5',
          title: 'Implement Mitigation',
          description: 'Apply security patches and fixes',
          timeEstimate: '20 minutes',
          severity: 'high'
        },
        {
          id: 'sec-6',
          title: 'Security Audit',
          description: 'Conduct thorough security review',
          timeEstimate: '60 minutes',
          severity: 'medium'
        }
      ]
    }
  ];

  const toggleStepCompletion = (stepId: string) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId);
    } else {
      newCompleted.add(stepId);
    }
    setCompletedSteps(newCompleted);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'incident': return <AlertTriangle className="h-4 w-4" />;
      case 'maintenance': return <Settings className="h-4 w-4" />;
      case 'deployment': return <FileText className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      default: return <Book className="h-4 w-4" />;
    }
  };

  const selectedRunbookData = selectedRunbook ? runbooks.find(r => r.id === selectedRunbook) : null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Operational Runbooks</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive operational procedures for incident response, maintenance, and system operations
          </p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-600">
          Production Ready
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Runbook List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold">Available Runbooks</h2>
          {runbooks.map((runbook) => (
            <Card
              key={runbook.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedRunbook === runbook.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedRunbook(runbook.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(runbook.category)}
                  <CardTitle className="text-sm">{runbook.title}</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  {runbook.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{runbook.steps.length} steps</span>
                  <span>Updated: {runbook.lastUpdated}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Runbook Details */}
        <div className="lg:col-span-2">
          {selectedRunbookData ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {getCategoryIcon(selectedRunbookData.category)}
                  <CardTitle>{selectedRunbookData.title}</CardTitle>
                </div>
                <CardDescription>{selectedRunbookData.description}</CardDescription>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Author: {selectedRunbookData.author}</span>
                  <span>Last Updated: {selectedRunbookData.lastUpdated}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedRunbookData.steps.map((step) => (
                    <div key={step.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleStepCompletion(step.id)}
                          className={`mt-1 ${completedSteps.has(step.id) ? 'bg-green-100 text-green-700' : ''}`}
                        >
                          {completedSteps.has(step.id) ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                          )}
                        </Button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{step.title}</h4>
                            <Badge
                              variant="outline"
                              className={`text-xs ${getSeverityColor(step.severity)} text-white border-0`}
                            >
                              {step.severity}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {step.timeEstimate}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {step.description}
                          </p>
                          {step.commands && (
                            <div className="bg-gray-100 rounded p-2 text-xs font-mono">
                              {step.commands.map((command, index) => (
                                <div key={index} className="mb-1 last:mb-0">
                                  <span className="text-green-600">$</span> {command}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Progress Tracking</h4>
                  <div className="text-sm text-blue-700">
                    Completed: {completedSteps.size} / {selectedRunbookData.steps.length} steps
                    <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(completedSteps.size / selectedRunbookData.steps.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Book className="h-12 w-12 mx-auto mb-4" />
                <p>Select a runbook to view detailed procedures</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Reference & Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="escalation" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="escalation">Escalation Matrix</TabsTrigger>
              <TabsTrigger value="contacts">Emergency Contacts</TabsTrigger>
              <TabsTrigger value="tools">Essential Tools</TabsTrigger>
              <TabsTrigger value="guidelines">Best Practices</TabsTrigger>
            </TabsList>

            <TabsContent value="escalation" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-red-600 mb-2">Critical (P1)</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Complete system outage</li>
                    <li>• Security breach</li>
                    <li>• Data loss incident</li>
                    <li>• Immediate escalation required</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-orange-600 mb-2">High (P2)</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Major feature unavailable</li>
                    <li>• Performance degradation</li>
                    <li>• Multiple user impact</li>
                    <li>• 2-hour response time</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-yellow-600 mb-2">Medium (P3)</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Minor feature issues</li>
                    <li>• Limited user impact</li>
                    <li>• Workaround available</li>
                    <li>• 4-hour response time</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contacts" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Primary Contacts</h4>
                  <ul className="text-sm space-y-1">
                    <li>• On-Call Engineer: +1-555-0123</li>
                    <li>• DevOps Lead: devops@company.com</li>
                    <li>• Security Team: security@company.com</li>
                    <li>• Operations Manager: ops@company.com</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Communication Channels</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Slack: #incidents</li>
                    <li>• Slack: #operations</li>
                    <li>• PagerDuty: incidents.pagerduty.com</li>
                    <li>• Status Page: status.company.com</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tools" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Monitoring & Alerting</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Grafana: monitoring.company.com</li>
                    <li>• PagerDuty: alerts.pagerduty.com</li>
                    <li>• DataDog: app.datadoghq.com</li>
                    <li>• CloudWatch: aws.amazon.com</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Infrastructure</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Kubernetes: kubectl</li>
                    <li>• Docker: docker CLI</li>
                    <li>• AWS CLI: aws CLI</li>
                    <li>• Terraform: terraform CLI</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="guidelines" className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Operational Best Practices</h4>
                <ul className="text-sm space-y-2">
                  <li>• Always backup before making changes</li>
                  <li>• Document all actions taken during incidents</li>
                  <li>• Follow the principle of least privilege</li>
                  <li>• Test rollback procedures regularly</li>
                  <li>• Communicate status updates frequently</li>
                  <li>• Conduct post-incident reviews for all P1/P2 incidents</li>
                  <li>• Keep runbooks up to date with system changes</li>
                  <li>• Use automation where possible to reduce human error</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionRunbooksPage;