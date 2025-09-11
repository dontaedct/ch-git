/**
 * Hero Tasks - Visual Query Builder Interface
 * Created: 2025-09-08T16:07:10.000Z
 * Version: 1.0.0
 * 
 * Visual query builder for complex multi-criteria searches with drag-and-drop
 * functionality, query validation, and real-time preview capabilities.
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/card';
import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { Label } from '@ui/label';
import { Badge } from '@ui/badge';
import { Separator } from '@ui/separator';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Play, 
  Eye, 
  Save, 
  Loader2,
  AlertCircle,
  CheckCircle,
  GripVertical,
  Filter,
  Search,
  Calendar,
  User,
  Tag,
  Clock,
  Zap,
  FileText,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@ui/tooltip';
import { cn } from '@/lib/utils';
import {
  TaskStatus,
  TaskPriority,
  TaskType,
  WorkflowPhase
} from '@/types/hero-tasks';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface QueryCondition {
  id: string;
  field: string;
  operator: string;
  value: string | string[] | number | boolean;
  logicalOperator?: 'AND' | 'OR';
}

interface QueryGroup {
  id: string;
  conditions: QueryCondition[];
  logicalOperator: 'AND' | 'OR';
  isCollapsed?: boolean;
}

interface QueryBuilderProps {
  onQueryChange: (query: any) => void;
  onExecute: (query: any) => void;
  onSave?: (query: any, name: string) => void;
  initialQuery?: any;
  className?: string;
}

// ============================================================================
// FIELD DEFINITIONS
// ============================================================================

const FIELD_DEFINITIONS = {
  // Text fields
  title: {
    label: 'Title',
    type: 'text',
    icon: FileText,
    operators: ['contains', 'equals', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty']
  },
  description: {
    label: 'Description',
    type: 'text',
    icon: FileText,
    operators: ['contains', 'equals', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty']
  },
  
  // Status fields
  status: {
    label: 'Status',
    type: 'select',
    icon: Clock,
    operators: ['equals', 'not_equals', 'in', 'not_in'],
    options: Object.values(TaskStatus).map(status => ({
      value: status,
      label: status.replace('_', ' ').toUpperCase()
    }))
  },
  priority: {
    label: 'Priority',
    type: 'select',
    icon: Zap,
    operators: ['equals', 'not_equals', 'in', 'not_in'],
    options: Object.values(TaskPriority).map(priority => ({
      value: priority,
      label: priority.toUpperCase()
    }))
  },
  type: {
    label: 'Task Type',
    type: 'select',
    icon: Tag,
    operators: ['equals', 'not_equals', 'in', 'not_in'],
    options: Object.values(TaskType).map(type => ({
      value: type,
      label: type.replace('_', ' ').toUpperCase()
    }))
  },
  current_phase: {
    label: 'Workflow Phase',
    type: 'select',
    icon: Clock,
    operators: ['equals', 'not_equals', 'in', 'not_in'],
    options: Object.values(WorkflowPhase).map(phase => ({
      value: phase,
      label: phase.toUpperCase()
    }))
  },
  
  // Date fields
  created_at: {
    label: 'Created Date',
    type: 'date',
    icon: Calendar,
    operators: ['equals', 'not_equals', 'before', 'after', 'between', 'is_empty', 'is_not_empty']
  },
  due_date: {
    label: 'Due Date',
    type: 'date',
    icon: Calendar,
    operators: ['equals', 'not_equals', 'before', 'after', 'between', 'is_empty', 'is_not_empty']
  },
  completed_at: {
    label: 'Completed Date',
    type: 'date',
    icon: Calendar,
    operators: ['equals', 'not_equals', 'before', 'after', 'between', 'is_empty', 'is_not_empty']
  },
  
  // Numeric fields
  estimated_duration_hours: {
    label: 'Estimated Duration (hours)',
    type: 'number',
    icon: Clock,
    operators: ['equals', 'not_equals', 'greater_than', 'less_than', 'between', 'is_empty', 'is_not_empty']
  },
  actual_duration_hours: {
    label: 'Actual Duration (hours)',
    type: 'number',
    icon: Clock,
    operators: ['equals', 'not_equals', 'greater_than', 'less_than', 'between', 'is_empty', 'is_not_empty']
  },
  
  // Boolean fields
  has_subtasks: {
    label: 'Has Subtasks',
    type: 'boolean',
    icon: FileText,
    operators: ['equals'],
    options: [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' }
    ]
  },
  has_attachments: {
    label: 'Has Attachments',
    type: 'boolean',
    icon: FileText,
    operators: ['equals'],
    options: [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' }
    ]
  },
  has_comments: {
    label: 'Has Comments',
    type: 'boolean',
    icon: FileText,
    operators: ['equals'],
    options: [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' }
    ]
  },
  is_overdue: {
    label: 'Is Overdue',
    type: 'boolean',
    icon: AlertCircle,
    operators: ['equals'],
    options: [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' }
    ]
  },
  
  // Array fields
  tags: {
    label: 'Tags',
    type: 'array',
    icon: Tag,
    operators: ['contains', 'not_contains', 'contains_all', 'contains_any', 'is_empty', 'is_not_empty']
  }
};

const OPERATOR_LABELS = {
  // Text operators
  contains: 'Contains',
  equals: 'Equals',
  not_equals: 'Not Equals',
  starts_with: 'Starts With',
  ends_with: 'Ends With',
  is_empty: 'Is Empty',
  is_not_empty: 'Is Not Empty',
  
  // Array operators
  in: 'In',
  not_in: 'Not In',
  contains_all: 'Contains All',
  contains_any: 'Contains Any',
  
  // Date operators
  before: 'Before',
  after: 'After',
  between: 'Between',
  
  // Numeric operators
  greater_than: 'Greater Than',
  less_than: 'Less Than'
};

// ============================================================================
// QUERY BUILDER COMPONENT
// ============================================================================

export function QueryBuilder({
  onQueryChange,
  onExecute,
  onSave,
  initialQuery,
  className
}: QueryBuilderProps) {
  const [groups, setGroups] = useState<QueryGroup[]>([
    {
      id: 'group-1',
      conditions: [],
      logicalOperator: 'AND'
    }
  ]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const generateId = () => `condition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const validateQuery = useCallback((queryGroups: QueryGroup[]) => {
    const errors: string[] = [];
    
    queryGroups.forEach((group, groupIndex) => {
      if (group.conditions.length === 0) {
        errors.push(`Group ${groupIndex + 1} has no conditions`);
        return;
      }
      
      group.conditions.forEach((condition, conditionIndex) => {
        if (!condition.field) {
          errors.push(`Group ${groupIndex + 1}, Condition ${conditionIndex + 1}: Field is required`);
        }
        if (!condition.operator) {
          errors.push(`Group ${groupIndex + 1}, Condition ${conditionIndex + 1}: Operator is required`);
        }
        if (condition.value === '' || condition.value === null || condition.value === undefined) {
          errors.push(`Group ${groupIndex + 1}, Condition ${conditionIndex + 1}: Value is required`);
        }
      });
    });
    
    setValidationErrors(errors);
    return errors.length === 0;
  }, []);

  const buildQuery = useCallback((queryGroups: QueryGroup[]) => {
    const query: any = {
      groups: queryGroups.map(group => ({
        logicalOperator: group.logicalOperator,
        conditions: group.conditions.map(condition => ({
          field: condition.field,
          operator: condition.operator,
          value: condition.value
        }))
      }))
    };
    
    return query;
  }, []);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const addCondition = (groupId: string) => {
    const newCondition: QueryCondition = {
      id: generateId(),
      field: '',
      operator: '',
      value: ''
    };

    setGroups(prevGroups => {
      const updatedGroups = prevGroups.map(group => 
        group.id === groupId 
          ? { ...group, conditions: [...group.conditions, newCondition] }
          : group
      );
      
      const query = buildQuery(updatedGroups);
      onQueryChange(query);
      
      return updatedGroups;
    });
  };

  const removeCondition = (groupId: string, conditionId: string) => {
    setGroups(prevGroups => {
      const updatedGroups = prevGroups.map(group => 
        group.id === groupId 
          ? { ...group, conditions: group.conditions.filter(c => c.id !== conditionId) }
          : group
      );
      
      const query = buildQuery(updatedGroups);
      onQueryChange(query);
      
      return updatedGroups;
    });
  };

  const updateCondition = (groupId: string, conditionId: string, updates: Partial<QueryCondition>) => {
    setGroups(prevGroups => {
      const updatedGroups = prevGroups.map(group => 
        group.id === groupId 
          ? {
              ...group,
              conditions: group.conditions.map(condition =>
                condition.id === conditionId 
                  ? { ...condition, ...updates }
                  : condition
              )
            }
          : group
      );
      
      const query = buildQuery(updatedGroups);
      onQueryChange(query);
      
      return updatedGroups;
    });
  };

  const addGroup = () => {
    const newGroup: QueryGroup = {
      id: generateId(),
      conditions: [],
      logicalOperator: 'AND'
    };

    setGroups(prevGroups => {
      const updatedGroups = [...prevGroups, newGroup];
      const query = buildQuery(updatedGroups);
      onQueryChange(query);
      return updatedGroups;
    });
  };

  const removeGroup = (groupId: string) => {
    if (groups.length <= 1) return;

    setGroups(prevGroups => {
      const updatedGroups = prevGroups.filter(group => group.id !== groupId);
      const query = buildQuery(updatedGroups);
      onQueryChange(query);
      return updatedGroups;
    });
  };

  const toggleGroupCollapse = (groupId: string) => {
    setGroups(prevGroups => 
      prevGroups.map(group => 
        group.id === groupId 
          ? { ...group, isCollapsed: !group.isCollapsed }
          : group
      )
    );
  };

  const handleExecute = async () => {
    if (!validateQuery(groups)) return;

    setIsExecuting(true);
    try {
      const query = buildQuery(groups);
      await onExecute(query);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSave = () => {
    if (!validateQuery(groups) || !onSave) return;

    const name = prompt('Enter a name for this query:');
    if (name) {
      const query = buildQuery(groups);
      onSave(query, name);
    }
  };

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderValueInput = (condition: QueryCondition, fieldDef: any) => {
    const { type, options } = fieldDef;

    switch (type) {
      case 'text':
        return (
          <Input
            value={condition.value as string}
            onChange={(e) => updateCondition(condition.id.split('-')[0], condition.id, { value: e.target.value })}
            placeholder="Enter value..."
            className="min-w-[200px]"
          />
        );

      case 'select':
        return (
          <Select
            value={condition.value as string}
            onValueChange={(value) => updateCondition(condition.id.split('-')[0], condition.id, { value })}
          >
            <SelectTrigger className="min-w-[200px]">
              <SelectValue placeholder="Select value..." />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'boolean':
        return (
          <Select
            value={condition.value as string}
            onValueChange={(value) => updateCondition(condition.id.split('-')[0], condition.id, { value: value === 'true' })}
          >
            <SelectTrigger className="min-w-[200px]">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option: any) => (
                <SelectItem key={option.value.toString()} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={condition.value as string}
            onChange={(e) => updateCondition(condition.id.split('-')[0], condition.id, { value: e.target.value })}
            className="min-w-[200px]"
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={condition.value as string}
            onChange={(e) => updateCondition(condition.id.split('-')[0], condition.id, { value: parseFloat(e.target.value) || 0 })}
            placeholder="Enter number..."
            className="min-w-[200px]"
          />
        );

      case 'array':
        return (
          <Input
            value={Array.isArray(condition.value) ? condition.value.join(', ') : condition.value as string}
            onChange={(e) => {
              const values = e.target.value.split(',').map(v => v.trim()).filter(v => v);
              updateCondition(condition.id.split('-')[0], condition.id, { value: values });
            }}
            placeholder="Enter tags (comma-separated)..."
            className="min-w-[200px]"
          />
        );

      default:
        return (
          <Input
            value={condition.value as string}
            onChange={(e) => updateCondition(condition.id.split('-')[0], condition.id, { value: e.target.value })}
            placeholder="Enter value..."
            className="min-w-[200px]"
          />
        );
    }
  };

  const renderCondition = (condition: QueryCondition, groupId: string, isFirst: boolean) => {
    const fieldDef = FIELD_DEFINITIONS[condition.field as keyof typeof FIELD_DEFINITIONS];
    const IconComponent = fieldDef?.icon || Filter;

    return (
      <div key={condition.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
        {!isFirst && (
          <Select
            value={condition.logicalOperator || 'AND'}
            onValueChange={(value) => updateCondition(groupId, condition.id, { logicalOperator: value as 'AND' | 'OR' })}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AND">AND</SelectItem>
              <SelectItem value="OR">OR</SelectItem>
            </SelectContent>
          </Select>
        )}

        <div className="flex items-center gap-2 flex-1">
          <IconComponent className="w-4 h-4 text-gray-500" />
          
          <Select
            value={condition.field}
            onValueChange={(value) => updateCondition(groupId, condition.id, { field: value, operator: '', value: '' })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Field" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(FIELD_DEFINITIONS).map(([key, def]) => (
                <SelectItem key={key} value={key}>
                  {def.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {condition.field && (
            <Select
              value={condition.operator}
              onValueChange={(value) => updateCondition(groupId, condition.id, { operator: value })}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Operator" />
              </SelectTrigger>
              <SelectContent>
                {fieldDef?.operators.map(op => (
                  <SelectItem key={op} value={op}>
                    {OPERATOR_LABELS[op as keyof typeof OPERATOR_LABELS]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {condition.field && condition.operator && renderValueInput(condition, fieldDef)}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeCondition(groupId, condition.id)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderGroup = (group: QueryGroup, groupIndex: number) => {
    const isFirstGroup = groupIndex === 0;
    const hasConditions = group.conditions.length > 0;

    return (
      <Card key={group.id} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleGroupCollapse(group.id)}
              >
                {group.isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              <CardTitle className="text-sm">
                Group {groupIndex + 1}
              </CardTitle>
              {!isFirstGroup && (
                <Select
                  value={group.logicalOperator}
                  onValueChange={(value) => {
                    setGroups(prevGroups => 
                      prevGroups.map(g => 
                        g.id === group.id 
                          ? { ...g, logicalOperator: value as 'AND' | 'OR' }
                          : g
                      )
                    );
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AND">AND</SelectItem>
                    <SelectItem value="OR">OR</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addCondition(group.id)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Condition
              </Button>
              
              {groups.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeGroup(group.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        {!group.isCollapsed && (
          <CardContent className="pt-0">
            {hasConditions ? (
              <div className="space-y-2">
                {group.conditions.map((condition, conditionIndex) => 
                  renderCondition(condition, group.id, conditionIndex === 0)
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Filter className="w-8 h-8 mx-auto mb-2" />
                <p>No conditions added yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addCondition(group.id)}
                  className="mt-2"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add First Condition
                </Button>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Query Builder</h3>
          <p className="text-sm text-gray-500">
            Build complex search queries with visual conditions
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="w-4 h-4 mr-1" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </Button>
          
          {onSave && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={validationErrors.length > 0}
            >
              <Save className="w-4 h-4 mr-1" />
              Save Query
            </Button>
          )}
          
          <Button
            onClick={handleExecute}
            disabled={isExecuting || validationErrors.length > 0}
          >
            {isExecuting ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-1" />
            )}
            Execute Query
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Query Validation Errors</h4>
                <ul className="mt-1 text-sm text-red-700">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Query Groups */}
      <div className="space-y-4">
        {groups.map((group, index) => renderGroup(group, index))}
        
        <Button
          variant="outline"
          onClick={addGroup}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Group
        </Button>
      </div>

      {/* Query Preview */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Query Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
              {JSON.stringify(buildQuery(groups), null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default QueryBuilder;
