/**
 * Hero Tasks - Task List Component
 * Created: 2025-09-05T02:16:09.652Z
 * Version: 1.0.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Plus, RefreshCw, GripVertical, CheckSquare, FileText, Download } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { DraggableTaskCard } from './DraggableTaskCard';
import { SelectableTaskCard } from './SelectableTaskCard';
import { BulkOperationsToolbar } from './BulkOperationsToolbar';
import { ExportControls } from './ExportControls';
import { AdvancedSearch } from './AdvancedSearch';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { useBulkOperations } from '@/hooks/useBulkOperations';
import { useExport } from '@/hooks/useExport';
import {
  HeroTask,
  TaskSearchRequest,
  TaskSearchResult,
  TaskStatus,
  TaskPriority,
  TaskType,
  WorkflowPhase
} from '@/types/hero-tasks';

interface TaskListProps {
  onTaskCreate?: () => void;
  onTaskEdit?: (taskId: string) => void;
  onTaskView?: (taskId: string) => void;
  onTaskTemplate?: () => void;
  className?: string;
  searchInputRef?: React.RefObject<HTMLInputElement>;
  createButtonRef?: React.RefObject<HTMLButtonElement>;
  enableDragAndDrop?: boolean;
  enableBulkOperations?: boolean;
  enableExport?: boolean;
  enableAdvancedSearch?: boolean;
}

export function TaskList({
  onTaskCreate,
  onTaskEdit,
  onTaskView,
  onTaskTemplate,
  className,
  searchInputRef,
  createButtonRef,
  enableDragAndDrop = true,
  enableBulkOperations = true,
  enableExport = true,
  enableAdvancedSearch = true
}: TaskListProps) {
  const [tasks, setTasks] = useState<HeroTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    type: '',
    phase: ''
  });
  const [advancedFilters, setAdvancedFilters] = useState<any>({});
  const [useAdvancedSearch, setUseAdvancedSearch] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalCount: 0,
    hasMore: false
  });

  // Drag and Drop functionality
  const dragAndDrop = useDragAndDrop({
    items: tasks,
    onReorder: async (fromIndex, toIndex) => {
      try {
        // Create new array with reordered items
        const newTasks = [...tasks];
        const [movedTask] = newTasks.splice(fromIndex, 1);
        newTasks.splice(toIndex, 0, movedTask);

        // Update local state immediately for responsive UI
        setTasks(newTasks);

        // Update task priorities based on new order
        const updatedTasks = newTasks.map((task, index) => ({
          ...task,
          metadata: {
            ...task.metadata,
            display_order: index,
            last_reordered_at: new Date().toISOString()
          }
        }));

        // Send update to server
        const response = await fetch('/api/hero-tasks/reorder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            task_ids: updatedTasks.map(task => task.id),
            reorder_timestamp: new Date().toISOString()
          }),
        });

        if (!response.ok) {
          // Revert on error
          setTasks(tasks);
          throw new Error('Failed to reorder tasks');
        }

        // Update with server response
        const result = await response.json();
        if (result.success && result.data) {
          setTasks(result.data);
        }
      } catch (error) {
        console.error('Failed to reorder tasks:', error);
        // Revert to original order
        setTasks(tasks);
      }
    },
    getItemId: (task) => task.id,
    disabled: !enableDragAndDrop
  });

  // Bulk Operations functionality
  const bulkOperations = useBulkOperations({
    tasks,
    onTasksUpdate: (updatedTasks) => {
      setTasks(updatedTasks);
    },
    onError: (error) => {
      setError(error);
    },
    onSuccess: (message) => {
      // Could show a toast notification here
      console.log('Bulk operation success:', message);
    }
  });

  // Export functionality
  const exportHook = useExport({
    onSuccess: (result) => {
      console.log('Export successful:', result.file_name);
    },
    onError: (error) => {
      setError(error);
    }
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      if (useAdvancedSearch && Object.keys(advancedFilters).length > 0) {
        // Use advanced search API
        const response = await fetch('/api/hero-tasks/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...advancedFilters,
            page: pagination.page,
            page_size: pagination.pageSize
          })
        });

        if (!response.ok) {
          throw new Error('Failed to perform advanced search');
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          setTasks(result.data.tasks);
          setPagination({
            page: result.data.page,
            pageSize: result.data.page_size,
            totalCount: result.data.total_count,
            hasMore: result.data.has_more
          });
        } else {
          throw new Error('Advanced search failed');
        }
      } else {
        // Use basic search
        const searchRequest: TaskSearchRequest = {
          page: pagination.page,
          page_size: pagination.pageSize,
          filters: {
            search_text: searchQuery || undefined,
            status: filters.status ? [filters.status as TaskStatus] : undefined,
            priority: filters.priority ? [filters.priority as TaskPriority] : undefined,
            type: filters.type ? [filters.type as TaskType] : undefined,
            current_phase: filters.phase ? [filters.phase as WorkflowPhase] : undefined
          }
        };

        const response = await fetch('/api/hero-tasks?' + new URLSearchParams({
          ...Object.fromEntries(
            Object.entries(searchRequest.filters || {}).filter(([_, value]) => value !== undefined)
          ),
          page: searchRequest.page?.toString() || '1',
          page_size: searchRequest.page_size?.toString() || '20'
        }));

        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const result: TaskSearchResult = await response.json();
        
        if (result.success && result.data) {
          setTasks(result.data.tasks);
          setPagination({
            page: result.data.page,
            pageSize: result.data.page_size,
            totalCount: result.data.total_count,
            hasMore: result.data.has_more
          });
        } else {
          throw new Error('Failed to fetch tasks');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [pagination.page, searchQuery, filters, advancedFilters, useAdvancedSearch]);

  const handleAdvancedSearch = (filters: any) => {
    setAdvancedFilters(filters);
    setUseAdvancedSearch(true);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleClearAdvancedSearch = () => {
    setAdvancedFilters({});
    setUseAdvancedSearch(false);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      type: '',
      phase: ''
    });
    setSearchQuery('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const loadMore = () => {
    if (pagination.hasMore) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const refreshTasks = () => {
    fetchTasks();
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-gray-500">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error: {error}</p>
          <Button onClick={refreshTasks} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Hero Tasks</h2>
          <p className="text-gray-500">
            {pagination.totalCount} task{pagination.totalCount !== 1 ? 's' : ''} found
            {enableDragAndDrop && (
              <span className="ml-2 text-blue-600">
                • Drag to reorder
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {enableBulkOperations && (
            <Button
              variant={bulkOperations.isSelectMode ? "default" : "outline"}
              size="sm"
              onClick={bulkOperations.toggleSelectMode}
              className="flex items-center gap-2"
            >
              <CheckSquare className="w-4 h-4" />
              {bulkOperations.isSelectMode ? 'Exit Select' : 'Select Tasks'}
            </Button>
          )}
          <Button
            variant={enableDragAndDrop ? "default" : "outline"}
            size="sm"
            onClick={() => {
              // This would be handled by parent component
              // For now, we'll just show the current state
            }}
            className="flex items-center gap-2"
          >
            <GripVertical className="w-4 h-4" />
            {enableDragAndDrop ? 'Drag Mode' : 'Enable Drag'}
          </Button>
          <Button onClick={onTaskCreate} ref={createButtonRef}>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
          {onTaskTemplate && (
            <Button onClick={onTaskTemplate} variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              From Template
            </Button>
          )}
          {enableExport && (
            <ExportControls
              selectedTasks={Array.from(bulkOperations.selectedTasks as unknown as Set<string>)}
              currentFilters={{
                search_text: searchQuery || undefined,
                status: filters.status ? [filters.status as TaskStatus] : undefined,
                priority: filters.priority ? [filters.priority as TaskPriority] : undefined,
                type: filters.type ? [filters.type as TaskType] : undefined,
                current_phase: filters.phase ? [filters.phase as WorkflowPhase] : undefined
              }}
              onExport={async (exportRequest) => {
                await exportHook.exportTasks(exportRequest);
              }}
            />
          )}
        </div>
      </div>

      {/* Search and Filters */}
      {enableAdvancedSearch ? (
        <AdvancedSearch
          onSearch={handleAdvancedSearch}
          onClear={handleClearAdvancedSearch}
          initialFilters={advancedFilters}
          enableQueryBuilder={true}
          className="mb-6"
        />
      ) : (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value={TaskStatus.DRAFT}>Draft</SelectItem>
                    <SelectItem value={TaskStatus.READY}>Ready</SelectItem>
                    <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                    <SelectItem value={TaskStatus.BLOCKED}>Blocked</SelectItem>
                    <SelectItem value={TaskStatus.COMPLETED}>Completed</SelectItem>
                    <SelectItem value={TaskStatus.CANCELLED}>Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Priorities</SelectItem>
                    <SelectItem value={TaskPriority.CRITICAL}>Critical</SelectItem>
                    <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                    <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                    <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value={TaskType.FEATURE}>Feature</SelectItem>
                    <SelectItem value={TaskType.BUG_FIX}>Bug Fix</SelectItem>
                    <SelectItem value={TaskType.REFACTOR}>Refactor</SelectItem>
                    <SelectItem value={TaskType.DOCUMENTATION}>Documentation</SelectItem>
                    <SelectItem value={TaskType.TEST}>Test</SelectItem>
                    <SelectItem value={TaskType.SECURITY}>Security</SelectItem>
                    <SelectItem value={TaskType.PERFORMANCE}>Performance</SelectItem>
                    <SelectItem value={TaskType.INTEGRATION}>Integration</SelectItem>
                    <SelectItem value={TaskType.MIGRATION}>Migration</SelectItem>
                    <SelectItem value={TaskType.MAINTENANCE}>Maintenance</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.phase} onValueChange={(value) => handleFilterChange('phase', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Phases</SelectItem>
                    <SelectItem value={WorkflowPhase.AUDIT}>Audit</SelectItem>
                    <SelectItem value={WorkflowPhase.DECIDE}>Decide</SelectItem>
                    <SelectItem value={WorkflowPhase.APPLY}>Apply</SelectItem>
                    <SelectItem value={WorkflowPhase.VERIFY}>Verify</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filters */}
              {(Object.values(filters).some(f => f) || searchQuery) && (
                <div className="flex flex-wrap items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-xs sm:text-sm text-gray-500">Active filters:</span>
                  {searchQuery && (
                    <Badge variant="secondary" className="text-xs">Search: &quot;{searchQuery}&quot;</Badge>
                  )}
                  {filters.status && (
                    <Badge variant="secondary" className="text-xs">Status: {filters.status}</Badge>
                  )}
                  {filters.priority && (
                    <Badge variant="secondary" className="text-xs">Priority: {filters.priority}</Badge>
                  )}
                  {filters.type && (
                    <Badge variant="secondary" className="text-xs">Type: {filters.type}</Badge>
                  )}
                  {filters.phase && (
                    <Badge variant="secondary" className="text-xs">Phase: {filters.phase}</Badge>
                  )}
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="touch-manipulation">
                    Clear All
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Operations Toolbar */}
      {enableBulkOperations && bulkOperations.hasSelection && (
        <BulkOperationsToolbar
          selectedCount={bulkOperations.selectedCount}
          totalCount={bulkOperations.totalCount}
          isProcessing={bulkOperations.isProcessing}
          bulkOperations={bulkOperations.bulkOperations}
          onExecuteOperation={bulkOperations.executeBulkOperation}
          onClearSelection={bulkOperations.clearSelection}
          className="mb-6"
        />
      )}

      {/* Tasks Grid */}
      {tasks.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-48 sm:h-64">
            <div className="text-center">
              <p className="text-gray-500 mb-4">No tasks found</p>
              <Button onClick={onTaskCreate} className="touch-manipulation">
                <Plus className="w-4 h-4 mr-2" />
                Create First Task
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div
          ref={dragAndDrop.dragConstraintsRef as React.LegacyRef<HTMLDivElement>}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {tasks.map((task, index) => {
            // Determine which component to render based on enabled features
            if (bulkOperations.isSelectMode) {
              return (
                <SelectableTaskCard
                  key={task.id}
                  task={task}
                  isSelected={bulkOperations.isTaskSelected(task.id)}
                  isSelectMode={bulkOperations.isSelectMode}
                  onToggleSelection={bulkOperations.toggleTaskSelection}
                  onEdit={onTaskEdit}
                  onView={onTaskView}
                />
              );
            } else if (enableDragAndDrop) {
              return (
                <DraggableTaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onEdit={onTaskEdit}
                  onView={onTaskView}
                  dragAndDrop={dragAndDrop}
                />
              );
            } else {
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onTaskEdit}
                  onView={onTaskView}
                />
              );
            }
          })}
        </div>
      )}

      {/* Load More */}
      {pagination.hasMore && (
        <div className="flex justify-center mt-6 sm:mt-8">
          <Button onClick={loadMore} variant="outline" disabled={loading} className="touch-manipulation">
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default TaskList;
