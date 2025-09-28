/**
 * HT-035.3.2: Module Installation Interface
 * 
 * Admin dashboard interface for module installation, management, and monitoring
 * per PRD requirements.
 * 
 * Features:
 * - Module installation wizard
 * - Installation progress monitoring
 * - Installation history view
 * - Rollback management
 * - Installation analytics
 * - Dependency visualization
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  Upload, 
  Trash2, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  BarChart3,
  History,
  Settings,
  Play,
  Pause,
  Square
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface ModuleInstallation {
  id: string;
  moduleId: string;
  tenantId: string;
  version: string;
  status: 'pending' | 'validating' | 'downloading' | 'installing' | 'configuring' | 'testing' | 'completed' | 'failed' | 'rolled_back';
  progress: number;
  currentStep: string;
  totalSteps: number;
  startedAt: string;
  completedAt?: string;
  estimatedCompletion?: string;
  duration: number;
  error?: string;
  warnings: string[];
}

interface InstallationHistory {
  id: string;
  moduleId: string;
  tenantId: string;
  version: string;
  action: 'install' | 'uninstall' | 'update' | 'rollback';
  fromVersion?: string;
  toVersion?: string;
  status: 'success' | 'failed' | 'partial' | 'cancelled';
  timestamp: string;
  duration: number;
  initiatedBy: string;
  rollbackId?: string;
}

interface InstallationAnalytics {
  moduleId: string;
  tenantId: string;
  totalInstallations: number;
  successfulInstallations: number;
  failedInstallations: number;
  averageInstallationTime: number;
  lastInstallation?: string;
  installationTrends: Array<{
    date: string;
    count: number;
    successRate: number;
  }>;
  commonIssues: string[];
  performanceMetrics: {
    averageProgressRate: number;
    averageStepDuration: number;
    bottleneckSteps: string[];
  };
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ModuleInstallationInterface() {
  const [activeTab, setActiveTab] = useState('install');
  const [installations, setInstallations] = useState<ModuleInstallation[]>([]);
  const [history, setHistory] = useState<InstallationHistory[]>([]);
  const [analytics, setAnalytics] = useState<InstallationAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Installation form state
  const [installForm, setInstallForm] = useState({
    moduleId: '',
    version: '',
    tenantId: '',
    skipValidation: false,
    skipTests: false,
    forceInstall: false,
    installDependencies: true,
  });

  // Uninstall form state
  const [uninstallForm, setUninstallForm] = useState({
    moduleId: '',
    tenantId: '',
    forceUninstall: false,
    cleanupData: true,
    skipValidation: false,
    createBackup: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load active installations
      const installationsResponse = await fetch('/api/marketplace/installations');
      if (installationsResponse.ok) {
        const installationsData = await installationsResponse.json();
        setInstallations(installationsData.installations || []);
      }

      // Load installation history
      const historyResponse = await fetch('/api/marketplace/history');
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setHistory(historyData.history || []);
      }

      // Load analytics
      const analyticsResponse = await fetch('/api/marketplace/analytics');
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData.analytics);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/marketplace/install', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(installForm),
      });

      const result = await response.json();

      if (result.success) {
        // Reset form
        setInstallForm({
          moduleId: '',
          version: '',
          tenantId: '',
          skipValidation: false,
          skipTests: false,
          forceInstall: false,
          installDependencies: true,
        });
        
        // Reload data
        await loadData();
        
        // Switch to progress tab
        setActiveTab('progress');
      } else {
        setError(result.error || 'Installation failed');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Installation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUninstall = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/marketplace/uninstall', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uninstallForm),
      });

      const result = await response.json();

      if (result.success) {
        // Reset form
        setUninstallForm({
          moduleId: '',
          tenantId: '',
          forceUninstall: false,
          cleanupData: true,
          skipValidation: false,
          createBackup: true,
        });
        
        // Reload data
        await loadData();
      } else {
        setError(result.error || 'Uninstallation failed');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Uninstallation failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
      case 'running':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      success: 'default',
      failed: 'destructive',
      pending: 'secondary',
      running: 'secondary',
      partial: 'outline',
      cancelled: 'outline',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Module Installation Management</h1>
          <p className="text-muted-foreground">
            Install, manage, and monitor modules across tenants
          </p>
        </div>
        <Button onClick={loadData} disabled={loading}>
          <Settings className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="install">Install</TabsTrigger>
          <TabsTrigger value="uninstall">Uninstall</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Install Tab */}
        <TabsContent value="install" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="h-5 w-5 mr-2" />
                Install Module
              </CardTitle>
              <CardDescription>
                Install a new module for a tenant with dependency resolution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="moduleId">Module ID</Label>
                  <Input
                    id="moduleId"
                    value={installForm.moduleId}
                    onChange={(e) => setInstallForm({ ...installForm, moduleId: e.target.value })}
                    placeholder="Enter module ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={installForm.version}
                    onChange={(e) => setInstallForm({ ...installForm, version: e.target.value })}
                    placeholder="Latest version"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenantId">Tenant ID</Label>
                <Input
                  id="tenantId"
                  value={installForm.tenantId}
                  onChange={(e) => setInstallForm({ ...installForm, tenantId: e.target.value })}
                  placeholder="Enter tenant ID"
                />
              </div>

              <div className="space-y-4">
                <Label>Installation Options</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="skipValidation"
                      checked={installForm.skipValidation}
                      onCheckedChange={(checked) => setInstallForm({ ...installForm, skipValidation: !!checked })}
                    />
                    <Label htmlFor="skipValidation">Skip Validation</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="skipTests"
                      checked={installForm.skipTests}
                      onCheckedChange={(checked) => setInstallForm({ ...installForm, skipTests: !!checked })}
                    />
                    <Label htmlFor="skipTests">Skip Tests</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="forceInstall"
                      checked={installForm.forceInstall}
                      onCheckedChange={(checked) => setInstallForm({ ...installForm, forceInstall: !!checked })}
                    />
                    <Label htmlFor="forceInstall">Force Install</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="installDependencies"
                      checked={installForm.installDependencies}
                      onCheckedChange={(checked) => setInstallForm({ ...installForm, installDependencies: !!checked })}
                    />
                    <Label htmlFor="installDependencies">Install Dependencies</Label>
                  </div>
                </div>
              </div>

              <Button onClick={handleInstall} disabled={loading || !installForm.moduleId || !installForm.tenantId}>
                <Play className="h-4 w-4 mr-2" />
                {loading ? 'Installing...' : 'Install Module'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Uninstall Tab */}
        <TabsContent value="uninstall" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trash2 className="h-5 w-5 mr-2" />
                Uninstall Module
              </CardTitle>
              <CardDescription>
                Remove a module from a tenant with cleanup options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="uninstallModuleId">Module ID</Label>
                  <Input
                    id="uninstallModuleId"
                    value={uninstallForm.moduleId}
                    onChange={(e) => setUninstallForm({ ...uninstallForm, moduleId: e.target.value })}
                    placeholder="Enter module ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uninstallTenantId">Tenant ID</Label>
                  <Input
                    id="uninstallTenantId"
                    value={uninstallForm.tenantId}
                    onChange={(e) => setUninstallForm({ ...uninstallForm, tenantId: e.target.value })}
                    placeholder="Enter tenant ID"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Uninstallation Options</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="forceUninstall"
                      checked={uninstallForm.forceUninstall}
                      onCheckedChange={(checked) => setUninstallForm({ ...uninstallForm, forceUninstall: !!checked })}
                    />
                    <Label htmlFor="forceUninstall">Force Uninstall</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cleanupData"
                      checked={uninstallForm.cleanupData}
                      onCheckedChange={(checked) => setUninstallForm({ ...uninstallForm, cleanupData: !!checked })}
                    />
                    <Label htmlFor="cleanupData">Cleanup Data</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="skipValidation"
                      checked={uninstallForm.skipValidation}
                      onCheckedChange={(checked) => setUninstallForm({ ...uninstallForm, skipValidation: !!checked })}
                    />
                    <Label htmlFor="skipValidation">Skip Validation</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="createBackup"
                      checked={uninstallForm.createBackup}
                      onCheckedChange={(checked) => setUninstallForm({ ...uninstallForm, createBackup: !!checked })}
                    />
                    <Label htmlFor="createBackup">Create Backup</Label>
                  </div>
                </div>
              </div>

              <Button onClick={handleUninstall} disabled={loading || !uninstallForm.moduleId || !uninstallForm.tenantId}>
                <Trash2 className="h-4 w-4 mr-2" />
                {loading ? 'Uninstalling...' : 'Uninstall Module'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Installation Progress
              </CardTitle>
              <CardDescription>
                Monitor active installations and their progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {installations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active installations
                </div>
              ) : (
                <div className="space-y-4">
                  {installations.map((installation) => (
                    <Card key={installation.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(installation.status)}
                            <span className="font-medium">{installation.moduleId}</span>
                            <Badge variant="outline">{installation.version}</Badge>
                            {getStatusBadge(installation.status)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {installation.tenantId}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{installation.currentStep}</span>
                            <span>{installation.progress}%</span>
                          </div>
                          <Progress value={installation.progress} className="h-2" />
                        </div>

                        {installation.error && (
                          <Alert variant="destructive" className="mt-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{installation.error}</AlertDescription>
                          </Alert>
                        )}

                        {installation.warnings.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Warnings:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {installation.warnings.map((warning, index) => (
                                <li key={index}>• {warning}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex justify-between text-sm text-muted-foreground mt-4">
                          <span>Started: {new Date(installation.startedAt).toLocaleString()}</span>
                          <span>Duration: {Math.round(installation.duration / 1000)}s</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="h-5 w-5 mr-2" />
                Installation History
              </CardTitle>
              <CardDescription>
                View past installation, update, and uninstallation activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No installation history
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(item.status)}
                            <span className="font-medium">{item.moduleId}</span>
                            <Badge variant="outline">{item.action}</Badge>
                            {getStatusBadge(item.status)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(item.timestamp).toLocaleString()}
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          <div>Version: {item.version}</div>
                          {item.fromVersion && <div>From: {item.fromVersion}</div>}
                          <div>Duration: {Math.round(item.duration / 1000)}s</div>
                          <div>Initiated by: {item.initiatedBy}</div>
                          {item.rollbackId && <div>Rollback ID: {item.rollbackId}</div>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Installation Analytics
              </CardTitle>
              <CardDescription>
                View installation statistics and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Installation Statistics</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Installations:</span>
                          <span>{analytics.totalInstallations}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Successful:</span>
                          <span className="text-green-600">{analytics.successfulInstallations}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Failed:</span>
                          <span className="text-red-600">{analytics.failedInstallations}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Average Time:</span>
                          <span>{Math.round(analytics.averageInstallationTime / 1000)}s</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Common Issues</h3>
                      <ul className="text-sm space-y-1">
                        {analytics.commonIssues.map((issue, index) => (
                          <li key={index} className="text-muted-foreground">• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Performance Metrics</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Avg Progress Rate:</span>
                          <span>{analytics.performanceMetrics.averageProgressRate}%/min</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Step Duration:</span>
                          <span>{Math.round(analytics.performanceMetrics.averageStepDuration / 1000)}s</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bottleneck Steps:</span>
                          <span>{analytics.performanceMetrics.bottleneckSteps.join(', ')}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Recent Trends</h3>
                      <div className="space-y-1 text-sm">
                        {analytics.installationTrends.slice(0, 7).map((trend, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{trend.date}</span>
                            <span>{trend.count} ({trend.successRate.toFixed(1)}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No analytics data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
