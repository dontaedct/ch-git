/**
 * Module Security Dashboard
 * 
 * Comprehensive security dashboard for monitoring and managing module security,
 * permissions, and compliance per PRD Section 7 requirements.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Activity,
  Users,
  Settings,
  Lock,
  Eye,
  RefreshCw,
  Download,
  Filter,
  Search,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface SecurityMetrics {
  overallScore: number;
  securityEvents: number;
  activeThreats: number;
  resolvedIncidents: number;
  complianceScore: number;
  permissionViolations: number;
  lastAudit: string;
}

interface SecurityEvent {
  id: string;
  type: 'authentication_failure' | 'authorization_failure' | 'permission_escalation' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  moduleId: string;
  userId?: string;
  status: 'open' | 'investigating' | 'resolved';
  details: Record<string, any>;
}

interface PermissionAudit {
  id: string;
  action: 'grant' | 'revoke' | 'check' | 'update';
  permission: string;
  userId?: string;
  moduleId: string;
  result: boolean;
  timestamp: string;
  reason?: string;
}

interface ComplianceStatus {
  standard: string;
  score: number;
  status: 'compliant' | 'non_compliant' | 'partial';
  lastAssessment: string;
  issues: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    requirement: string;
  }>;
}

interface ModuleSecurityStatus {
  moduleId: string;
  name: string;
  securityLevel: 'low' | 'medium' | 'high' | 'critical';
  isolationStatus: 'active' | 'partial' | 'disabled';
  permissionCount: number;
  lastSecurityCheck: string;
  issues: Array<{
    type: 'permission' | 'isolation' | 'vulnerability';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
  }>;
}

// =============================================================================
// MOCK DATA (In real implementation, this would come from APIs)
// =============================================================================

const mockSecurityMetrics: SecurityMetrics = {
  overallScore: 87,
  securityEvents: 23,
  activeThreats: 2,
  resolvedIncidents: 18,
  complianceScore: 92,
  permissionViolations: 5,
  lastAudit: '2025-01-20T10:30:00Z',
};

const mockSecurityEvents: SecurityEvent[] = [
  {
    id: 'event-1',
    type: 'authentication_failure',
    severity: 'medium',
    description: 'Multiple failed login attempts detected',
    timestamp: '2025-01-20T15:30:00Z',
    moduleId: 'user-management',
    userId: 'user-123',
    status: 'investigating',
    details: { attempts: 5, ip: '192.168.1.100' },
  },
  {
    id: 'event-2',
    type: 'permission_escalation',
    severity: 'high',
    description: 'Attempt to access admin functions without proper permissions',
    timestamp: '2025-01-20T14:15:00Z',
    moduleId: 'admin-panel',
    userId: 'user-456',
    status: 'open',
    details: { targetFunction: 'deleteUser', currentRole: 'viewer' },
  },
];

const mockPermissionAudits: PermissionAudit[] = [
  {
    id: 'audit-1',
    action: 'grant',
    permission: 'module.read',
    userId: 'user-123',
    moduleId: 'analytics',
    result: true,
    timestamp: '2025-01-20T16:00:00Z',
    reason: 'User role updated to analyst',
  },
  {
    id: 'audit-2',
    action: 'check',
    permission: 'module.admin',
    userId: 'user-456',
    moduleId: 'user-management',
    result: false,
    timestamp: '2025-01-20T15:45:00Z',
    reason: 'Insufficient privileges',
  },
];

const mockComplianceStatus: ComplianceStatus[] = [
  {
    standard: 'SOX',
    score: 95,
    status: 'compliant',
    lastAssessment: '2025-01-15T09:00:00Z',
    issues: [],
  },
  {
    standard: 'GDPR',
    score: 88,
    status: 'partial',
    lastAssessment: '2025-01-15T09:00:00Z',
    issues: [
      {
        severity: 'medium',
        description: 'Data retention policy needs documentation',
        requirement: 'Article 30 - Records of processing',
      },
    ],
  },
  {
    standard: 'ISO27001',
    score: 92,
    status: 'compliant',
    lastAssessment: '2025-01-15T09:00:00Z',
    issues: [],
  },
];

const mockModuleStatus: ModuleSecurityStatus[] = [
  {
    moduleId: 'user-management',
    name: 'User Management',
    securityLevel: 'high',
    isolationStatus: 'active',
    permissionCount: 15,
    lastSecurityCheck: '2025-01-20T12:00:00Z',
    issues: [
      {
        type: 'permission',
        severity: 'medium',
        description: 'Some permissions may be overly broad',
      },
    ],
  },
  {
    moduleId: 'analytics',
    name: 'Analytics Dashboard',
    securityLevel: 'medium',
    isolationStatus: 'active',
    permissionCount: 8,
    lastSecurityCheck: '2025-01-20T11:30:00Z',
    issues: [],
  },
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const formatTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString();
};

const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'critical': return 'destructive';
    case 'high': return 'destructive';
    case 'medium': return 'secondary';
    case 'low': return 'outline';
    default: return 'outline';
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'open': return 'destructive';
    case 'investigating': return 'secondary';
    case 'resolved': return 'default';
    case 'compliant': return 'default';
    case 'non_compliant': return 'destructive';
    case 'partial': return 'secondary';
    default: return 'outline';
  }
};

const getTrendIcon = (value: number, baseline: number) => {
  if (value > baseline * 1.1) return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (value < baseline * 0.9) return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-gray-500" />;
};

// =============================================================================
// COMPONENTS
// =============================================================================

const SecurityOverview: React.FC<{ metrics: SecurityMetrics }> = ({ metrics }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Security Score</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.overallScore}%</div>
          <Progress value={metrics.overallScore} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {getTrendIcon(metrics.overallScore, 85)} Overall security posture
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{metrics.activeThreats}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.resolvedIncidents} resolved this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Compliance</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.complianceScore}%</div>
          <Progress value={metrics.complianceScore} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {getTrendIcon(metrics.complianceScore, 90)} Across all standards
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Security Events</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.securityEvents}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.permissionViolations} permission violations
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const SecurityEventsList: React.FC<{ events: SecurityEvent[] }> = ({ events }) => {
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredEvents = events.filter(event => {
    const matchesFilter = filter === 'all' || event.status === filter;
    const matchesSearch = event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.moduleId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Security Events</CardTitle>
            <CardDescription>Recent security incidents and alerts</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-4 py-2 border rounded-md text-sm"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">All Events</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
            </select>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <div key={event.id} className="flex items-start space-x-4 p-4 border rounded-lg">
              <div className="flex-shrink-0">
                {event.severity === 'critical' || event.severity === 'high' ? (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                ) : (
                  <Shield className="h-5 w-5 text-yellow-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{event.description}</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getSeverityColor(event.severity)}>{event.severity}</Badge>
                    <Badge variant={getStatusColor(event.status)}>{event.status}</Badge>
                  </div>
                </div>
                <div className="mt-1">
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <span>Module: {event.moduleId}</span>
                    {event.userId && <span>User: {event.userId}</span>}
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                </div>
                {Object.keys(event.details).length > 0 && (
                  <div className="mt-2">
                    <details className="text-xs text-gray-600">
                      <summary className="cursor-pointer hover:text-gray-800">Details</summary>
                      <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                        {JSON.stringify(event.details, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            </div>
          ))}
          {filteredEvents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No security events found matching your criteria.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const PermissionAuditLog: React.FC<{ audits: PermissionAudit[] }> = ({ audits }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Permission Audit Log</CardTitle>
        <CardDescription>Recent permission changes and checks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {audits.map((audit) => (
            <div key={audit.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {audit.result ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {audit.action} {audit.permission}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 space-x-2">
                    <span>Module: {audit.moduleId}</span>
                    {audit.userId && <span>User: {audit.userId}</span>}
                    <span>{formatTimestamp(audit.timestamp)}</span>
                  </div>
                  {audit.reason && (
                    <p className="text-xs text-gray-600 mt-1">{audit.reason}</p>
                  )}
                </div>
              </div>
              <Badge variant={audit.result ? 'default' : 'destructive'}>
                {audit.result ? 'Allowed' : 'Denied'}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const ComplianceOverview: React.FC<{ compliance: ComplianceStatus[] }> = ({ compliance }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Overview</CardTitle>
        <CardDescription>Compliance status across different standards</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {compliance.map((item) => (
            <div key={item.standard} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.standard}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{item.score}%</span>
                  <Badge variant={getStatusColor(item.status)}>{item.status}</Badge>
                </div>
              </div>
              <Progress value={item.score} className="h-2" />
              {item.issues.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600 mb-1">Issues:</p>
                  {item.issues.map((issue, index) => (
                    <div key={index} className="text-xs p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                      <p className="font-medium">{issue.requirement}</p>
                      <p>{issue.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const ModuleSecurityStatus: React.FC<{ modules: ModuleSecurityStatus[] }> = ({ modules }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Module Security Status</CardTitle>
        <CardDescription>Security status and isolation for each module</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {modules.map((module) => (
            <div key={module.moduleId} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-medium">{module.name}</h4>
                  <p className="text-xs text-gray-500">ID: {module.moduleId}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getSeverityColor(module.securityLevel)}>
                    {module.securityLevel}
                  </Badge>
                  <Badge variant={module.isolationStatus === 'active' ? 'default' : 'destructive'}>
                    {module.isolationStatus}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-600">Permissions</p>
                  <p className="text-sm font-medium">{module.permissionCount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Last Check</p>
                  <p className="text-xs">{formatTimestamp(module.lastSecurityCheck)}</p>
                </div>
              </div>
              
              {module.issues.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 font-medium">Issues:</p>
                  {module.issues.map((issue, index) => (
                    <Alert key={index} className="py-2">
                      <AlertTriangle className="h-3 w-3" />
                      <AlertDescription className="text-xs">
                        <Badge variant={getSeverityColor(issue.severity)} className="mr-2 text-xs">
                          {issue.severity}
                        </Badge>
                        {issue.description}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ModuleSecurityDashboard() {
  const [metrics, setMetrics] = useState<SecurityMetrics>(mockSecurityMetrics);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>(mockSecurityEvents);
  const [permissionAudits, setPermissionAudits] = useState<PermissionAudit[]>(mockPermissionAudits);
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus[]>(mockComplianceStatus);
  const [moduleStatus, setModuleStatus] = useState<ModuleSecurityStatus[]>(mockModuleStatus);
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = async () => {
    setIsLoading(true);
    // In real implementation, fetch fresh data from APIs
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const exportReport = () => {
    // In real implementation, generate and download security report
    const reportData = {
      metrics,
      securityEvents,
      permissionAudits,
      complianceStatus,
      moduleStatus,
      generatedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Module Security Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportReport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <SecurityOverview metrics={metrics} />

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="permissions">Permission Audits</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="modules">Module Status</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <SecurityEventsList events={securityEvents} />
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <PermissionAuditLog audits={permissionAudits} />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <ComplianceOverview compliance={complianceStatus} />
        </TabsContent>

        <TabsContent value="modules" className="space-y-4">
          <ModuleSecurityStatus modules={moduleStatus} />
        </TabsContent>
      </Tabs>

      {metrics.activeThreats > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Active Security Threats Detected</AlertTitle>
          <AlertDescription className="text-red-700">
            There are {metrics.activeThreats} active security threats requiring immediate attention. 
            Please review the security events and take appropriate action.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
