/**
 * @fileoverview Bulk Operations Interface Components
 * @module components/admin/bulk-operations
 * @author OSS Hero System
 * @version 1.0.0
 * @created 2025-09-20T12:58:28.000Z
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Play,
  Pause,
  Square,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Users,
  Package,
  Trash2,
  Download,
  Upload,
  Settings,
  Filter,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Copy
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  version: string;
  author: string;
  category: string;
  status: 'active' | 'deprecated' | 'maintenance' | 'beta';
  downloads: number;
  lastUpdated: string;
  securityScore: number;
  performanceScore: number;
  tags: string[];
}

interface BulkOperation {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  templateCount: number;
  createdAt: string;
  completedAt?: string;
  createdBy: string;
  results?: {
    successful: number;
    failed: number;
    errors: string[];
  };
}

interface BulkOperationsProps {
  templates: Template[];
  selectedTemplates: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onBulkAction: (action: string, templateIds: string[]) => void;
}

const BULK_OPERATION_TYPES = [
  {
    id: 'status_update',
    name: 'Update Status',
    description: 'Change the status of selected templates',
    icon: Settings,
    riskLevel: 'low',
    requiresConfirmation: false
  },
  {
    id: 'priority_update',
    name: 'Update Priority',
    description: 'Change the priority level of selected templates',
    icon: AlertTriangle,
    riskLevel: 'low',
    requiresConfirmation: false
  },
  {
    id: 'bulk_approval',
    name: 'Bulk Approval',
    description: 'Approve multiple templates for enterprise use',
    icon: CheckCircle,
    riskLevel: 'medium',
    requiresConfirmation: true
  },
  {
    id: 'security_scan',
    name: 'Security Scan',
    description: 'Run security analysis on selected templates',
    icon: AlertTriangle,
    riskLevel: 'low',
    requiresConfirmation: false
  },
  {
    id: 'export_data',
    name: 'Export Data',
    description: 'Export template data and configurations',
    icon: Download,
    riskLevel: 'low',
    requiresConfirmation: false
  },
  {
    id: 'bulk_deletion',
    name: 'Bulk Deletion',
    description: 'Delete multiple templates (DANGEROUS)',
    icon: Trash2,
    riskLevel: 'critical',
    requiresConfirmation: true
  }
];

export function BulkOperations({ 
  templates, 
  selectedTemplates, 
  onSelectionChange, 
  onBulkAction 
}: BulkOperationsProps) {
  const [activeOperations, setActiveOperations] = useState<BulkOperation[]>([]);
  const [selectedOperation, setSelectedOperation] = useState('');
  const [operationParameters, setOperationParameters] = useState<Record<string, any>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  
  // Mock active operations data
  useEffect(() => {
    const mockOperations: BulkOperation[] = [
      {
        id: 'op-001',
        name: 'Security Scan - September 2025',
        type: 'security_scan',
        status: 'completed',
        progress: 100,
        templateCount: 25,
        createdAt: '2025-09-20T10:00:00Z',
        completedAt: '2025-09-20T10:15:00Z',
        createdBy: 'admin@osshero.dev',
        results: {
          successful: 23,
          failed: 2,
          errors: ['Template XYZ: Outdated dependencies', 'Template ABC: Security vulnerability']
        }
      },
      {
        id: 'op-002',
        name: 'Bulk Status Update',
        type: 'status_update',
        status: 'running',
        progress: 65,
        templateCount: 15,
        createdAt: '2025-09-20T12:30:00Z',
        createdBy: 'manager@osshero.dev'
      }
    ];
    
    setActiveOperations(mockOperations);
  }, []);
  
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || template.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(filteredTemplates.map(t => t.id));
    } else {
      onSelectionChange([]);
    }
  };
  
  const handleTemplateSelect = (templateId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedTemplates, templateId]);
    } else {
      onSelectionChange(selectedTemplates.filter(id => id !== templateId));
    }
  };
  
  const handleStartOperation = () => {
    const operationType = BULK_OPERATION_TYPES.find(op => op.id === selectedOperation);
    
    if (!operationType) {
      alert('Please select an operation type');
      return;
    }
    
    if (selectedTemplates.length === 0) {
      alert('Please select at least one template');
      return;
    }
    
    if (operationType.requiresConfirmation) {
      setShowConfirmation(true);
    } else {
      executeOperation();
    }
  };
  
  const executeOperation = () => {
    onBulkAction(selectedOperation, selectedTemplates);
    setShowConfirmation(false);
    setSelectedOperation('');
    setOperationParameters({});
    onSelectionChange([]);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'paused':
        return <Pause className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };
  
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-orange-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="operations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="operations">Bulk Operations</TabsTrigger>
          <TabsTrigger value="templates">Template Selection</TabsTrigger>
          <TabsTrigger value="history">Operation History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="operations" className="space-y-4">
          {/* Operation Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Create Bulk Operation</CardTitle>
              <p className="text-sm text-gray-600">
                Select an operation to perform on {selectedTemplates.length} selected templates
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {BULK_OPERATION_TYPES.map((operation) => {
                  const Icon = operation.icon;
                  return (
                    <div
                      key={operation.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedOperation === operation.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedOperation(operation.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className="h-6 w-6 text-gray-600 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{operation.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{operation.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs font-medium ${getRiskLevelColor(operation.riskLevel)}`}>
                              {operation.riskLevel.toUpperCase()} RISK
                            </span>
                            {operation.requiresConfirmation && (
                              <Badge variant="secondary" className="text-xs">
                                Requires Confirmation
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Operation Parameters */}
              {selectedOperation && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Operation Parameters</h4>
                  
                  {selectedOperation === 'status_update' && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="newStatus">New Status</Label>
                        <select
                          id="newStatus"
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                          value={operationParameters.newStatus || ''}
                          onChange={(e) => setOperationParameters(prev => ({ ...prev, newStatus: e.target.value }))}
                        >
                          <option value="">Select status...</option>
                          <option value="active">Active</option>
                          <option value="deprecated">Deprecated</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="beta">Beta</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="reason">Reason (Optional)</Label>
                        <Input
                          id="reason"
                          placeholder="Reason for status change..."
                          value={operationParameters.reason || ''}
                          onChange={(e) => setOperationParameters(prev => ({ ...prev, reason: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}
                  
                  {selectedOperation === 'priority_update' && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="newPriority">New Priority</Label>
                        <select
                          id="newPriority"
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                          value={operationParameters.newPriority || ''}
                          onChange={(e) => setOperationParameters(prev => ({ ...prev, newPriority: e.target.value }))}
                        >
                          <option value="">Select priority...</option>
                          <option value="critical">Critical</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                    </div>
                  )}
                  
                  {selectedOperation === 'security_scan' && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="scanDepth">Scan Depth</Label>
                        <select
                          id="scanDepth"
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                          value={operationParameters.scanDepth || 'thorough'}
                          onChange={(e) => setOperationParameters(prev => ({ ...prev, scanDepth: e.target.value }))}
                        >
                          <option value="basic">Basic</option>
                          <option value="thorough">Thorough</option>
                          <option value="comprehensive">Comprehensive</option>
                        </select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="includeDependencies"
                          checked={operationParameters.includeDependencies !== false}
                          onCheckedChange={(checked) => setOperationParameters(prev => ({ ...prev, includeDependencies: checked }))}
                        />
                        <Label htmlFor="includeDependencies">Include dependency scanning</Label>
                      </div>
                    </div>
                  )}
                  
                  {selectedOperation === 'export_data' && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="exportFormat">Export Format</Label>
                        <select
                          id="exportFormat"
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                          value={operationParameters.exportFormat || 'json'}
                          onChange={(e) => setOperationParameters(prev => ({ ...prev, exportFormat: e.target.value }))}
                        >
                          <option value="json">JSON</option>
                          <option value="csv">CSV</option>
                          <option value="yaml">YAML</option>
                          <option value="xml">XML</option>
                        </select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="includeContent"
                          checked={operationParameters.includeContent === true}
                          onCheckedChange={(checked) => setOperationParameters(prev => ({ ...prev, includeContent: checked }))}
                        />
                        <Label htmlFor="includeContent">Include template content</Label>
                      </div>
                    </div>
                  )}
                  
                  {selectedOperation === 'bulk_deletion' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex items-center">
                          <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                          <p className="text-red-800 font-medium">Warning: This action cannot be undone</p>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="confirmationCode">Type "DELETE" to confirm</Label>
                        <Input
                          id="confirmationCode"
                          placeholder="DELETE"
                          value={operationParameters.confirmationCode || ''}
                          onChange={(e) => setOperationParameters(prev => ({ ...prev, confirmationCode: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="deletionReason">Reason for deletion</Label>
                        <Textarea
                          id="deletionReason"
                          placeholder="Explain why these templates are being deleted..."
                          value={operationParameters.deletionReason || ''}
                          onChange={(e) => setOperationParameters(prev => ({ ...prev, deletionReason: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-600">
                  {selectedTemplates.length} templates selected
                </div>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" onClick={() => onSelectionChange([])}>
                    Clear Selection
                  </Button>
                  <Button 
                    onClick={handleStartOperation}
                    disabled={!selectedOperation || selectedTemplates.length === 0}
                  >
                    Start Operation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-4">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Template Selection</CardTitle>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search templates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="deprecated">Deprecated</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="beta">Beta</option>
                </select>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Categories</option>
                  <option value="Dashboard">Dashboard</option>
                  <option value="Forms">Forms</option>
                  <option value="E-commerce">E-commerce</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Select All */}
                <div className="flex items-center space-x-2 pb-2 border-b">
                  <Checkbox
                    checked={selectedTemplates.length === filteredTemplates.length && filteredTemplates.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label className="font-medium">
                    Select All ({filteredTemplates.length} templates)
                  </Label>
                </div>
                
                {/* Template List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border ${
                        selectedTemplates.includes(template.id)
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Checkbox
                        checked={selectedTemplates.includes(template.id)}
                        onCheckedChange={(checked) => handleTemplateSelect(template.id, checked as boolean)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{template.name}</p>
                            <p className="text-sm text-gray-500">
                              v{template.version} by {template.author}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(template.status)}>
                              {template.status}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {template.downloads.toLocaleString()} downloads
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          {/* Active Operations */}
          <Card>
            <CardHeader>
              <CardTitle>Active Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeOperations.filter(op => op.status === 'running' || op.status === 'pending').map((operation) => (
                  <div key={operation.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{operation.name}</h3>
                        <p className="text-sm text-gray-500">
                          {operation.templateCount} templates • Created by {operation.createdBy}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(operation.status)}>
                          {getStatusIcon(operation.status)}
                          <span className="ml-1">{operation.status}</span>
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {operation.status === 'running' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{operation.progress}%</span>
                        </div>
                        <Progress value={operation.progress} className="h-2" />
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 mt-3">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      {operation.status === 'running' && (
                        <Button variant="outline" size="sm">
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Square className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
                
                {activeOperations.filter(op => op.status === 'running' || op.status === 'pending').length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active operations</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Operation History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeOperations.filter(op => op.status === 'completed' || op.status === 'failed').map((operation) => (
                  <div key={operation.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{operation.name}</h3>
                        <p className="text-sm text-gray-500">
                          {operation.templateCount} templates • 
                          {operation.completedAt && (
                            <> Completed {new Date(operation.completedAt).toLocaleDateString()}</>
                          )}
                        </p>
                        {operation.results && (
                          <p className="text-sm text-gray-600 mt-1">
                            {operation.results.successful} successful, {operation.results.failed} failed
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(operation.status)}>
                          {getStatusIcon(operation.status)}
                          <span className="ml-1">{operation.status}</span>
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Operation</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to perform this operation on {selectedTemplates.length} templates?
              This action may have significant impact.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowConfirmation(false)}>
                Cancel
              </Button>
              <Button onClick={executeOperation}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
