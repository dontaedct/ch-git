/**
 * @fileoverview Version Manager Component - HT-032.3.2
 * @module components/admin/version-manager
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Version management interface components with version comparison,
 * rollback capabilities, and migration management.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  GitBranch, 
  History, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  ArrowLeft,
  Download,
  Upload,
  RefreshCw,
  Shield,
  Zap,
  Info,
  GitCompare,
  Rollback,
  Tag,
  FileText,
  Package,
  Settings,
  Play,
  Pause,
  MoreVertical
} from 'lucide-react';
import { 
  TemplateVersionInfo, 
  VersionCreateOptions,
  VersionRollbackOptions,
  getTemplateVersioningSystem 
} from '@/lib/templates/versioning-system';
import { 
  getTemplateCompatibilityChecker, 
  CompatibilityCheckResult 
} from '@/lib/templates/compatibility-checker';

interface VersionManagerProps {
  templateId: string;
  currentVersion?: TemplateVersionInfo;
  onVersionChange?: (version: TemplateVersionInfo) => void;
  onClose?: () => void;
}

interface VersionManagerState {
  versions: TemplateVersionInfo[];
  selectedVersion: TemplateVersionInfo | null;
  compareVersion: TemplateVersionInfo | null;
  compatibilityResult: CompatibilityCheckResult | null;
  loading: boolean;
  error: string | null;
  showCreateDialog: boolean;
  showCompareDialog: boolean;
  showRollbackDialog: boolean;
  showMigrationDialog: boolean;
  createVersionForm: CreateVersionForm;
  rollbackForm: RollbackForm;
  migrationProgress: MigrationProgress | null;
}

interface CreateVersionForm {
  version: string;
  description: string;
  changelog: string;
  rollbackPoint: boolean;
  stable: boolean;
  author: string;
  authorEmail: string;
}

interface RollbackForm {
  targetVersion: string;
  preserveData: boolean;
  backupCurrent: boolean;
  reason: string;
}

interface MigrationProgress {
  id: string;
  status: 'preparing' | 'running' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  totalSteps: number;
  completedSteps: number;
  error?: string;
}

export function VersionManager({ templateId, currentVersion, onVersionChange, onClose }: VersionManagerProps) {
  const [state, setState] = useState<VersionManagerState>({
    versions: [],
    selectedVersion: null,
    compareVersion: null,
    compatibilityResult: null,
    loading: false,
    error: null,
    showCreateDialog: false,
    showCompareDialog: false,
    showRollbackDialog: false,
    showMigrationDialog: false,
    createVersionForm: {
      version: '',
      description: '',
      changelog: '',
      rollbackPoint: false,
      stable: false,
      author: 'Admin User',
      authorEmail: 'admin@example.com'
    },
    rollbackForm: {
      targetVersion: '',
      preserveData: true,
      backupCurrent: true,
      reason: ''
    },
    migrationProgress: null
  });

  const versioningSystem = getTemplateVersioningSystem();
  const compatibilityChecker = getTemplateCompatibilityChecker();

  // Load versions
  const loadVersions = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const versions = await versioningSystem.getVersionHistory(templateId);
      setState(prev => ({
        ...prev,
        versions,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load versions',
        loading: false
      }));
    }
  }, [templateId, versioningSystem]);

  // Load versions on mount
  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  // Handle create version
  const handleCreateVersion = useCallback(async () => {
    if (!state.createVersionForm.version || !state.createVersionForm.description) {
      setState(prev => ({ ...prev, error: 'Version and description are required' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const options: VersionCreateOptions = {
        version: state.createVersionForm.version,
        changelog: [{
          type: 'added',
          category: 'feature',
          description: state.createVersionForm.description,
          impact: 'minor',
          breakingChange: false,
          migrationRequired: false,
          affectedFiles: [],
          author: state.createVersionForm.author,
          timestamp: new Date()
        }],
        rollbackPoint: state.createVersionForm.rollbackPoint,
        stable: state.createVersionForm.stable,
        author: state.createVersionForm.author,
        authorEmail: state.createVersionForm.authorEmail,
        notes: state.createVersionForm.changelog
      };

      const newVersion = await versioningSystem.createVersion(templateId, options);
      
      await loadVersions();
      
      setState(prev => ({
        ...prev,
        showCreateDialog: false,
        createVersionForm: {
          version: '',
          description: '',
          changelog: '',
          rollbackPoint: false,
          stable: false,
          author: 'Admin User',
          authorEmail: 'admin@example.com'
        },
        loading: false
      }));

      if (onVersionChange) {
        onVersionChange(newVersion);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create version',
        loading: false
      }));
    }
  }, [state.createVersionForm, templateId, versioningSystem, loadVersions, onVersionChange]);

  // Handle rollback
  const handleRollback = useCallback(async () => {
    if (!state.rollbackForm.targetVersion || !state.rollbackForm.reason) {
      setState(prev => ({ ...prev, error: 'Target version and reason are required' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const options: VersionRollbackOptions = {
        targetVersion: state.rollbackForm.targetVersion,
        preserveData: state.rollbackForm.preserveData,
        backupCurrent: state.rollbackForm.backupCurrent,
        force: false,
        reason: state.rollbackForm.reason,
        author: 'Admin User'
      };

      const rolledBackVersion = await versioningSystem.rollbackVersion(templateId, options);
      
      await loadVersions();
      
      setState(prev => ({
        ...prev,
        showRollbackDialog: false,
        rollbackForm: {
          targetVersion: '',
          preserveData: true,
          backupCurrent: true,
          reason: ''
        },
        loading: false
      }));

      if (onVersionChange) {
        onVersionChange(rolledBackVersion);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to rollback version',
        loading: false
      }));
    }
  }, [state.rollbackForm, templateId, versioningSystem, loadVersions, onVersionChange]);

  // Handle version comparison
  const handleCompareVersions = useCallback(async (version1: TemplateVersionInfo, version2: TemplateVersionInfo) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await compatibilityChecker.checkCompatibility(version1, version2);
      setState(prev => ({
        ...prev,
        compatibilityResult: result,
        compareVersion: version2,
        showCompareDialog: true,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to compare versions',
        loading: false
      }));
    }
  }, [compatibilityChecker]);

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get version badge
  const getVersionBadge = (version: TemplateVersionInfo) => {
    if (version.deprecated) {
      return <Badge variant="destructive">Deprecated</Badge>;
    }
    if (version.stable) {
      return <Badge variant="default">Stable</Badge>;
    }
    return <Badge variant="secondary">Beta</Badge>;
  };

  // Get compatibility badge
  const getCompatibilityBadge = (compatible: boolean, score: number) => {
    if (compatible && score >= 90) {
      return <Badge variant="default" className="text-green-700 bg-green-100">Excellent</Badge>;
    }
    if (compatible && score >= 80) {
      return <Badge variant="default" className="text-blue-700 bg-blue-100">Good</Badge>;
    }
    if (score >= 60) {
      return <Badge variant="secondary" className="text-yellow-700 bg-yellow-100">Fair</Badge>;
    }
    return <Badge variant="destructive">Poor</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Version Manager</h2>
          <p className="text-muted-foreground">
            Manage versions for template: {templateId}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadVersions} disabled={state.loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${state.loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setState(prev => ({ ...prev, showCreateDialog: true }))}>
            <Upload className="h-4 w-4 mr-2" />
            Create Version
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {state.error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Migration Progress */}
      {state.migrationProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowRight className="h-5 w-5 mr-2" />
              Migration in Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{state.migrationProgress.currentStep}</span>
                <span className="text-sm text-muted-foreground">
                  {state.migrationProgress.completedSteps} / {state.migrationProgress.totalSteps}
                </span>
              </div>
              <Progress value={state.migrationProgress.progress} className="w-full" />
              <div className="flex items-center space-x-2">
                {state.migrationProgress.status === 'running' ? (
                  <Play className="h-4 w-4 text-blue-500" />
                ) : state.migrationProgress.status === 'completed' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : state.migrationProgress.status === 'failed' ? (
                  <XCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <Pause className="h-4 w-4 text-yellow-500" />
                )}
                <span className="text-sm capitalize">{state.migrationProgress.status}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Version List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="h-5 w-5 mr-2" />
            Version History ({state.versions.length})
          </CardTitle>
          <CardDescription>
            Manage and compare different versions of your template
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state.loading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : state.versions.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No versions found</h3>
              <p className="text-muted-foreground mb-4">Create your first version to get started</p>
              <Button onClick={() => setState(prev => ({ ...prev, showCreateDialog: true }))}>
                <Upload className="h-4 w-4 mr-2" />
                Create First Version
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {state.versions.map((version, index) => (
                <div key={version.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold">Version {version.version}</h3>
                          {getVersionBadge(version)}
                          {version.rollbackPoint && (
                            <Badge variant="outline">
                              <Rollback className="h-3 w-3 mr-1" />
                              Rollback Point
                            </Badge>
                          )}
                          {currentVersion?.id === version.id && (
                            <Badge variant="default">Current</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatDate(version.createdAt)}
                          </span>
                          <span>By {version.author}</span>
                          <span>{version.changelog.length} changes</span>
                          <span>{version.dependencies.length} dependencies</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setState(prev => ({ ...prev, selectedVersion: version }))}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                      {index > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCompareVersions(state.versions[index - 1], version)}
                        >
                          <GitCompare className="h-4 w-4 mr-2" />
                          Compare
                        </Button>
                      )}
                      {currentVersion?.id !== version.id && !version.deprecated && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setState(prev => ({ 
                            ...prev, 
                            rollbackForm: { ...prev.rollbackForm, targetVersion: version.version },
                            showRollbackDialog: true 
                          }))}
                        >
                          <Rollback className="h-4 w-4 mr-2" />
                          Rollback
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Version Summary */}
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Size:</span>
                      <span>{Math.round(version.metadata.size / 1024)} KB</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Security:</span>
                      <span>{version.metadata.securityScan.score}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Performance:</span>
                      <span>{version.metadata.performanceMetrics.score}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Quality:</span>
                      <span>{version.metadata.qualityScore}%</span>
                    </div>
                  </div>

                  {/* Recent Changes Preview */}
                  {version.changelog.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <h4 className="font-medium text-sm mb-2">Recent Changes</h4>
                      <div className="space-y-1">
                        {version.changelog.slice(0, 2).map((change, changeIndex) => (
                          <div key={changeIndex} className="flex items-center space-x-2 text-sm">
                            <Badge 
                              variant={change.breakingChange ? "destructive" : "secondary"}
                              className="text-xs"
                            >
                              {change.type}
                            </Badge>
                            <span className="text-muted-foreground truncate">{change.description}</span>
                          </div>
                        ))}
                        {version.changelog.length > 2 && (
                          <p className="text-xs text-muted-foreground">
                            +{version.changelog.length - 2} more changes
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Version Dialog */}
      <Dialog open={state.showCreateDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showCreateDialog: open }))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Version</DialogTitle>
            <DialogDescription>
              Create a new version of the template with your changes
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="version">Version Number</Label>
              <Input
                id="version"
                placeholder="1.0.0"
                value={state.createVersionForm.version}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  createVersionForm: { ...prev.createVersionForm, version: e.target.value }
                }))}
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Brief description of changes"
                value={state.createVersionForm.description}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  createVersionForm: { ...prev.createVersionForm, description: e.target.value }
                }))}
              />
            </div>
            
            <div>
              <Label htmlFor="changelog">Detailed Changelog</Label>
              <Textarea
                id="changelog"
                placeholder="Detailed list of changes, improvements, and fixes"
                rows={3}
                value={state.createVersionForm.changelog}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  createVersionForm: { ...prev.createVersionForm, changelog: e.target.value }
                }))}
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={state.createVersionForm.rollbackPoint}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    createVersionForm: { ...prev.createVersionForm, rollbackPoint: e.target.checked }
                  }))}
                />
                <span className="text-sm">Mark as rollback point</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={state.createVersionForm.stable}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    createVersionForm: { ...prev.createVersionForm, stable: e.target.checked }
                  }))}
                />
                <span className="text-sm">Mark as stable</span>
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setState(prev => ({ ...prev, showCreateDialog: false }))}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateVersion} disabled={state.loading}>
              {state.loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Create Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rollback Dialog */}
      <Dialog open={state.showRollbackDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showRollbackDialog: open }))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rollback to Previous Version</DialogTitle>
            <DialogDescription>
              This will revert the template to a previous version. This action can be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="targetVersion">Target Version</Label>
              <Select 
                value={state.rollbackForm.targetVersion} 
                onValueChange={(value) => setState(prev => ({
                  ...prev,
                  rollbackForm: { ...prev.rollbackForm, targetVersion: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select version to rollback to" />
                </SelectTrigger>
                <SelectContent>
                  {state.versions
                    .filter(v => !v.deprecated && v.id !== currentVersion?.id)
                    .map((version) => (
                    <SelectItem key={version.id} value={version.version}>
                      Version {version.version} - {formatDate(version.createdAt)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="reason">Reason for Rollback</Label>
              <Textarea
                id="reason"
                placeholder="Explain why you're rolling back this version"
                rows={2}
                value={state.rollbackForm.reason}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  rollbackForm: { ...prev.rollbackForm, reason: e.target.value }
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={state.rollbackForm.preserveData}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    rollbackForm: { ...prev.rollbackForm, preserveData: e.target.checked }
                  }))}
                />
                <span className="text-sm">Preserve user data</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={state.rollbackForm.backupCurrent}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    rollbackForm: { ...prev.rollbackForm, backupCurrent: e.target.checked }
                  }))}
                />
                <span className="text-sm">Backup current version</span>
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setState(prev => ({ ...prev, showRollbackDialog: false }))}
            >
              Cancel
            </Button>
            <Button onClick={handleRollback} disabled={state.loading} variant="destructive">
              {state.loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Rollback className="h-4 w-4 mr-2" />
              )}
              Rollback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compatibility Comparison Dialog */}
      <Dialog open={state.showCompareDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showCompareDialog: open }))}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Version Compatibility Analysis</DialogTitle>
            <DialogDescription>
              Compatibility analysis between selected versions
            </DialogDescription>
          </DialogHeader>
          
          {state.compatibilityResult && (
            <div className="space-y-6">
              {/* Overall Compatibility */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {state.compatibilityResult.compatible ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-500" />
                  )}
                  <div>
                    <h3 className="font-semibold">
                      {state.compatibilityResult.compatible ? 'Compatible' : 'Incompatible'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Compatibility Score: {state.compatibilityResult.compatibilityScore}%
                    </p>
                  </div>
                </div>
                {getCompatibilityBadge(state.compatibilityResult.compatible, state.compatibilityResult.compatibilityScore)}
              </div>

              {/* Issues */}
              {state.compatibilityResult.issues.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Issues ({state.compatibilityResult.issues.length})</h4>
                  <div className="space-y-2">
                    {state.compatibilityResult.issues.map((issue) => (
                      <div key={issue.id} className="border rounded p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant={
                            issue.severity === 'critical' ? "destructive" : 
                            issue.severity === 'high' ? "destructive" : 
                            "secondary"
                          }>
                            {issue.severity}
                          </Badge>
                          <span className="font-medium">{issue.component}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                        {issue.resolution && (
                          <div className="text-sm">
                            <span className="font-medium text-blue-600">Resolution: </span>
                            <span>{issue.resolution}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <span>Impact: {issue.impact}</span>
                          <span>Fix time: ~{issue.estimatedFixTime} min</span>
                          {issue.automaticFix && <span className="text-green-600">Auto-fixable</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {state.compatibilityResult.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Recommendations</h4>
                  <div className="space-y-2">
                    {state.compatibilityResult.recommendations.map((rec) => (
                      <div key={rec.id} className="border rounded p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant={rec.priority === 'high' ? "destructive" : "default"}>
                            {rec.priority}
                          </Badge>
                          <span className="font-medium">{rec.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Effort: {rec.effort}</span>
                          <span>Timeline: {rec.timeline}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Migration Path */}
              {state.compatibilityResult.migrationPath && (
                <div>
                  <h4 className="font-medium mb-3">Migration Path</h4>
                  <div className="border rounded p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">
                        {state.compatibilityResult.migrationPath.fromVersion} → {state.compatibilityResult.migrationPath.toVersion}
                      </span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{state.compatibilityResult.migrationPath.complexity}</Badge>
                        <span className="text-sm text-muted-foreground">
                          ~{state.compatibilityResult.migrationPath.estimatedTime}h
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {state.compatibilityResult.migrationPath.steps.slice(0, 3).map((step) => (
                        <div key={step.id} className="flex items-center space-x-2 text-sm">
                          <Badge variant="outline" className="text-xs">{step.type}</Badge>
                          <span>{step.title}</span>
                        </div>
                      ))}
                      {state.compatibilityResult.migrationPath.steps.length > 3 && (
                        <p className="text-sm text-muted-foreground">
                          +{state.compatibilityResult.migrationPath.steps.length - 3} more steps
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default VersionManager;
