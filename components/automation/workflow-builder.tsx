'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Play,
  Pause,
  Save,
  Download,
  Upload,
  Trash2,
  Plus,
  Settings,
  Zap,
  Clock,
  Mail,
  Database,
  Webhook,
  GitBranch,
  Code,
  Filter,
  MapPin,
  Link,
  ArrowRight,
  ArrowDown,
  Circle,
  Square,
  Triangle,
  MousePointer,
  Move,
  Copy,
  Edit3
} from 'lucide-react';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'transform';
  category: 'trigger' | 'email' | 'database' | 'webhook' | 'logic' | 'utility';
  name: string;
  description: string;
  position: { x: number; y: number };
  config: Record<string, any>;
  inputs: Array<{
    id: string;
    name: string;
    type: string;
    required: boolean;
  }>;
  outputs: Array<{
    id: string;
    name: string;
    type: string;
  }>;
  status?: 'idle' | 'running' | 'success' | 'error';
  executionTime?: number;
  lastRun?: Date;
}

interface WorkflowConnection {
  id: string;
  sourceNodeId: string;
  sourceOutputId: string;
  targetNodeId: string;
  targetInputId: string;
  condition?: {
    type: 'always' | 'success' | 'error' | 'custom';
    expression?: string;
  };
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  variables: Record<string, any>;
}

interface BusinessProcessWorkflow {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  variables: Record<string, any>;
  schedule?: {
    enabled: boolean;
    type: 'interval' | 'cron';
    expression: string;
  };
  triggers: Array<{
    type: string;
    config: Record<string, any>;
  }>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

const NODE_TYPES = {
  triggers: [
    {
      type: 'webhook_trigger',
      name: 'Webhook',
      description: 'Triggered by HTTP webhook',
      icon: <Webhook className="h-4 w-4" />,
      category: 'trigger',
      inputs: [],
      outputs: [{ id: 'success', name: 'Success', type: 'data' }]
    },
    {
      type: 'schedule_trigger',
      name: 'Schedule',
      description: 'Triggered on schedule',
      icon: <Clock className="h-4 w-4" />,
      category: 'trigger',
      inputs: [],
      outputs: [{ id: 'tick', name: 'Tick', type: 'trigger' }]
    },
    {
      type: 'form_submission',
      name: 'Form Submission',
      description: 'Triggered when form is submitted',
      icon: <GitBranch className="h-4 w-4" />,
      category: 'trigger',
      inputs: [],
      outputs: [{ id: 'submission', name: 'Submission', type: 'data' }]
    }
  ],
  actions: [
    {
      type: 'send_email',
      name: 'Send Email',
      description: 'Send email notification',
      icon: <Mail className="h-4 w-4" />,
      category: 'email',
      inputs: [{ id: 'data', name: 'Data', type: 'data', required: true }],
      outputs: [{ id: 'success', name: 'Success', type: 'data' }, { id: 'error', name: 'Error', type: 'error' }]
    },
    {
      type: 'webhook_call',
      name: 'Webhook Call',
      description: 'Call external webhook',
      icon: <Webhook className="h-4 w-4" />,
      category: 'webhook',
      inputs: [{ id: 'data', name: 'Data', type: 'data', required: true }],
      outputs: [{ id: 'response', name: 'Response', type: 'data' }, { id: 'error', name: 'Error', type: 'error' }]
    },
    {
      type: 'database_insert',
      name: 'Database Insert',
      description: 'Insert data into database',
      icon: <Database className="h-4 w-4" />,
      category: 'database',
      inputs: [{ id: 'data', name: 'Data', type: 'data', required: true }],
      outputs: [{ id: 'inserted', name: 'Inserted', type: 'data' }]
    },
    {
      type: 'delay',
      name: 'Delay',
      description: 'Wait for specified time',
      icon: <Clock className="h-4 w-4" />,
      category: 'utility',
      inputs: [{ id: 'input', name: 'Input', type: 'data', required: true }],
      outputs: [{ id: 'output', name: 'Output', type: 'data' }]
    },
    {
      type: 'condition',
      name: 'Condition',
      description: 'Branch based on condition',
      icon: <GitBranch className="h-4 w-4" />,
      category: 'logic',
      inputs: [{ id: 'input', name: 'Input', type: 'data', required: true }],
      outputs: [{ id: 'true', name: 'True', type: 'data' }, { id: 'false', name: 'False', type: 'data' }]
    },
    {
      type: 'transform',
      name: 'Transform Data',
      description: 'Transform and map data',
      icon: <Code className="h-4 w-4" />,
      category: 'utility',
      inputs: [{ id: 'input', name: 'Input', type: 'data', required: true }],
      outputs: [{ id: 'output', name: 'Output', type: 'data' }]
    }
  ]
};

export default function WorkflowBuilder() {
  const [workflow, setWorkflow] = useState<BusinessProcessWorkflow>({
    id: '',
    name: 'New Workflow',
    description: '',
    status: 'draft',
    nodes: [],
    connections: [],
    variables: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'current-user'
  });

  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<WorkflowConnection | null>(null);
  const [draggedNode, setDraggedNode] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<{
    nodeId: string;
    outputId: string;
    position: { x: number; y: number };
  } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const handleDragStart = (nodeType: any) => {
    setDraggedNode(nodeType);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedNode || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type: draggedNode.type.includes('trigger') ? 'trigger' : 'action',
      category: draggedNode.category,
      name: draggedNode.name,
      description: draggedNode.description,
      position: { x, y },
      config: {},
      inputs: draggedNode.inputs || [],
      outputs: draggedNode.outputs || []
    };

    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      updatedAt: new Date()
    }));

    setDraggedNode(null);
  }, [draggedNode, zoom, pan]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleNodeSelect = (node: WorkflowNode) => {
    setSelectedNode(node);
    setSelectedConnection(null);
  };

  const handleNodeUpdate = (nodeId: string, updates: Partial<WorkflowNode>) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(node =>
        node.id === nodeId ? { ...node, ...updates } : node
      ),
      updatedAt: new Date()
    }));

    if (selectedNode?.id === nodeId) {
      setSelectedNode(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleNodeDelete = (nodeId: string) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId),
      connections: prev.connections.filter(
        conn => conn.sourceNodeId !== nodeId && conn.targetNodeId !== nodeId
      ),
      updatedAt: new Date()
    }));

    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  };

  const handleConnectionStart = (nodeId: string, outputId: string, position: { x: number; y: number }) => {
    setIsConnecting(true);
    setConnectionStart({ nodeId, outputId, position });
  };

  const handleConnectionEnd = (nodeId: string, inputId: string) => {
    if (!connectionStart) return;

    const newConnection: WorkflowConnection = {
      id: `conn_${Date.now()}`,
      sourceNodeId: connectionStart.nodeId,
      sourceOutputId: connectionStart.outputId,
      targetNodeId: nodeId,
      targetInputId: inputId,
      condition: { type: 'always' }
    };

    setWorkflow(prev => ({
      ...prev,
      connections: [...prev.connections, newConnection],
      updatedAt: new Date()
    }));

    setIsConnecting(false);
    setConnectionStart(null);
  };

  const handleSaveWorkflow = async () => {
    // In real implementation, save to backend
    console.log('Saving workflow:', workflow);
  };

  const handleTestWorkflow = async () => {
    // In real implementation, test workflow execution
    console.log('Testing workflow:', workflow);
  };

  const getNodeIcon = (category: string) => {
    switch (category) {
      case 'trigger': return <Zap className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'database': return <Database className="h-4 w-4" />;
      case 'webhook': return <Webhook className="h-4 w-4" />;
      case 'logic': return <GitBranch className="h-4 w-4" />;
      case 'utility': return <Settings className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  const getNodeColor = (category: string) => {
    switch (category) {
      case 'trigger': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'email': return 'bg-green-100 border-green-300 text-green-800';
      case 'database': return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'webhook': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'logic': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'utility': return 'bg-gray-100 border-gray-300 text-gray-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const renderNode = (node: WorkflowNode) => {
    const isSelected = selectedNode?.id === node.id;

    return (
      <div
        key={node.id}
        className={`absolute cursor-pointer border-2 rounded-lg p-3 min-w-[150px] shadow-md hover:shadow-lg transition-all ${
          getNodeColor(node.category)
        } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        style={{
          left: node.position.x,
          top: node.position.y,
          transform: `scale(${zoom})`
        }}
        onClick={() => handleNodeSelect(node)}
      >
        <div className="flex items-center gap-2 mb-2">
          {getNodeIcon(node.category)}
          <span className="font-semibold text-sm">{node.name}</span>
          <Button
            size="sm"
            variant="ghost"
            className="h-4 w-4 p-0 ml-auto"
            onClick={(e) => {
              e.stopPropagation();
              handleNodeDelete(node.id);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        {/* Input connectors */}
        {node.inputs.map((input, index) => (
          <div
            key={input.id}
            className="absolute left-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white cursor-pointer hover:bg-blue-600"
            style={{ top: `${20 + index * 20}px`, left: '-6px' }}
            onClick={(e) => {
              e.stopPropagation();
              if (isConnecting) {
                handleConnectionEnd(node.id, input.id);
              }
            }}
            title={input.name}
          />
        ))}

        {/* Output connectors */}
        {node.outputs.map((output, index) => (
          <div
            key={output.id}
            className="absolute right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white cursor-pointer hover:bg-green-600"
            style={{ top: `${20 + index * 20}px`, right: '-6px' }}
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              handleConnectionStart(node.id, output.id, {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
              });
            }}
            title={output.name}
          />
        ))}

        {node.status && (
          <div className="absolute top-0 right-0 -mt-1 -mr-1">
            <Badge
              variant={
                node.status === 'success' ? 'default' :
                node.status === 'error' ? 'destructive' :
                'secondary'
              }
              className="text-xs"
            >
              {node.status}
            </Badge>
          </div>
        )}
      </div>
    );
  };

  const renderConnection = (connection: WorkflowConnection) => {
    const sourceNode = workflow.nodes.find(n => n.id === connection.sourceNodeId);
    const targetNode = workflow.nodes.find(n => n.id === connection.targetNodeId);

    if (!sourceNode || !targetNode) return null;

    const sourceOutput = sourceNode.outputs.find(o => o.id === connection.sourceOutputId);
    const targetInput = targetNode.inputs.find(i => i.id === connection.targetInputId);

    if (!sourceOutput || !targetInput) return null;

    const sourceIndex = sourceNode.outputs.indexOf(sourceOutput);
    const targetIndex = targetNode.inputs.indexOf(targetInput);

    const startX = sourceNode.position.x + 150; // Node width
    const startY = sourceNode.position.y + 20 + sourceIndex * 20 + 6; // Connector center
    const endX = targetNode.position.x;
    const endY = targetNode.position.y + 20 + targetIndex * 20 + 6;

    const midX = (startX + endX) / 2;

    return (
      <g key={connection.id}>
        <path
          d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
          stroke="#6B7280"
          strokeWidth="2"
          fill="none"
          className="cursor-pointer hover:stroke-blue-500"
          onClick={() => setSelectedConnection(connection)}
        />
        <circle
          cx={midX}
          cy={(startY + endY) / 2}
          r="4"
          fill="#6B7280"
          className="cursor-pointer hover:fill-blue-500"
          onClick={() => setSelectedConnection(connection)}
        />
      </g>
    );
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar - Node Palette */}
      <div className="w-80 bg-white border-r overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Workflow Builder</h2>

          {/* Triggers */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Triggers
            </h3>
            <div className="space-y-2">
              {NODE_TYPES.triggers.map((nodeType) => (
                <div
                  key={nodeType.type}
                  className="p-3 border rounded-lg cursor-grab hover:bg-gray-50 transition-colors"
                  draggable
                  onDragStart={() => handleDragStart(nodeType)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {nodeType.icon}
                    <span className="font-medium text-sm">{nodeType.name}</span>
                  </div>
                  <p className="text-xs text-gray-600">{nodeType.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Actions
            </h3>
            <div className="space-y-2">
              {NODE_TYPES.actions.map((nodeType) => (
                <div
                  key={nodeType.type}
                  className="p-3 border rounded-lg cursor-grab hover:bg-gray-50 transition-colors"
                  draggable
                  onDragStart={() => handleDragStart(nodeType)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {nodeType.icon}
                    <span className="font-medium text-sm">{nodeType.name}</span>
                  </div>
                  <p className="text-xs text-gray-600">{nodeType.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Input
              value={workflow.name}
              onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
              className="font-semibold"
              placeholder="Workflow Name"
            />
            <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
              {workflow.status}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleTestWorkflow}>
              <Play className="h-4 w-4 mr-1" />
              Test
            </Button>
            <Button size="sm" onClick={handleSaveWorkflow}>
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            className="w-full h-full relative"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{ cursor: isConnecting ? 'crosshair' : 'default' }}
          >
            {/* Grid Background */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  radial-gradient(circle, #d1d5db 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
                backgroundPosition: `${pan.x}px ${pan.y}px`
              }}
            />

            {/* SVG for connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <g style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
                {workflow.connections.map(renderConnection)}
              </g>
            </svg>

            {/* Nodes */}
            <div
              className="absolute inset-0"
              style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}
            >
              {workflow.nodes.map(renderNode)}
            </div>

            {/* Connection preview while dragging */}
            {isConnecting && connectionStart && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <line
                  x1={connectionStart.position.x}
                  y1={connectionStart.position.y}
                  x2={connectionStart.position.x + 100} // Would follow mouse in real implementation
                  y2={connectionStart.position.y}
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))}
          >
            +
          </Button>
          <span className="text-xs text-center">{Math.round(zoom * 100)}%</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}
          >
            -
          </Button>
        </div>
      </div>

      {/* Properties Panel */}
      {(selectedNode || selectedConnection) && (
        <div className="w-80 bg-white border-l overflow-y-auto">
          <div className="p-4">
            {selectedNode && (
              <>
                <h3 className="text-lg font-semibold mb-4">Node Properties</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="node-name">Name</Label>
                    <Input
                      id="node-name"
                      value={selectedNode.name}
                      onChange={(e) => handleNodeUpdate(selectedNode.id, { name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="node-description">Description</Label>
                    <Textarea
                      id="node-description"
                      value={selectedNode.description}
                      onChange={(e) => handleNodeUpdate(selectedNode.id, { description: e.target.value })}
                    />
                  </div>

                  {/* Type-specific configuration */}
                  {selectedNode.type === 'action' && selectedNode.category === 'email' && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="email-to">To Email</Label>
                        <Input
                          id="email-to"
                          placeholder="recipient@example.com"
                          value={selectedNode.config.to || ''}
                          onChange={(e) => handleNodeUpdate(selectedNode.id, {
                            config: { ...selectedNode.config, to: e.target.value }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email-subject">Subject</Label>
                        <Input
                          id="email-subject"
                          placeholder="Email subject"
                          value={selectedNode.config.subject || ''}
                          onChange={(e) => handleNodeUpdate(selectedNode.id, {
                            config: { ...selectedNode.config, subject: e.target.value }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email-template">Template</Label>
                        <Select
                          value={selectedNode.config.template || ''}
                          onValueChange={(value) => handleNodeUpdate(selectedNode.id, {
                            config: { ...selectedNode.config, template: value }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select template" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="welcome">Welcome Email</SelectItem>
                            <SelectItem value="notification">Notification</SelectItem>
                            <SelectItem value="reminder">Reminder</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {selectedNode.type === 'trigger' && selectedNode.category === 'trigger' && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="webhook-path">Webhook Path</Label>
                        <Input
                          id="webhook-path"
                          placeholder="/webhook/trigger"
                          value={selectedNode.config.path || ''}
                          onChange={(e) => handleNodeUpdate(selectedNode.id, {
                            config: { ...selectedNode.config, path: e.target.value }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="webhook-method">HTTP Method</Label>
                        <Select
                          value={selectedNode.config.method || 'POST'}
                          onValueChange={(value) => handleNodeUpdate(selectedNode.id, {
                            config: { ...selectedNode.config, method: value }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GET">GET</SelectItem>
                            <SelectItem value="POST">POST</SelectItem>
                            <SelectItem value="PUT">PUT</SelectItem>
                            <SelectItem value="DELETE">DELETE</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {selectedConnection && (
              <>
                <h3 className="text-lg font-semibold mb-4">Connection Properties</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="connection-condition">Condition</Label>
                    <Select
                      value={selectedConnection.condition?.type || 'always'}
                      onValueChange={(value) => {
                        setSelectedConnection(prev => prev ? {
                          ...prev,
                          condition: { ...prev.condition, type: value as any }
                        } : null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="always">Always</SelectItem>
                        <SelectItem value="success">On Success</SelectItem>
                        <SelectItem value="error">On Error</SelectItem>
                        <SelectItem value="custom">Custom Expression</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedConnection.condition?.type === 'custom' && (
                    <div>
                      <Label htmlFor="connection-expression">Expression</Label>
                      <Textarea
                        id="connection-expression"
                        placeholder="data.status === 'approved'"
                        value={selectedConnection.condition?.expression || ''}
                        onChange={(e) => {
                          setSelectedConnection(prev => prev ? {
                            ...prev,
                            condition: { ...prev.condition, expression: e.target.value }
                          } : null);
                        }}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}