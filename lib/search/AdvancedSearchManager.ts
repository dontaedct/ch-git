/**
 * Advanced Search System for Hero Tasks
 * Created: 2025-09-08T15:40:02.000Z
 * Version: 1.0.0
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/card';
import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { Badge } from '@ui/badge';
import { Checkbox } from '@ui/checkbox';
import { Label } from '@ui/label';
import { 
  Search, 
  Filter, 
  X, 
  Save, 
  Bookmark, 
  Calendar,
  User,
  Tag,
  Clock,
  Star,
  SortAsc,
  SortDesc,
  MoreHorizontal
} from 'lucide-react';
import { HeroTask, TaskStatus, TaskPriority, TaskType, WorkflowPhase } from '@/types/hero-tasks';

// Search filter interface
export interface SearchFilters {
  // Text search
  searchText: string;
  
  // Basic filters
  status: TaskStatus[];
  priority: TaskPriority[];
  type: TaskType[];
  phase: WorkflowPhase[];
  
  // Advanced filters
  assignee: string[];
  tags: string[];
  dateRange: {
    start?: string;
    end?: string;
  };
  durationRange: {
    min?: number;
    max?: number;
  };
  
  // Sorting
  sortBy: 'created_at' | 'updated_at' | 'due_date' | 'priority' | 'title';
  sortOrder: 'asc' | 'desc';
  
  // Additional options
  includeCompleted: boolean;
  includeArchived: boolean;
  onlyMyTasks: boolean;
}

// Saved filter interface
export interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  filters: SearchFilters;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Search result interface
export interface SearchResult {
  tasks: HeroTask[];
  totalCount: number;
  hasMore: boolean;
  searchTime: number;
  filters: SearchFilters;
}

// Default search filters
const defaultFilters: SearchFilters = {
  searchText: '',
  status: [],
  priority: [],
  type: [],
  phase: [],
  assignee: [],
  tags: [],
  dateRange: {},
  durationRange: {},
  sortBy: 'updated_at',
  sortOrder: 'desc',
  includeCompleted: true,
  includeArchived: false,
  onlyMyTasks: false
};

// Search operators for advanced queries
export enum SearchOperator {
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT'
}

// Search field types
export enum SearchField {
  TITLE = 'title',
  DESCRIPTION = 'description',
  TAGS = 'tags',
  ASSIGNEE = 'assignee',
  ALL = 'all'
}

class AdvancedSearchManager {
  private savedFilters: SavedFilter[] = [];
  private searchHistory: string[] = [];

  constructor() {
    this.loadSavedFilters();
    this.loadSearchHistory();
  }

  // Full-text search implementation
  searchTasks(tasks: HeroTask[], filters: SearchFilters): SearchResult {
    const startTime = Date.now();
    
    let filteredTasks = [...tasks];

    // Apply text search
    if (filters.searchText.trim()) {
      filteredTasks = this.applyTextSearch(filteredTasks, filters.searchText);
    }

    // Apply status filter
    if (filters.status.length > 0) {
      filteredTasks = filteredTasks.filter(task => 
        filters.status.includes(task.status as TaskStatus)
      );
    }

    // Apply priority filter
    if (filters.priority.length > 0) {
      filteredTasks = filteredTasks.filter(task => 
        filters.priority.includes(task.priority as TaskPriority)
      );
    }

    // Apply type filter
    if (filters.type.length > 0) {
      filteredTasks = filteredTasks.filter(task => 
        filters.type.includes(task.type as TaskType)
      );
    }

    // Apply phase filter
    if (filters.phase.length > 0) {
      filteredTasks = filteredTasks.filter(task => 
        filters.phase.includes(task.current_phase as WorkflowPhase)
      );
    }

    // Apply assignee filter
    if (filters.assignee.length > 0) {
      filteredTasks = filteredTasks.filter(task => 
        filters.assignee.includes(task.assignee_id || '')
      );
    }

    // Apply tags filter
    if (filters.tags.length > 0) {
      filteredTasks = filteredTasks.filter(task => 
        filters.tags.some(tag => task.tags.includes(tag))
      );
    }

    // Apply date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      filteredTasks = filteredTasks.filter(task => {
        const taskDate = new Date(task.due_date || task.created_at);
        const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
        const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
        
        if (startDate && taskDate < startDate) return false;
        if (endDate && taskDate > endDate) return false;
        return true;
      });
    }

    // Apply duration range filter
    if (filters.durationRange.min !== undefined || filters.durationRange.max !== undefined) {
      filteredTasks = filteredTasks.filter(task => {
        const duration = task.estimated_duration_hours || 0;
        if (filters.durationRange.min !== undefined && duration < filters.durationRange.min) return false;
        if (filters.durationRange.max !== undefined && duration > filters.durationRange.max) return false;
        return true;
      });
    }

    // Apply completion filter
    if (!filters.includeCompleted) {
      filteredTasks = filteredTasks.filter(task => task.status !== 'completed');
    }

    // Apply archived filter
    if (!filters.includeArchived) {
      filteredTasks = filteredTasks.filter(task => task.status !== 'cancelled');
    }

    // Apply my tasks filter
    if (filters.onlyMyTasks) {
      const currentUserId = 'current-user'; // TODO: Get from auth context
      filteredTasks = filteredTasks.filter(task => task.assignee_id === currentUserId);
    }

    // Sort results
    filteredTasks = this.sortTasks(filteredTasks, filters.sortBy, filters.sortOrder);

    const searchTime = Date.now() - startTime;

    return {
      tasks: filteredTasks,
      totalCount: filteredTasks.length,
      hasMore: false,
      searchTime,
      filters
    };
  }

  // Text search implementation with field-specific search
  private applyTextSearch(tasks: HeroTask[], searchText: string): HeroTask[] {
    const query = searchText.toLowerCase().trim();
    if (!query) return tasks;

    return tasks.filter(task => {
      // Search in title
      if (task.title.toLowerCase().includes(query)) return true;
      
      // Search in description
      if (task.description && task.description.toLowerCase().includes(query)) return true;
      
      // Search in tags
      if (task.tags.some(tag => tag.toLowerCase().includes(query))) return true;
      
      // Search in task number
      if (task.task_number.toLowerCase().includes(query)) return true;
      
      // Search in assignee
      if (task.assignee_id && task.assignee_id.toLowerCase().includes(query)) return true;
      
      return false;
    });
  }

  // Sort tasks by specified field and order
  private sortTasks(tasks: HeroTask[], sortBy: string, sortOrder: 'asc' | 'desc'): HeroTask[] {
    return tasks.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at);
          bValue = new Date(b.updated_at);
          break;
        case 'due_date':
          aValue = a.due_date ? new Date(a.due_date) : new Date('9999-12-31');
          bValue = b.due_date ? new Date(b.due_date) : new Date('9999-12-31');
          break;
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default:
          aValue = new Date(a.updated_at);
          bValue = new Date(b.updated_at);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }

  // Save filter functionality
  saveFilter(name: string, description: string, filters: SearchFilters): SavedFilter {
    const savedFilter: SavedFilter = {
      id: `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      filters: { ...filters },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.savedFilters.push(savedFilter);
    this.saveSavedFilters();
    return savedFilter;
  }

  // Load saved filters
  getSavedFilters(): SavedFilter[] {
    return [...this.savedFilters];
  }

  // Delete saved filter
  deleteSavedFilter(id: string): boolean {
    const index = this.savedFilters.findIndex(filter => filter.id === id);
    if (index !== -1) {
      this.savedFilters.splice(index, 1);
      this.saveSavedFilters();
      return true;
    }
    return false;
  }

  // Apply saved filter
  applySavedFilter(id: string): SearchFilters | null {
    const savedFilter = this.savedFilters.find(filter => filter.id === id);
    return savedFilter ? { ...savedFilter.filters } : null;
  }

  // Search history management
  addToSearchHistory(query: string): void {
    if (query.trim() && !this.searchHistory.includes(query.trim())) {
      this.searchHistory.unshift(query.trim());
      this.searchHistory = this.searchHistory.slice(0, 10); // Keep only last 10
      this.saveSearchHistory();
    }
  }

  getSearchHistory(): string[] {
    return [...this.searchHistory];
  }

  clearSearchHistory(): void {
    this.searchHistory = [];
    this.saveSearchHistory();
  }

  // Local storage management
  private loadSavedFilters(): void {
    try {
      const stored = localStorage.getItem('hero-tasks-saved-filters');
      if (stored) {
        this.savedFilters = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load saved filters:', error);
      this.savedFilters = [];
    }
  }

  private saveSavedFilters(): void {
    try {
      localStorage.setItem('hero-tasks-saved-filters', JSON.stringify(this.savedFilters));
    } catch (error) {
      console.error('Failed to save filters:', error);
    }
  }

  private loadSearchHistory(): void {
    try {
      const stored = localStorage.getItem('hero-tasks-search-history');
      if (stored) {
        this.searchHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
      this.searchHistory = [];
    }
  }

  private saveSearchHistory(): void {
    try {
      localStorage.setItem('hero-tasks-search-history', JSON.stringify(this.searchHistory));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }
}

// Singleton instance
export const advancedSearchManager = new AdvancedSearchManager();

// React hook for advanced search
export function useAdvancedSearch(tasks: HeroTask[]) {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load saved filters and search history
  useEffect(() => {
    setSavedFilters(advancedSearchManager.getSavedFilters());
    setSearchHistory(advancedSearchManager.getSearchHistory());
  }, []);

  // Perform search
  const searchResult = useMemo(() => {
    if (isSearching) return null;
    return advancedSearchManager.searchTasks(tasks, filters);
  }, [tasks, filters, isSearching]);

  // Update filters
  const updateFilters = (updates: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  // Save current filter
  const saveCurrentFilter = (name: string, description: string) => {
    const savedFilter = advancedSearchManager.saveFilter(name, description, filters);
    setSavedFilters(advancedSearchManager.getSavedFilters());
    return savedFilter;
  };

  // Apply saved filter
  const applySavedFilter = (id: string) => {
    const savedFilters = advancedSearchManager.applySavedFilter(id);
    if (savedFilters) {
      setFilters(savedFilters);
    }
  };

  // Delete saved filter
  const deleteSavedFilter = (id: string) => {
    const success = advancedSearchManager.deleteSavedFilter(id);
    if (success) {
      setSavedFilters(advancedSearchManager.getSavedFilters());
    }
    return success;
  };

  // Add to search history
  const addToSearchHistory = (query: string) => {
    advancedSearchManager.addToSearchHistory(query);
    setSearchHistory(advancedSearchManager.getSearchHistory());
  };

  // Clear search history
  const clearSearchHistory = () => {
    advancedSearchManager.clearSearchHistory();
    setSearchHistory([]);
  };

  return {
    filters,
    searchResult,
    savedFilters,
    searchHistory,
    isSearching,
    updateFilters,
    resetFilters,
    saveCurrentFilter,
    applySavedFilter,
    deleteSavedFilter,
    addToSearchHistory,
    clearSearchHistory,
    setIsSearching
  };
}

export default AdvancedSearchManager;
