/**
 * Hero Tasks - Advanced Search System
 * Created: 2025-09-08T16:07:10.000Z
 * Version: 1.0.0
 * 
 * Advanced search functionality with full-text search, saved filters,
 * and intelligent query processing for the Hero Tasks system.
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/card';
import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { Badge } from '@ui/badge';
import { Label } from '@ui/label';
import { Textarea } from '@ui/textarea';
import { Switch } from '@ui/switch';
import { Separator } from '@ui/separator';
import { 
  Search, 
  Filter, 
  Save, 
  Trash2, 
  Star, 
  Clock, 
  User, 
  Tag, 
  Calendar,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Bookmark,
  History,
  Zap
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@ui/command';
import { cn } from '@/lib/utils';
import { QueryBuilder } from './QueryBuilder';
import {
  HeroTask,
  TaskSearchRequest,
  TaskSearchResult,
  TaskStatus,
  TaskPriority,
  TaskType,
  WorkflowPhase
} from '@/types/hero-tasks';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface AdvancedSearchFilters {
  // Text search
  search_text?: string;
  search_fields?: string[];
  
  // Status filters
  status?: TaskStatus[];
  priority?: TaskPriority[];
  type?: TaskType[];
  phase?: WorkflowPhase[];
  
  // Assignment filters
  assignee_id?: string[];
  created_by?: string[];
  
  // Date filters
  created_after?: string;
  created_before?: string;
  due_after?: string;
  due_before?: string;
  completed_after?: string;
  completed_before?: string;
  
  // Tag filters
  tags?: string[];
  tags_mode?: 'any' | 'all';
  
  // Duration filters
  estimated_duration_min?: number;
  estimated_duration_max?: number;
  actual_duration_min?: number;
  actual_duration_max?: number;
  
  // Advanced filters
  has_subtasks?: boolean;
  has_attachments?: boolean;
  has_comments?: boolean;
  has_dependencies?: boolean;
  is_overdue?: boolean;
  
  // Search options
  case_sensitive?: boolean;
  exact_match?: boolean;
  include_archived?: boolean;
}

interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  filters: AdvancedSearchFilters;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  usage_count: number;
  last_used?: string;
}

interface SearchSuggestion {
  text: string;
  type: 'recent' | 'popular' | 'suggestion';
  count?: number;
}

interface AdvancedSearchProps {
  onSearch: (filters: AdvancedSearchFilters) => void;
  onClear: () => void;
  initialFilters?: AdvancedSearchFilters;
  className?: string;
  enableQueryBuilder?: boolean;
}

// ============================================================================
// ADVANCED SEARCH COMPONENT
// ============================================================================

export function AdvancedSearch({
  onSearch,
  onClear,
  initialFilters = {},
  className,
  enableQueryBuilder = true
}: AdvancedSearchProps) {
  const [filters, setFilters] = useState<AdvancedSearchFilters>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showQueryBuilder, setShowQueryBuilder] = useState(false);

  // Load saved filters and suggestions on mount
  useEffect(() => {
    loadSavedFilters();
    loadSearchSuggestions();
  }, []);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const loadSavedFilters = async () => {
    try {
      const response = await fetch('/api/hero-tasks/search/saved-filters');
      if (response.ok) {
        const data = await response.json();
        setSavedFilters(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load saved filters:', error);
    }
  };

  const loadSearchSuggestions = async () => {
    try {
      const response = await fetch('/api/hero-tasks/search/suggestions');
      if (response.ok) {
        const data = await response.json();
        setSearchSuggestions(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load search suggestions:', error);
    }
  };

  const saveFilter = async (name: string, description?: string, isFavorite = false) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/hero-tasks/search/saved-filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          filters,
          is_favorite: isFavorite
        })
      });

      if (response.ok) {
        await loadSavedFilters();
      }
    } catch (error) {
      console.error('Failed to save filter:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSavedFilter = async (filterId: string) => {
    try {
      const response = await fetch(`/api/hero-tasks/search/saved-filters/${filterId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadSavedFilters();
      }
    } catch (error) {
      console.error('Failed to delete saved filter:', error);
    }
  };

  const applySavedFilter = (savedFilter: SavedFilter) => {
    setFilters(savedFilter.filters);
    onSearch(savedFilter.filters);
    
    // Update usage count
    fetch(`/api/hero-tasks/search/saved-filters/${savedFilter.id}/use`, {
      method: 'POST'
    }).catch(console.error);
  };

  const handleSearch = useCallback(() => {
    onSearch(filters);
  }, [filters, onSearch]);

  const handleClear = useCallback(() => {
    setFilters({});
    onClear();
  }, [onClear]);

  const handleQueryBuilderExecute = useCallback(async (query: any) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/hero-tasks/query-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query)
      });

      if (!response.ok) {
        throw new Error('Query execution failed');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Convert query builder result to search filters format
        const searchFilters: AdvancedSearchFilters = {
          // Map query builder result to search filters
          // This is a simplified mapping - you might want more sophisticated conversion
        };
        
        onSearch(searchFilters);
      }
    } catch (error) {
      console.error('Query builder execution failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onSearch]);

  const handleQueryBuilderSave = useCallback(async (query: any, name: string) => {
    try {
      const response = await fetch('/api/hero-tasks/search/saved-filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: 'Query Builder Query',
          filters: query,
          is_favorite: false
        })
      });

      if (response.ok) {
        await loadSavedFilters();
      }
    } catch (error) {
      console.error('Failed to save query builder query:', error);
    }
  }, [loadSavedFilters]);

  const updateFilter = (key: keyof AdvancedSearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const addArrayFilter = (key: keyof AdvancedSearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: [...(prev[key] as string[] || []), value]
    }));
  };

  const removeArrayFilter = (key: keyof AdvancedSearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: (prev[key] as string[] || []).filter(item => item !== value)
    }));
  };

  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).some(key => {
      const value = filters[key as keyof AdvancedSearchFilters];
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== '';
    });
  }, [filters]);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderBasicSearch = () => (
    <div className="space-y-4">
      {/* Main Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search tasks, descriptions, comments..."
          value={filters.search_text || ''}
          onChange={(e) => updateFilter('search_text', e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="pl-10 pr-10"
        />
        {filters.search_text && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => updateFilter('search_text', '')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        
        {/* Search Suggestions */}
        {showSuggestions && searchSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border rounded-md shadow-lg">
            <div className="p-2">
              <div className="text-xs text-gray-500 mb-2">Recent searches</div>
              {searchSuggestions.slice(0, 5).map((suggestion, index) => (
                <div
                  key={index}
                  className="px-2 py-1 hover:bg-gray-100 rounded cursor-pointer text-sm"
                  onClick={() => {
                    updateFilter('search_text', suggestion.text);
                    setShowSuggestions(false);
                  }}
                >
                  {suggestion.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filters.status?.includes('in_progress') ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            const currentStatus = filters.status || [];
            const newStatus = currentStatus.includes('in_progress')
              ? currentStatus.filter(s => s !== 'in_progress')
              : [...currentStatus, 'in_progress'];
            updateFilter('status', newStatus);
          }}
        >
          <Clock className="w-3 h-3 mr-1" />
          In Progress
        </Button>
        
        <Button
          variant={filters.priority?.includes('high') ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            const currentPriority = filters.priority || [];
            const newPriority = currentPriority.includes('high')
              ? currentPriority.filter(p => p !== 'high')
              : [...currentPriority, 'high'];
            updateFilter('priority', newPriority);
          }}
        >
          <Zap className="w-3 h-3 mr-1" />
          High Priority
        </Button>
        
        <Button
          variant={filters.is_overdue ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateFilter('is_overdue', !filters.is_overdue)}
        >
          <Calendar className="w-3 h-3 mr-1" />
          Overdue
        </Button>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Active filters:</span>
          {filters.search_text && (
            <Badge variant="secondary" className="text-xs">
              Search: "{filters.search_text}"
            </Badge>
          )}
          {filters.status?.map(status => (
            <Badge key={status} variant="secondary" className="text-xs">
              Status: {status}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer" 
                onClick={() => removeArrayFilter('status', status)}
              />
            </Badge>
          ))}
          {filters.priority?.map(priority => (
            <Badge key={priority} variant="secondary" className="text-xs">
              Priority: {priority}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer" 
                onClick={() => removeArrayFilter('priority', priority)}
              />
            </Badge>
          ))}
          {filters.is_overdue && (
            <Badge variant="secondary" className="text-xs">
              Overdue
              <X 
                className="w-3 h-3 ml-1 cursor-pointer" 
                onClick={() => updateFilter('is_overdue', false)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );

  const renderAdvancedFilters = () => (
    <div className="space-y-6">
      {/* Status and Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={filters.status?.[0] || ''}
            onValueChange={(value) => updateFilter('status', value ? [value as TaskStatus] : [])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              {Object.values(TaskStatus).map(status => (
                <SelectItem key={status} value={status}>
                  {status.replace('_', ' ').toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            value={filters.priority?.[0] || ''}
            onValueChange={(value) => updateFilter('priority', value ? [value as TaskPriority] : [])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Priorities</SelectItem>
              {Object.values(TaskPriority).map(priority => (
                <SelectItem key={priority} value={priority}>
                  {priority.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Task Type and Phase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Task Type</Label>
          <Select
            value={filters.type?.[0] || ''}
            onValueChange={(value) => updateFilter('type', value ? [value as TaskType] : [])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              {Object.values(TaskType).map(type => (
                <SelectItem key={type} value={type}>
                  {type.replace('_', ' ').toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Workflow Phase</Label>
          <Select
            value={filters.phase?.[0] || ''}
            onValueChange={(value) => updateFilter('phase', value ? [value as WorkflowPhase] : [])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select phase" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Phases</SelectItem>
              {Object.values(WorkflowPhase).map(phase => (
                <SelectItem key={phase} value={phase}>
                  {phase.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Created After</Label>
          <Input
            type="date"
            value={filters.created_after || ''}
            onChange={(e) => updateFilter('created_after', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Created Before</Label>
          <Input
            type="date"
            value={filters.created_before || ''}
            onChange={(e) => updateFilter('created_before', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Due After</Label>
          <Input
            type="date"
            value={filters.due_after || ''}
            onChange={(e) => updateFilter('due_after', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Due Before</Label>
          <Input
            type="date"
            value={filters.due_before || ''}
            onChange={(e) => updateFilter('due_before', e.target.value)}
          />
        </div>
      </div>

      {/* Advanced Options */}
      <div className="space-y-4">
        <Label>Advanced Options</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="has-subtasks"
              checked={filters.has_subtasks || false}
              onCheckedChange={(checked) => updateFilter('has_subtasks', checked)}
            />
            <Label htmlFor="has-subtasks">Has Subtasks</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="has-attachments"
              checked={filters.has_attachments || false}
              onCheckedChange={(checked) => updateFilter('has_attachments', checked)}
            />
            <Label htmlFor="has-attachments">Has Attachments</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="has-comments"
              checked={filters.has_comments || false}
              onCheckedChange={(checked) => updateFilter('has_comments', checked)}
            />
            <Label htmlFor="has-comments">Has Comments</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="case-sensitive"
              checked={filters.case_sensitive || false}
              onCheckedChange={(checked) => updateFilter('case_sensitive', checked)}
            />
            <Label htmlFor="case-sensitive">Case Sensitive</Label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSavedFilters = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Saved Filters</Label>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const name = prompt('Filter name:');
            if (name) {
              saveFilter(name);
            }
          }}
        >
          <Save className="w-4 h-4 mr-1" />
          Save Current
        </Button>
      </div>
      
      {savedFilters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {savedFilters.map(filter => (
            <div
              key={filter.id}
              className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
            >
              <div className="flex items-center space-x-2">
                {filter.is_favorite && <Star className="w-4 h-4 text-yellow-500" />}
                <div>
                  <div className="font-medium text-sm">{filter.name}</div>
                  {filter.description && (
                    <div className="text-xs text-gray-500">{filter.description}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applySavedFilter(filter)}
                >
                  Apply
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteSavedFilter(filter.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-4">
          No saved filters yet. Create your first filter to get started.
        </div>
      )}
    </div>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Advanced Search</CardTitle>
          <div className="flex items-center space-x-2">
            {enableQueryBuilder && (
              <Button
                variant={showQueryBuilder ? "default" : "outline"}
                size="sm"
                onClick={() => setShowQueryBuilder(!showQueryBuilder)}
              >
                <Filter className="w-4 h-4 mr-1" />
                Query Builder
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {isExpanded ? 'Less' : 'More'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={!hasActiveFilters}
            >
              Clear
            </Button>
            <Button
              onClick={handleSearch}
              disabled={isLoading}
            >
              <Search className="w-4 h-4 mr-1" />
              Search
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {showQueryBuilder ? (
          <QueryBuilder
            onQueryChange={(query) => {
              // Handle query changes if needed
            }}
            onExecute={handleQueryBuilderExecute}
            onSave={handleQueryBuilderSave}
          />
        ) : (
          <>
            {renderBasicSearch()}
            
            {isExpanded && (
              <>
                <Separator />
                {renderAdvancedFilters()}
                <Separator />
                {renderSavedFilters()}
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default AdvancedSearch;
