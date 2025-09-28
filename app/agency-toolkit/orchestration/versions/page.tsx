/**
 * Workflow Version Management UI
 * 
 * Comprehensive interface for managing workflow versions, exports, imports,
 * and environment promotions per PRD Section 8 requirements.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Upload, 
  GitBranch, 
  GitCommit, 
  GitMerge, 
  History, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  User,
  Calendar,
  FileText,
  Package,
  Shield,
  Zap,
  ArrowUpDown,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Eye,
  Edit,
  Copy,
  ExternalLink
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface WorkflowVersion {
  id: string;
  workflowId: string;
  version: string;
  semanticVersion: {
    major: number;
    minor: number;
    patch: number;
  };
  status: 'draft' | 'published' | 'deployed' | 'archived' | 'deprecated';
  environment: 'dev' | 'staging' | 'prod';
  isActive: boolean;
  isLatest: boolean;
  createdAt: Date;
  createdBy: string;
  deployedAt?: Date;
  deployedBy?: string;
  changes: VersionChange[];
  metadata: {
    description?: string;
    releaseNotes?: string;
    tags: string[];
  };
  checksum: string;
  size: number;
}

interface VersionChange {
  id: string;
  type: string;
  path: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  breaking: boolean;
  timestamp: Date;
  author: string;
}

interface ExportRequest {
  workflowId: string;
  versionId?: string;
  format: 'json' | 'yaml' | 'zip' | 'tar' | 'n8n';
  options: {
    pretty?: boolean;
    includeSecrets?: boolean;
    includeCredentials?: boolean;
    includeArtifacts?: boolean;
    includeDependencies?: boolean;
    includeMetadata?: boolean;
  };
}

interface ImportRequest {
  data: string;
  format: 'json' | 'yaml' | 'zip' | 'tar' | 'n8n';
  options: {
    validateCompatibility?: boolean;
    autoMigrate?: boolean;
    createNewVersion?: boolean;
    overwriteExisting?: boolean;
  };
}

interface PromotionRequest {
  workflowId: string;
  versionId: string;
  fromEnvironment: 'dev' | 'staging' | 'prod';
  toEnvironment: 'dev' | 'staging' | 'prod';
  options: {
    validateCompatibility?: boolean;
    backupExisting?: boolean;
    dryRun?: boolean;
  };
}

// ============================================================================
// Main Component
// ============================================================================

export default function WorkflowVersionsPage() {
  const [workflowId, setWorkflowId] = useState<string>('');
  const [versions, setVersions] = useState<WorkflowVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<WorkflowVersion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load versions when workflow ID changes
  useEffect(() => {
    if (workflowId) {
      loadVersions(workflowId);
    }
  }, [workflowId]);

  const loadVersions = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock data for demonstration
      const mockVersions: WorkflowVersion[] = [
        {
          id: 'v1',
          workflowId: id,
          version: '1.2.3',
          semanticVersion: { major: 1, minor: 2, patch: 3 },
          status: 'deployed',
          environment: 'prod',
          isActive: true,
          isLatest: true,
          createdAt: new Date('2024-01-15'),
          createdBy: 'john.doe@company.com',
          deployedAt: new Date('2024-01-15'),
          deployedBy: 'john.doe@company.com',
          changes: [
            {
              id: 'c1',
              type: 'step_added',
              path: 'steps.new_step',
              description: 'Added new data processing step',
              impact: 'medium',
              breaking: false,
              timestamp: new Date('2024-01-15'),
              author: 'john.doe@company.com'
            }
          ],
          metadata: {
            description: 'Production-ready workflow with data processing',
            releaseNotes: 'Added new data processing step for improved performance',
            tags: ['production', 'data-processing', 'stable']
          },
          checksum: 'abc123def456',
          size: 1024
        },
        {
          id: 'v2',
          workflowId: id,
          version: '1.2.2',
          semanticVersion: { major: 1, minor: 2, patch: 2 },
          status: 'archived',
          environment: 'prod',
          isActive: false,
          isLatest: false,
          createdAt: new Date('2024-01-10'),
          createdBy: 'jane.smith@company.com',
          changes: [],
          metadata: {
            description: 'Previous stable version',
            releaseNotes: 'Bug fixes and performance improvements',
            tags: ['stable', 'bug-fixes']
          },
          checksum: 'def456ghi789',
          size: 896
        }
      ];
      
      setVersions(mockVersions);
    } catch (err) {
      setError('Failed to load workflow versions');
      console.error('Error loading versions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (request: ExportRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/orchestration/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const result = await response.json();
      
      if (result.success) {
        setSuccess('Workflow exported successfully');
        // Trigger download
        const downloadUrl = result.downloadUrl;
        if (downloadUrl) {
          window.open(downloadUrl, '_blank');
        }
      } else {
        setError(result.error || 'Export failed');
      }
    } catch (err) {
      setError('Failed to export workflow');
      console.error('Export error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (request: ImportRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/orchestration/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const result = await response.json();
      
      if (result.success) {
        setSuccess('Workflow imported successfully');
        // Reload versions
        if (result.data.workflowId) {
          loadVersions(result.data.workflowId);
        }
      } else {
        setError(result.error || 'Import failed');
      }
    } catch (err) {
      setError('Failed to import workflow');
      console.error('Import error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePromotion = async (request: PromotionRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/orchestration/promote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const result = await response.json();
      
      if (result.success) {
        setSuccess('Workflow promoted successfully');
        // Reload versions
        loadVersions(request.workflowId);
      } else {
        setError(result.error || 'Promotion failed');
      }
    } catch (err) {
      setError('Failed to promote workflow');
      console.error('Promotion error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflow Versions</h1>
          <p className="text-muted-foreground">
            Manage workflow versions, exports, imports, and environment promotions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Enter workflow ID"
            value={workflowId}
            onChange={(e) => setWorkflowId(e.target.value)}
            className="w-64"
          />
          <Button onClick={() => workflowId && loadVersions(workflowId)}>
            Load Versions
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      {workflowId && (
        <Tabs defaultValue="versions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="versions">Versions</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="promotion">Promotion</TabsTrigger>
          </TabsList>

          {/* Versions Tab */}
          <TabsContent value="versions" className="space-y-4">
            <VersionsTab 
              versions={versions}
              selectedVersion={selectedVersion}
              onSelectVersion={setSelectedVersion}
              onExport={handleExport}
              onPromotion={handlePromotion}
              loading={loading}
            />
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-4">
            <ExportTab 
              workflowId={workflowId}
              versions={versions}
              onExport={handleExport}
              loading={loading}
            />
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-4">
            <ImportTab 
              onImport={handleImport}
              loading={loading}
            />
          </TabsContent>

          {/* Promotion Tab */}
          <TabsContent value="promotion" className="space-y-4">
            <PromotionTab 
              workflowId={workflowId}
              versions={versions}
              onPromotion={handlePromotion}
              loading={loading}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Empty State */}
      {!workflowId && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GitBranch className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Workflow Selected</h3>
            <p className="text-muted-foreground text-center mb-4">
              Enter a workflow ID to view and manage its versions
            </p>
            <Input
              placeholder="Enter workflow ID"
              value={workflowId}
              onChange={(e) => setWorkflowId(e.target.value)}
              className="w-64"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// Versions Tab Component
// ============================================================================

function VersionsTab({ 
  versions, 
  selectedVersion, 
  onSelectVersion, 
  onExport, 
  onPromotion, 
  loading 
}: {
  versions: WorkflowVersion[];
  selectedVersion: WorkflowVersion | null;
  onSelectVersion: (version: WorkflowVersion) => void;
  onExport: (request: ExportRequest) => void;
  onPromotion: (request: PromotionRequest) => void;
  loading: boolean;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'bg-green-100 text-green-800';
      case 'published': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      case 'deprecated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEnvironmentColor = (environment: string) => {
    switch (environment) {
      case 'prod': return 'bg-red-100 text-red-800';
      case 'staging': return 'bg-yellow-100 text-yellow-800';
      case 'dev': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Versions List */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Versions</h2>
          <Badge variant="outline">{versions.length} versions</Badge>
        </div>
        
        <div className="space-y-3">
          {versions.map((version) => (
            <Card 
              key={version.id} 
              className={`cursor-pointer transition-colors ${
                selectedVersion?.id === version.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onSelectVersion(version)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(version.status)}>
                      {version.status}
                    </Badge>
                    <Badge className={getEnvironmentColor(version.environment)}>
                      {version.environment}
                    </Badge>
                    {version.isActive && (
                      <Badge variant="outline" className="text-green-600">
                        Active
                      </Badge>
                    )}
                    {version.isLatest && (
                      <Badge variant="outline" className="text-blue-600">
                        Latest
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    v{version.version}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="h-4 w-4" />
                    <span>{version.createdBy}</span>
                    <Calendar className="h-4 w-4 ml-2" />
                    <span>{version.createdAt.toLocaleDateString()}</span>
                  </div>
                  
                  {version.metadata.description && (
                    <p className="text-sm text-muted-foreground">
                      {version.metadata.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>{version.changes.length} changes</span>
                    <span>{version.size} bytes</span>
                    <span>Checksum: {version.checksum.substring(0, 8)}...</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Version Details */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Version Details</h2>
        
        {selectedVersion ? (
          <VersionDetails 
            version={selectedVersion}
            onExport={onExport}
            onPromotion={onPromotion}
            loading={loading}
          />
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Select a version to view details
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Version Details Component
// ============================================================================

function VersionDetails({ 
  version, 
  onExport, 
  onPromotion, 
  loading 
}: {
  version: WorkflowVersion;
  onExport: (request: ExportRequest) => void;
  onPromotion: (request: PromotionRequest) => void;
  loading: boolean;
}) {
  const [exportFormat, setExportFormat] = useState<'json' | 'yaml' | 'zip' | 'tar' | 'n8n'>('json');
  const [exportOptions, setExportOptions] = useState({
    pretty: true,
    includeSecrets: false,
    includeCredentials: false,
    includeArtifacts: true,
    includeDependencies: true,
    includeMetadata: true
  });

  const handleExport = () => {
    onExport({
      workflowId: version.workflowId,
      versionId: version.id,
      format: exportFormat,
      options: exportOptions
    });
  };

  const handlePromotion = (toEnvironment: 'dev' | 'staging' | 'prod') => {
    onPromotion({
      workflowId: version.workflowId,
      versionId: version.id,
      fromEnvironment: version.environment,
      toEnvironment,
      options: {
        validateCompatibility: true,
        backupExisting: true,
        dryRun: false
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Version Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GitCommit className="h-5 w-5" />
            <span>Version {version.version}</span>
          </CardTitle>
          <CardDescription>
            {version.metadata.description || 'No description available'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <div className="font-medium">{version.status}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Environment</Label>
              <div className="font-medium">{version.environment}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Created By</Label>
              <div className="font-medium">{version.createdBy}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Created At</Label>
              <div className="font-medium">{version.createdAt.toLocaleString()}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Size</Label>
              <div className="font-medium">{version.size} bytes</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Checksum</Label>
              <div className="font-mono text-xs">{version.checksum}</div>
            </div>
          </div>

          {version.metadata.tags.length > 0 && (
            <div>
              <Label className="text-muted-foreground">Tags</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {version.metadata.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Changes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Changes ({version.changes.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {version.changes.length > 0 ? (
            <div className="space-y-2">
              {version.changes.map((change) => (
                <div key={change.id} className="flex items-start space-x-2 p-2 rounded border">
                  <div className="flex-shrink-0">
                    {change.breaking ? (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{change.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {change.type} • {change.impact} impact • {change.author}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No changes recorded</p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Export */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="yaml">YAML</SelectItem>
                <SelectItem value="zip">ZIP Archive</SelectItem>
                <SelectItem value="tar">TAR Archive</SelectItem>
                <SelectItem value="n8n">n8n Format</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="space-y-2">
              <Label className="text-sm">Export Options</Label>
              <div className="space-y-1">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.pretty}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, pretty: e.target.checked }))}
                  />
                  <span className="text-sm">Pretty format</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeArtifacts}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeArtifacts: e.target.checked }))}
                  />
                  <span className="text-sm">Include artifacts</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeDependencies}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeDependencies: e.target.checked }))}
                  />
                  <span className="text-sm">Include dependencies</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeMetadata}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                  />
                  <span className="text-sm">Include metadata</span>
                </label>
              </div>
            </div>
            
            <Button onClick={handleExport} disabled={loading} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export Version
            </Button>
          </div>

          <Separator />

          {/* Promotion */}
          <div className="space-y-2">
            <Label>Promote to Environment</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['dev', 'staging', 'prod'] as const).map((env) => (
                <Button
                  key={env}
                  variant={env === version.environment ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => handlePromotion(env)}
                  disabled={loading || env === version.environment}
                >
                  <ArrowUpDown className="h-3 w-3 mr-1" />
                  {env}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Export Tab Component
// ============================================================================

function ExportTab({ 
  workflowId, 
  versions, 
  onExport, 
  loading 
}: {
  workflowId: string;
  versions: WorkflowVersion[];
  onExport: (request: ExportRequest) => void;
  loading: boolean;
}) {
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [format, setFormat] = useState<'json' | 'yaml' | 'zip' | 'tar' | 'n8n'>('json');
  const [options, setOptions] = useState({
    pretty: true,
    includeSecrets: false,
    includeCredentials: false,
    includeArtifacts: true,
    includeDependencies: true,
    includeMetadata: true
  });

  const handleExport = () => {
    onExport({
      workflowId,
      versionId: selectedVersion || undefined,
      format,
      options
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Download className="h-5 w-5" />
          <span>Export Workflow</span>
        </CardTitle>
        <CardDescription>
          Export workflow version in various formats with customizable options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Version Selection */}
        <div className="space-y-2">
          <Label>Version</Label>
          <Select value={selectedVersion} onValueChange={setSelectedVersion}>
            <SelectTrigger>
              <SelectValue placeholder="Select version (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Latest Version</SelectItem>
              {versions.map((version) => (
                <SelectItem key={version.id} value={version.id}>
                  v{version.version} - {version.status} ({version.environment})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <Label>Export Format</Label>
          <Select value={format} onValueChange={(value: any) => setFormat(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="yaml">YAML</SelectItem>
              <SelectItem value="zip">ZIP Archive</SelectItem>
              <SelectItem value="tar">TAR Archive</SelectItem>
              <SelectItem value="n8n">n8n Format</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <Label>Export Options</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.pretty}
                  onChange={(e) => setOptions(prev => ({ ...prev, pretty: e.target.checked }))}
                />
                <span className="text-sm">Pretty format</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeArtifacts}
                  onChange={(e) => setOptions(prev => ({ ...prev, includeArtifacts: e.target.checked }))}
                />
                <span className="text-sm">Include artifacts</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeDependencies}
                  onChange={(e) => setOptions(prev => ({ ...prev, includeDependencies: e.target.checked }))}
                />
                <span className="text-sm">Include dependencies</span>
              </label>
            </div>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeMetadata}
                  onChange={(e) => setOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                />
                <span className="text-sm">Include metadata</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeSecrets}
                  onChange={(e) => setOptions(prev => ({ ...prev, includeSecrets: e.target.checked }))}
                />
                <span className="text-sm">Include secrets</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeCredentials}
                  onChange={(e) => setOptions(prev => ({ ...prev, includeCredentials: e.target.checked }))}
                />
                <span className="text-sm">Include credentials</span>
              </label>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <Button onClick={handleExport} disabled={loading} className="w-full">
          <Download className="h-4 w-4 mr-2" />
          {loading ? 'Exporting...' : 'Export Workflow'}
        </Button>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Import Tab Component
// ============================================================================

function ImportTab({ 
  onImport, 
  loading 
}: {
  onImport: (request: ImportRequest) => void;
  loading: boolean;
}) {
  const [importData, setImportData] = useState<string>('');
  const [format, setFormat] = useState<'json' | 'yaml' | 'zip' | 'tar' | 'n8n'>('json');
  const [options, setOptions] = useState({
    validateCompatibility: true,
    autoMigrate: false,
    createNewVersion: true,
    overwriteExisting: false
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setImportData(content);
        
        // Auto-detect format based on file extension
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (extension === 'yaml' || extension === 'yml') {
          setFormat('yaml');
        } else if (extension === 'zip') {
          setFormat('zip');
        } else if (extension === 'tar' || extension === 'tar.gz') {
          setFormat('tar');
        } else {
          setFormat('json');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleImport = () => {
    if (!importData.trim()) {
      return;
    }

    onImport({
      data: importData,
      format,
      options
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Import Workflow</span>
        </CardTitle>
        <CardDescription>
          Import workflow from file or paste data directly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="space-y-2">
          <Label>Upload File</Label>
          <Input
            type="file"
            accept=".json,.yaml,.yml,.zip,.tar,.tar.gz"
            onChange={handleFileUpload}
          />
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <Label>Import Format</Label>
          <Select value={format} onValueChange={(value: any) => setFormat(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="yaml">YAML</SelectItem>
              <SelectItem value="zip">ZIP Archive</SelectItem>
              <SelectItem value="tar">TAR Archive</SelectItem>
              <SelectItem value="n8n">n8n Format</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Import Data */}
        <div className="space-y-2">
          <Label>Import Data</Label>
          <textarea
            className="w-full h-32 p-3 border rounded-md font-mono text-sm"
            placeholder="Paste workflow data here or upload a file..."
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
          />
        </div>

        {/* Options */}
        <div className="space-y-4">
          <Label>Import Options</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.validateCompatibility}
                  onChange={(e) => setOptions(prev => ({ ...prev, validateCompatibility: e.target.checked }))}
                />
                <span className="text-sm">Validate compatibility</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.createNewVersion}
                  onChange={(e) => setOptions(prev => ({ ...prev, createNewVersion: e.target.checked }))}
                />
                <span className="text-sm">Create new version</span>
              </label>
            </div>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.autoMigrate}
                  onChange={(e) => setOptions(prev => ({ ...prev, autoMigrate: e.target.checked }))}
                />
                <span className="text-sm">Auto-migrate</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.overwriteExisting}
                  onChange={(e) => setOptions(prev => ({ ...prev, overwriteExisting: e.target.checked }))}
                />
                <span className="text-sm">Overwrite existing</span>
              </label>
            </div>
          </div>
        </div>

        {/* Import Button */}
        <Button onClick={handleImport} disabled={loading || !importData.trim()} className="w-full">
          <Upload className="h-4 w-4 mr-2" />
          {loading ? 'Importing...' : 'Import Workflow'}
        </Button>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Promotion Tab Component
// ============================================================================

function PromotionTab({ 
  workflowId, 
  versions, 
  onPromotion, 
  loading 
}: {
  workflowId: string;
  versions: WorkflowVersion[];
  onPromotion: (request: PromotionRequest) => void;
  loading: boolean;
}) {
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [fromEnvironment, setFromEnvironment] = useState<'dev' | 'staging' | 'prod'>('dev');
  const [toEnvironment, setToEnvironment] = useState<'dev' | 'staging' | 'prod'>('staging');
  const [options, setOptions] = useState({
    validateCompatibility: true,
    backupExisting: true,
    dryRun: false
  });

  const handlePromotion = () => {
    if (!selectedVersion) {
      return;
    }

    onPromotion({
      workflowId,
      versionId: selectedVersion,
      fromEnvironment,
      toEnvironment,
      options
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ArrowUpDown className="h-5 w-5" />
          <span>Promote Workflow</span>
        </CardTitle>
        <CardDescription>
          Promote workflow version between environments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Version Selection */}
        <div className="space-y-2">
          <Label>Version to Promote</Label>
          <Select value={selectedVersion} onValueChange={setSelectedVersion}>
            <SelectTrigger>
              <SelectValue placeholder="Select version" />
            </SelectTrigger>
            <SelectContent>
              {versions.map((version) => (
                <SelectItem key={version.id} value={version.id}>
                  v{version.version} - {version.status} ({version.environment})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Environment Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>From Environment</Label>
            <Select value={fromEnvironment} onValueChange={(value: any) => setFromEnvironment(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dev">Development</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="prod">Production</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>To Environment</Label>
            <Select value={toEnvironment} onValueChange={(value: any) => setToEnvironment(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dev">Development</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="prod">Production</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <Label>Promotion Options</Label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.validateCompatibility}
                onChange={(e) => setOptions(prev => ({ ...prev, validateCompatibility: e.target.checked }))}
              />
              <span className="text-sm">Validate compatibility</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.backupExisting}
                onChange={(e) => setOptions(prev => ({ ...prev, backupExisting: e.target.checked }))}
              />
              <span className="text-sm">Backup existing version</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.dryRun}
                onChange={(e) => setOptions(prev => ({ ...prev, dryRun: e.target.checked }))}
              />
              <span className="text-sm">Dry run (validation only)</span>
            </label>
          </div>
        </div>

        {/* Promotion Button */}
        <Button 
          onClick={handlePromotion} 
          disabled={loading || !selectedVersion || fromEnvironment === toEnvironment} 
          className="w-full"
        >
          <ArrowUpDown className="h-4 w-4 mr-2" />
          {loading ? 'Promoting...' : 'Promote Workflow'}
        </Button>
      </CardContent>
    </Card>
  );
}
