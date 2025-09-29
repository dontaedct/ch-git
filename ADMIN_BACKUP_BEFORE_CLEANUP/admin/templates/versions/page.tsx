/**
 * @fileoverview Template Versioning Management Interface - HT-032.3.2
 * @module app/admin/templates/versions
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Template versioning management interface with version history,
 * comparison tools, and migration management.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  GitBranch, 
  History, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  Download,
  Upload,
  RefreshCw,
  Shield,
  Zap,
  Info,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  GitCompare,
  Undo2,
  Tag
} from 'lucide-react';
import { TemplateVersionInfo, getTemplateVersioningSystem } from '@/lib/templates/versioning-system';
import { getTemplateDependencyManager, DependencyUpdate } from '@/lib/templates/dependency-manager';
import { getTemplateUpdateNotificationManager } from '@/lib/templates/update-notifications';
import { getTemplateCompatibilityChecker, CompatibilityCheckResult } from '@/lib/templates/compatibility-checker';

interface TemplateVersionsPageState {
  templates: string[];
  selectedTemplate: string | null;
  versions: TemplateVersionInfo[];
  selectedVersion: TemplateVersionInfo | null;
  compareVersion: TemplateVersionInfo | null;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  filterStatus: string;
  filterType: string;
  showCreateDialog: boolean;
  showCompareDialog: boolean;
  showMigrationDialog: boolean;
  compatibilityResult: CompatibilityCheckResult | null;
  availableUpdates: DependencyUpdate[];
}

export default function TemplateVersionsPage() {
  const [state, setState] = useState<TemplateVersionsPageState>({
    templates: ['admin-dashboard', 'user-management', 'analytics', 'e-commerce'],
    selectedTemplate: null,
    versions: [],
    selectedVersion: null,
    compareVersion: null,
    loading: false,
    error: null,
    searchTerm: '',
    filterStatus: 'all',
    filterType: 'all',
    showCreateDialog: false,
    showCompareDialog: false,
    showMigrationDialog: false,
    compatibilityResult: null,
    availableUpdates: []
  });

  const versioningSystem = getTemplateVersioningSystem();
  const dependencyManager = getTemplateDependencyManager();
  const notificationManager = getTemplateUpdateNotificationManager();
  const compatibilityChecker = getTemplateCompatibilityChecker();

  // Load versions for selected template
  const loadVersions = useCallback(async (templateId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const versions = await versioningSystem.getVersionHistory(templateId);
      const updates = await dependencyManager.getAvailableUpdates(templateId);
      
      setState(prev => ({
        ...prev,
        versions,
        availableUpdates: updates,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load versions',
        loading: false
      }));
    }
  }, [versioningSystem, dependencyManager]);

  // Handle template selection
  const handleTemplateSelect = useCallback((templateId: string) => {
    setState(prev => ({ ...prev, selectedTemplate: templateId }));
    loadVersions(templateId);
  }, [loadVersions]);

  // Handle version comparison
  const handleCompareVersions = useCallback(async (version1: TemplateVersionInfo, version2: TemplateVersionInfo) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const result = await compatibilityChecker.checkCompatibility(version1, version2);
      setState(prev => ({
        ...prev,
        compatibilityResult: result,
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

  // Handle version rollback
  const handleUndo2 = useCallback(async (version: TemplateVersionInfo) => {
    if (!state.selectedTemplate || !confirm(`Are you sure you want to rollback to version ${version.version}?`)) {
      return;
    }

    setState(prev => ({ ...prev, loading: true }));
    
    try {
      await versioningSystem.rollbackVersion(state.selectedTemplate, {
        targetVersion: version.version,
        preserveData: true,
        backupCurrent: true,
        force: false,
        reason: 'User requested rollback',
        author: 'Admin User'
      });

      await loadVersions(state.selectedTemplate);
      
      setState(prev => ({
        ...prev,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to rollback version',
        loading: false
      }));
    }
  }, [state.selectedTemplate, versioningSystem, loadVersions]);

  // Filter versions based on search and filters
  const filteredVersions = state.versions.filter(version => {
    const matchesSearch = !state.searchTerm || 
      version.version.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      version.author.toLowerCase().includes(state.searchTerm.toLowerCase());
    
    const matchesStatus = state.filterStatus === 'all' || 
      (state.filterStatus === 'stable' && version.stable) ||
      (state.filterStatus === 'deprecated' && version.deprecated);
    
    return matchesSearch && matchesStatus;
  });

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get version status badge
  const getVersionBadge = (version: TemplateVersionInfo) => {
    if (version.deprecated) {
      return <Badge variant="destructive">Deprecated</Badge>;
    }
    if (version.stable) {
      return <Badge variant="default">Stable</Badge>;
    }
    return <Badge variant="secondary">Beta</Badge>;
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Template Versions</h1>
          <p className="text-muted-foreground">
            Manage template versions, dependencies, and compatibility
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => state.selectedTemplate && loadVersions(state.selectedTemplate)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setState(prev => ({ ...prev, showCreateDialog: true }))}>
            <Upload className="h-4 w-4 mr-2" />
            Create Version
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {state.error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Template Selection Sidebar */}
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Templates</CardTitle>
              <CardDescription>Select a template to manage versions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {state.templates.map((templateId) => (
                  <Button
                    key={templateId}
                    variant={state.selectedTemplate === templateId ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handleTemplateSelect(templateId)}
                  >
                    <GitBranch className="h-4 w-4 mr-2" />
                    {templateId}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Available Updates */}
          {state.availableUpdates.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Available Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {state.availableUpdates.map((update) => (
                    <div key={update.dependency.name} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        {update.security && <Shield className="h-4 w-4 text-red-500" />}
                        <span className="text-sm font-medium">{update.dependency.name}</span>
                      </div>
                      <Badge variant={update.breaking ? "destructive" : "default"}>
                        {update.currentVersion} → {update.latestVersion}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="col-span-9">
          {!state.selectedTemplate ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Select a Template</h3>
                  <p className="text-muted-foreground">Choose a template from the sidebar to view its version history</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="versions" className="space-y-4">
              <TabsList>
                <TabsTrigger value="versions">Version History</TabsTrigger>
                <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
                <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
                <TabsTrigger value="migrations">Migrations</TabsTrigger>
              </TabsList>

              <TabsContent value="versions" className="space-y-4">
                {/* Search and Filters */}
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search versions..."
                        value={state.searchTerm}
                        onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <Select value={state.filterStatus} onValueChange={(value) => setState(prev => ({ ...prev, filterStatus: value }))}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Versions</SelectItem>
                      <SelectItem value="stable">Stable Only</SelectItem>
                      <SelectItem value="deprecated">Deprecated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Version List */}
                {state.loading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredVersions.map((version) => (
                      <Card key={version.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div>
                                <div className="flex items-center space-x-2 mb-2">
                                  <h3 className="text-lg font-semibold">Version {version.version}</h3>
                                  {getVersionBadge(version)}
                                  {version.rollbackPoint && <Badge variant="outline">Undo2 Point</Badge>}
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <span className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {formatDate(version.createdAt)}
                                  </span>
                                  <span>By {version.author}</span>
                                  <span>{version.changelog.length} changes</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setState(prev => ({ ...prev, selectedVersion: version }))}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Details
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setState(prev => ({ ...prev, compareVersion: version, showCompareDialog: true }))}
                              >
                                <GitCompare className="h-4 w-4 mr-2" />
                                Compare
                              </Button>
                              {!version.deprecated && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUndo2(version)}
                                >
                                  <Undo2 className="h-4 w-4 mr-2" />
                                  Undo2
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Changelog Summary */}
                          {version.changelog.length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                              <h4 className="font-medium mb-2">Recent Changes</h4>
                              <div className="space-y-1">
                                {version.changelog.slice(0, 3).map((change, index) => (
                                  <div key={index} className="flex items-center space-x-2 text-sm">
                                    <Badge 
                                      variant={change.breakingChange ? "destructive" : "secondary"}
                                      className="text-xs"
                                    >
                                      {change.type}
                                    </Badge>
                                    <span className="text-muted-foreground">{change.description}</span>
                                  </div>
                                ))}
                                {version.changelog.length > 3 && (
                                  <p className="text-xs text-muted-foreground">
                                    +{version.changelog.length - 3} more changes
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}

                    {filteredVersions.length === 0 && (
                      <Card>
                        <CardContent className="flex items-center justify-center h-32">
                          <div className="text-center">
                            <History className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">No versions found</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="dependencies" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Dependency Analysis</CardTitle>
                    <CardDescription>
                      Current dependencies and available updates for {state.selectedTemplate}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {state.availableUpdates.length > 0 ? (
                      <div className="space-y-4">
                        {state.availableUpdates.map((update) => (
                          <div key={update.dependency.name} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium">{update.dependency.name}</h4>
                                {update.security && (
                                  <Badge variant="destructive">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Security
                                  </Badge>
                                )}
                                {update.breaking && (
                                  <Badge variant="destructive">Breaking</Badge>
                                )}
                              </div>
                              <Button size="sm">
                                Update to {update.latestVersion}
                              </Button>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <p>Current: {update.currentVersion} → Latest: {update.latestVersion}</p>
                              <p>Update type: {update.updateType}</p>
                            </div>
                            {update.changelog.length > 0 && (
                              <div className="mt-2">
                                <h5 className="text-sm font-medium mb-1">Recent changes:</h5>
                                <ul className="text-xs text-muted-foreground space-y-1">
                                  {update.changelog.slice(0, 3).map((change, index) => (
                                    <li key={index}>• {change.description}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">All dependencies are up to date</h3>
                        <p className="text-muted-foreground">No updates available at this time</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="compatibility" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Compatibility Analysis</CardTitle>
                    <CardDescription>
                      Check compatibility between different versions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {state.compatibilityResult ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {state.compatibilityResult.compatible ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <span className="font-medium">
                              {state.compatibilityResult.compatible ? 'Compatible' : 'Incompatible'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">Compatibility Score:</span>
                            <Badge variant={state.compatibilityResult.compatibilityScore >= 80 ? "default" : "destructive"}>
                              {state.compatibilityResult.compatibilityScore}%
                            </Badge>
                          </div>
                        </div>

                        {state.compatibilityResult.issues.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Issues ({state.compatibilityResult.issues.length})</h4>
                            <div className="space-y-2">
                              {state.compatibilityResult.issues.map((issue) => (
                                <div key={issue.id} className="border rounded p-3">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <Badge variant={issue.severity === 'critical' ? "destructive" : "secondary"}>
                                      {issue.severity}
                                    </Badge>
                                    <span className="font-medium">{issue.component}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{issue.description}</p>
                                  {issue.resolution && (
                                    <p className="text-sm text-blue-600 mt-1">Resolution: {issue.resolution}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {state.compatibilityResult.recommendations.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Recommendations</h4>
                            <div className="space-y-2">
                              {state.compatibilityResult.recommendations.map((rec) => (
                                <div key={rec.id} className="border rounded p-3">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <Badge variant={rec.priority === 'high' ? "destructive" : "default"}>
                                      {rec.priority}
                                    </Badge>
                                    <span className="font-medium">{rec.title}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <GitCompare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No compatibility analysis available</h3>
                        <p className="text-muted-foreground">Compare two versions to see compatibility analysis</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="migrations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Migration Management</CardTitle>
                    <CardDescription>
                      Manage version migrations and rollbacks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <ArrowRight className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Migration tools coming soon</h3>
                      <p className="text-muted-foreground">Advanced migration management will be available in the next update</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      {/* Version Details Dialog */}
      {state.selectedVersion && (
        <Dialog 
          open={!!state.selectedVersion} 
          onOpenChange={() => setState(prev => ({ ...prev, selectedVersion: null }))}
        >
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Version {state.selectedVersion.version} Details</DialogTitle>
              <DialogDescription>
                Detailed information about this template version
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Version Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version:</span>
                      <span>{state.selectedVersion.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Author:</span>
                      <span>{state.selectedVersion.author}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{formatDate(state.selectedVersion.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span>{getVersionBadge(state.selectedVersion)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Metadata</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size:</span>
                      <span>{Math.round(state.selectedVersion.metadata.size / 1024)} KB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quality Score:</span>
                      <span>{state.selectedVersion.metadata.qualityScore}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Security Score:</span>
                      <span>{state.selectedVersion.metadata.securityScan.score}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dependencies:</span>
                      <span>{state.selectedVersion.dependencies.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Changelog */}
              <div>
                <h4 className="font-medium mb-2">Changelog ({state.selectedVersion.changelog.length} changes)</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {state.selectedVersion.changelog.map((change, index) => (
                    <div key={index} className="border rounded p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge 
                          variant={change.breakingChange ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {change.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {change.category}
                        </Badge>
                        {change.breakingChange && (
                          <Badge variant="destructive" className="text-xs">
                            Breaking
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm">{change.description}</p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                        <span>By {change.author}</span>
                        <span>{formatDate(change.timestamp)}</span>
                        {change.component && <span>Component: {change.component}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dependencies */}
              {state.selectedVersion.dependencies.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Dependencies ({state.selectedVersion.dependencies.length})</h4>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {state.selectedVersion.dependencies.map((dep) => (
                      <div key={dep.id} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm font-medium">{dep.name}</span>
                        <Badge variant="outline">{dep.version}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
