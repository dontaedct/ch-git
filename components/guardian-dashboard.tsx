'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';
import { Button } from '@ui/button';
import { Badge } from '@ui/badge';
import { Progress } from '@ui/progress';
import { Alert, AlertDescription } from '@ui/alert';
import { Shield, Activity, HardDrive, GitBranch, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface GuardianHealth {
  git: {
    status: string;
    uncommittedFiles: number;
    hasRemote: boolean;
  };
  typescript: {
    status: string;
    errorCount: number;
  };
  eslint: {
    status: string;
    violationCount: number;
  };
  security: {
    status: string;
    issues: string[];
  };
  backup: {
    status: string;
    backupCount: number;
    hoursSinceLastBackup: number;
  };
}

interface GuardianStatus {
  status: 'success' | 'error';
  timestamp: string;
  health: GuardianHealth;
}

function GuardianDashboardContent() {
  const [health, setHealth] = useState<GuardianHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const backupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emergencyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/guardian/health');
      if (response.ok) {
        const data: GuardianStatus = await response.json();
        setHealth(data.health);
        setLastUpdate(new Date(data.timestamp));
        setError(null);
      } else {
        throw new Error('Failed to fetch health data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const triggerBackup = async () => {
    try {
      const response = await fetch('/api/guardian/backup', { method: 'POST' });
      if (response.ok) {
        // Refresh health data after backup
        const timeoutId = setTimeout(fetchHealth, 2000);
        // Store timeout ID for cleanup
        backupTimeoutRef.current = timeoutId;
      }
    } catch (err) {
      console.error('Backup failed:', err);
    }
  };

  const triggerEmergencyBackup = async () => {
    try {
      const response = await fetch('/api/guardian/emergency', { method: 'POST' });
      if (response.ok) {
        // Refresh health data after emergency backup
        const timeoutId = setTimeout(fetchHealth, 2000);
        // Store timeout ID for cleanup
        emergencyTimeoutRef.current = timeoutId;
      }
    } catch (err) {
      console.error('Emergency backup failed:', err);
    }
  };

  useEffect(() => {
    fetchHealth();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => {
      clearInterval(interval);
      // Clear any pending timeouts to prevent memory leaks
      if (backupTimeoutRef.current) {
        clearTimeout(backupTimeoutRef.current);
      }
      if (emergencyTimeoutRef.current) {
        clearTimeout(emergencyTimeoutRef.current);
      }
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'ERROR':
      case 'CRITICAL':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return 'bg-green-100 text-green-800';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ERROR':
      case 'CRITICAL':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !health) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Guardian Health Status
          </CardTitle>
          <CardDescription>Loading system health information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Guardian Safety System
          </CardTitle>
          <CardDescription>System Status</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to connect to Guardian system: {error}
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2"
                onClick={fetchHealth}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!health) {
    return null;
  }

  const criticalIssues = [
    !health.git.hasRemote && 'No remote backup configured',
    health.git.uncommittedFiles > 20 && `Too many uncommitted files (${health.git.uncommittedFiles})`,
    health.typescript.errorCount > 10 && `Too many TypeScript errors (${health.typescript.errorCount})`,
    health.eslint.violationCount > 5 && `Too many ESLint violations (${health.eslint.violationCount})`,
    health.security.status === 'CRITICAL' && 'Security vulnerabilities detected',
    health.backup.hoursSinceLastBackup > 24 && 'Backup is overdue'
  ].filter(Boolean);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Guardian Safety System
        </CardTitle>
        <CardDescription>
          Comprehensive protection against data corruption and loss
          {lastUpdate && (
            <span className="block text-xs text-gray-500 mt-1">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Critical Issues Alert */}
        {criticalIssues.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Critical Issues Detected:</strong>
              <ul className="mt-2 space-y-1">
                {criticalIssues.map((issue, index) => (
                  <li key={index} className="text-sm">• {issue}</li>
                ))}
              </ul>
              <div className="mt-3 space-x-2">
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={triggerEmergencyBackup}
                >
                  🚨 Emergency Backup
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={fetchHealth}
                >
                  Refresh Status
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* System Health Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Git Health */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                Git System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <Badge className={getStatusColor(health.git.status)}>
                  {health.git.status}
                </Badge>
                {getStatusIcon(health.git.status)}
              </div>
              <div className="text-sm space-y-1">
                <div>Uncommitted: {health.git.uncommittedFiles}</div>
                <div>Remote: {health.git.hasRemote ? '✅' : '❌'}</div>
              </div>
            </CardContent>
          </Card>

          {/* TypeScript Health */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4" />
                TypeScript
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <Badge className={getStatusColor(health.typescript.status)}>
                  {health.typescript.status}
                </Badge>
                {getStatusIcon(health.typescript.status)}
              </div>
              <div className="text-sm">
                Errors: {health.typescript.errorCount}
              </div>
              {health.typescript.errorCount > 0 && (
                <Progress 
                  value={Math.min((health.typescript.errorCount / 10) * 100, 100)} 
                  className="mt-2"
                />
              )}
            </CardContent>
          </Card>

          {/* ESLint Health */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4" />
                ESLint
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <Badge className={getStatusColor(health.eslint.status)}>
                  {health.eslint.status}
                </Badge>
                {getStatusIcon(health.eslint.status)}
              </div>
              <div className="text-sm">
                Violations: {health.eslint.violationCount}
              </div>
              {health.eslint.violationCount > 0 && (
                <Progress 
                  value={Math.min((health.eslint.violationCount / 5) * 100, 100)} 
                  className="mt-2"
                />
              )}
            </CardContent>
          </Card>

          {/* Security Health */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <Badge className={getStatusColor(health.security.status)}>
                  {health.security.status}
                </Badge>
                {getStatusIcon(health.security.status)}
              </div>
              <div className="text-sm">
                Issues: {health.security.issues.length}
              </div>
            </CardContent>
          </Card>

          {/* Backup Health */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                Backup System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <Badge className={getStatusColor(health.backup.status)}>
                  {health.backup.status}
                </Badge>
                {getStatusIcon(health.backup.status)}
              </div>
              <div className="text-sm space-y-1">
                <div>Count: {health.backup.backupCount}</div>
                <div>Last: {health.backup.hoursSinceLastBackup.toFixed(1)}h ago</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={triggerBackup} variant="outline" size="sm">
            <HardDrive className="h-4 w-4 mr-2" />
            Create Backup
          </Button>
          <Button onClick={fetchHealth} variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>
          {criticalIssues.length > 0 && (
            <Button onClick={triggerEmergencyBackup} variant="destructive" size="sm">
              🚨 Emergency Backup
            </Button>
          )}
        </div>

        {/* Status Summary */}
        <div className="text-xs text-gray-500 text-center">
          Guardian is actively monitoring your system for threats and automatically protecting your work
        </div>
      </CardContent>
    </Card>
  );
}

export function GuardianDashboard() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Guardian Health Status
            </CardTitle>
            <CardDescription>Loading system health information...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <GuardianDashboardContent />
    </Suspense>
  );
}
