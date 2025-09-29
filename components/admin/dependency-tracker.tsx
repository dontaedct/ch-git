/**
 * @fileoverview Dependency Tracker Component - HT-032.3.2
 * @module components/admin/dependency-tracker
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Dependency tracking and management interface with conflict resolution,
 * update notifications, and dependency graph visualization.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
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
  GitBranch,
  Network,
  TrendingUp,
  TrendingDown,
  Clock,
  ExternalLink,
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { 
  getTemplateDependencyManager,
  DependencyGraph,
  DependencyNode,
  DependencyConflict,
  DependencyUpdate,
  DependencyAnalysisResult,
  DependencyTreeNode,
  TemplateDependency
} from '@/lib/templates/dependency-manager';

interface DependencyTrackerProps {
  templateId: string;
  onDependencyChange?: (dependencies: TemplateDependency[]) => void;
  onClose?: () => void;
}

interface DependencyTrackerState {
  dependencyGraph: DependencyGraph;
  dependencyTree: DependencyTreeNode;
  analysisResult: DependencyAnalysisResult | null;
  availableUpdates: DependencyUpdate[];
  conflicts: DependencyConflict[];
  selectedDependency: DependencyNode | null;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  filterType: string;
  filterStatus: string;
  showAddDialog: boolean;
  showUpdateDialog: boolean;
  showConflictDialog: boolean;
  addDependencyForm: AddDependencyForm;
  selectedUpdate: DependencyUpdate | null;
  selectedConflict: DependencyConflict | null;
}

interface AddDependencyForm {
  name: string;
  version: string;
  type: 'required' | 'optional' | 'development' | 'peer';
  source: 'registry' | 'local' | 'git' | 'npm';
}

export function DependencyTracker({ templateId, onDependencyChange, onClose }: DependencyTrackerProps) {
  const [state, setState] = useState<DependencyTrackerState>({
    dependencyGraph: { nodes: [], edges: [], cycles: [], conflicts: [] },
    dependencyTree: { id: templateId, name: templateId, version: '1.0.0', type: 'template', children: [] },
    analysisResult: null,
    availableUpdates: [],
    conflicts: [],
    selectedDependency: null,
    loading: false,
    error: null,
    searchTerm: '',
    filterType: 'all',
    filterStatus: 'all',
    showAddDialog: false,
    showUpdateDialog: false,
    showConflictDialog: false,
    addDependencyForm: {
      name: '',
      version: '',
      type: 'required',
      source: 'npm'
    },
    selectedUpdate: null,
    selectedConflict: null
  });

  const dependencyManager = getTemplateDependencyManager();

  // Load dependency data
  const loadDependencyData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const [graph, tree, analysis, updates] = await Promise.all([
        dependencyManager.getDependencyGraph(templateId),
        dependencyManager.getDependencyTree(templateId),
        dependencyManager.analyzeDependencies(templateId),
        dependencyManager.getAvailableUpdates(templateId)
      ]);

      setState(prev => ({
        ...prev,
        dependencyGraph: graph,
        dependencyTree: tree,
        analysisResult: analysis,
        availableUpdates: updates,
        conflicts: graph.conflicts,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load dependency data',
        loading: false
      }));
    }
  }, [templateId, dependencyManager]);

  // Load data on mount
  useEffect(() => {
    loadDependencyData();
  }, [loadDependencyData]);

  // Handle add dependency
  const handleAddDependency = useCallback(async () => {
    if (!state.addDependencyForm.name || !state.addDependencyForm.version) {
      setState(prev => ({ ...prev, error: 'Name and version are required' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const dependency: TemplateDependency = {
        id: `${state.addDependencyForm.name}-${Date.now()}`,
        name: state.addDependencyForm.name,
        version: state.addDependencyForm.version,
        versionRange: `^${state.addDependencyForm.version}`,
        type: state.addDependencyForm.type,
        source: state.addDependencyForm.source
      };

      await dependencyManager.installDependency(templateId, dependency);
      await loadDependencyData();
      
      setState(prev => ({
        ...prev,
        showAddDialog: false,
        addDependencyForm: {
          name: '',
          version: '',
          type: 'required',
          source: 'npm'
        },
        loading: false
      }));

      if (onDependencyChange) {
        // Would get updated dependencies here
        onDependencyChange([]);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to add dependency',
        loading: false
      }));
    }
  }, [state.addDependencyForm, templateId, dependencyManager, loadDependencyData, onDependencyChange]);

  // Handle update dependency
  const handleUpdateDependency = useCallback(async (update: DependencyUpdate) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await dependencyManager.updateDependencies(templateId, {
        targetVersion: update.latestVersion,
        dryRun: false
      });
      
      await loadDependencyData();
      setState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update dependency',
        loading: false
      }));
    }
  }, [templateId, dependencyManager, loadDependencyData]);

  // Handle resolve conflict
  const handleResolveConflict = useCallback(async (conflict: DependencyConflict) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await dependencyManager.resolveConflicts(templateId, true);
      await loadDependencyData();
      setState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to resolve conflict',
        loading: false
      }));
    }
  }, [templateId, dependencyManager, loadDependencyData]);

  // Filter dependencies
  const filteredNodes = state.dependencyGraph.nodes.filter(node => {
    const matchesSearch = !state.searchTerm || 
      node.name.toLowerCase().includes(state.searchTerm.toLowerCase());
    
    const matchesType = state.filterType === 'all' || node.type === state.filterType;
    
    const matchesStatus = state.filterStatus === 'all' || node.status === state.filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'installed':
        return <Badge variant="default">Installed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'missing':
        return <Badge variant="destructive">Missing</Badge>;
      case 'outdated':
        return <Badge variant="secondary">Outdated</Badge>;
      case 'conflicted':
        return <Badge variant="destructive">Conflicted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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

  // Format file size
  const formatSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  // Render dependency tree
  const renderDependencyTree = (node: DependencyTreeNode, level: number = 0) => {
    return (
      <div key={node.id} className={`ml-${level * 4}`}>
        <div className="flex items-center space-x-2 py-1">
          <div className="flex items-center space-x-2">
            {level > 0 && <div className="w-4 h-px bg-gray-300" />}
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{node.name}</span>
            <Badge variant="outline">{node.version}</Badge>
            <Badge variant="secondary">{node.type}</Badge>
          </div>
        </div>
        {node.children.map(child => renderDependencyTree(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dependency Tracker</h2>
          <p className="text-muted-foreground">
            Manage dependencies for template: {templateId}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadDependencyData} disabled={state.loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${state.loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setState(prev => ({ ...prev, showAddDialog: true }))}>
            <Plus className="h-4 w-4 mr-2" />
            Add Dependency
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

      {/* Analysis Summary */}
      {state.analysisResult && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Total Dependencies</p>
                  <p className="text-2xl font-bold">{state.analysisResult.totalDependencies}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">Outdated</p>
                  <p className="text-2xl font-bold">{state.analysisResult.outdatedDependencies}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium">Vulnerable</p>
                  <p className="text-2xl font-bold">{state.analysisResult.vulnerableDependencies}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Conflicts</p>
                  <p className="text-2xl font-bold">{state.analysisResult.conflicts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="dependencies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
          <TabsTrigger value="updates">Available Updates</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
          <TabsTrigger value="tree">Dependency Tree</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="dependencies" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search dependencies..."
                  value={state.searchTerm}
                  onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={state.filterType} onValueChange={(value) => setState(prev => ({ ...prev, filterType: value }))}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="package">Packages</SelectItem>
                <SelectItem value="component">Components</SelectItem>
                <SelectItem value="asset">Assets</SelectItem>
              </SelectContent>
            </Select>
            <Select value={state.filterStatus} onValueChange={(value) => setState(prev => ({ ...prev, filterStatus: value }))}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="installed">Installed</SelectItem>
                <SelectItem value="outdated">Outdated</SelectItem>
                <SelectItem value="conflicted">Conflicted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dependencies List */}
          {state.loading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNodes.map((node) => (
                <Card key={node.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Package className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold">{node.name}</h3>
                            <Badge variant="outline">{node.version}</Badge>
                            {getStatusBadge(node.status)}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>Type: {node.type}</span>
                            <span>Size: {formatSize(node.metadata.size)}</span>
                            <span>Security: {node.metadata.securityScore}%</span>
                            <span>Quality: {node.metadata.qualityScore}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setState(prev => ({ ...prev, selectedDependency: node }))}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Dependency Info */}
                    <div className="mt-3 pt-3 border-t">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Dependencies:</span>
                          <span className="ml-2">{node.children.length}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Depth:</span>
                          <span className="ml-2">{node.depth}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Last Updated:</span>
                          <span className="ml-2">{new Date(node.metadata.lastUpdated).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredNodes.length === 0 && (
                <Card>
                  <CardContent className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No dependencies found</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="updates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="h-5 w-5 mr-2" />
                Available Updates ({state.availableUpdates.length})
              </CardTitle>
              <CardDescription>
                Updates available for your dependencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {state.availableUpdates.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">All dependencies are up to date</h3>
                  <p className="text-muted-foreground">No updates available at this time</p>
                </div>
              ) : (
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
                          <Badge variant="outline">{update.updateType}</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => setState(prev => ({ 
                              ...prev, 
                              selectedUpdate: update,
                              showUpdateDialog: true 
                            }))}
                          >
                            Update to {update.latestVersion}
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        <p>Current: {update.currentVersion} → Latest: {update.latestVersion}</p>
                      </div>
                      {update.changelog.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium mb-1">Recent changes:</h5>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {update.changelog.slice(0, 3).map((change, index) => (
                              <li key={index} className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                  {change.type}
                                </Badge>
                                <span>{change.description}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Dependency Conflicts ({state.conflicts.length})
              </CardTitle>
              <CardDescription>
                Resolve conflicts between dependencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {state.conflicts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No conflicts detected</h3>
                  <p className="text-muted-foreground">All dependencies are compatible</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.conflicts.map((conflict) => (
                    <div key={conflict.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            conflict.severity === 'critical' ? "destructive" : 
                            conflict.severity === 'high' ? "destructive" : 
                            "secondary"
                          }>
                            {conflict.severity}
                          </Badge>
                          <span className="font-medium">{conflict.type.replace('_', ' ')}</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setState(prev => ({ 
                            ...prev, 
                            selectedConflict: conflict,
                            showConflictDialog: true 
                          }))}
                        >
                          Resolve
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{conflict.description}</p>
                      <div className="space-y-1">
                        {conflict.dependencies.map((dep, index) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium">{dep.name}</span>
                            <span className="text-muted-foreground ml-2">
                              {dep.requestedVersion} (required by {dep.requiredBy.join(', ')})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tree" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Network className="h-5 w-5 mr-2" />
                Dependency Tree
              </CardTitle>
              <CardDescription>
                Hierarchical view of all dependencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto">
                {renderDependencyTree(state.dependencyTree)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {state.analysisResult && (
            <>
              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {state.analysisResult.recommendations.map((rec) => (
                      <div key={rec.id} className="border rounded p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant={rec.priority === 'high' ? "destructive" : "default"}>
                            {rec.priority}
                          </Badge>
                          <span className="font-medium">{rec.dependency}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{rec.description}</p>
                        <p className="text-sm text-blue-600">{rec.action}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Duplicates */}
              {state.analysisResult.duplicates.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Duplicate Dependencies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {state.analysisResult.duplicates.map((duplicate) => (
                        <div key={duplicate.name} className="border rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{duplicate.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {formatSize(duplicate.totalSize)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mb-2">
                            {duplicate.versions.map((version) => (
                              <Badge key={version} variant="outline">{version}</Badge>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground">{duplicate.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Dependency Dialog */}
      <Dialog open={state.showAddDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showAddDialog: open }))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Dependency</DialogTitle>
            <DialogDescription>
              Add a new dependency to your template
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Package Name</Label>
              <Input
                id="name"
                placeholder="package-name"
                value={state.addDependencyForm.name}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  addDependencyForm: { ...prev.addDependencyForm, name: e.target.value }
                }))}
              />
            </div>
            
            <div>
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                placeholder="1.0.0"
                value={state.addDependencyForm.version}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  addDependencyForm: { ...prev.addDependencyForm, version: e.target.value }
                }))}
              />
            </div>
            
            <div>
              <Label htmlFor="type">Dependency Type</Label>
              <Select 
                value={state.addDependencyForm.type} 
                onValueChange={(value: any) => setState(prev => ({
                  ...prev,
                  addDependencyForm: { ...prev.addDependencyForm, type: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="required">Required</SelectItem>
                  <SelectItem value="optional">Optional</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="peer">Peer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="source">Source</Label>
              <Select 
                value={state.addDependencyForm.source} 
                onValueChange={(value: any) => setState(prev => ({
                  ...prev,
                  addDependencyForm: { ...prev.addDependencyForm, source: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="npm">NPM Registry</SelectItem>
                  <SelectItem value="registry">Template Registry</SelectItem>
                  <SelectItem value="git">Git Repository</SelectItem>
                  <SelectItem value="local">Local Package</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setState(prev => ({ ...prev, showAddDialog: false }))}
            >
              Cancel
            </Button>
            <Button onClick={handleAddDependency} disabled={state.loading}>
              {state.loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Dependency
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Confirmation Dialog */}
      <Dialog 
        open={state.showUpdateDialog} 
        onOpenChange={(open) => setState(prev => ({ ...prev, showUpdateDialog: open }))}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Dependency</DialogTitle>
            <DialogDescription>
              {state.selectedUpdate && (
                <>Update {state.selectedUpdate.dependency.name} to version {state.selectedUpdate.latestVersion}</>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {state.selectedUpdate && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Current Version:</span>
                <Badge variant="outline">{state.selectedUpdate.currentVersion}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>New Version:</span>
                <Badge variant="default">{state.selectedUpdate.latestVersion}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Update Type:</span>
                <Badge variant={state.selectedUpdate.breaking ? "destructive" : "secondary"}>
                  {state.selectedUpdate.updateType}
                </Badge>
              </div>
              
              {state.selectedUpdate.breaking && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This is a breaking change. Please review the changelog before updating.
                  </AlertDescription>
                </Alert>
              )}
              
              {state.selectedUpdate.security && (
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    This update includes security fixes. Update recommended.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setState(prev => ({ ...prev, showUpdateDialog: false }))}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (state.selectedUpdate) {
                  handleUpdateDependency(state.selectedUpdate);
                  setState(prev => ({ ...prev, showUpdateDialog: false }));
                }
              }} 
              disabled={state.loading}
            >
              {state.loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DependencyTracker;
