/**
 * Hero Tasks - Advanced Search Engine
 * HT-004.1.2: Advanced search and filtering implementation
 * Created: 2025-01-27T16:00:00.000Z
 * Version: 1.0.0
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TaskSearchFilters,
  TaskSearchRequest,
  TaskSearchResult,
  SearchSuggestion,
  SavedSearch,
  SearchAnalytics,
  AdvancedSearchOptions,
  HeroTask
} from '@/types/hero-tasks';

// ============================================================================
// SEARCH ENGINE CONFIGURATION
// ============================================================================

const SEARCH_CONFIG = {
  debounceMs: 300,
  maxSuggestions: 10,
  maxRecentSearches: 20,
  maxSavedSearches: 50,
  fuzzyThreshold: 0.6,
  semanticThreshold: 0.7
};

// ============================================================================
// FUZZY SEARCH UTILITIES
// ============================================================================

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }
  
  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

function fuzzyMatch(query: string, text: string, threshold: number = SEARCH_CONFIG.fuzzyThreshold): boolean {
  if (!query || !text) return false;
  
  const normalizedQuery = query.toLowerCase().trim();
  const normalizedText = text.toLowerCase().trim();
  
  // Exact match
  if (normalizedText.includes(normalizedQuery)) return true;
  
  // Fuzzy match
  const distance = levenshteinDistance(normalizedQuery, normalizedText);
  const similarity = 1 - (distance / Math.max(normalizedQuery.length, normalizedText.length));
  
  return similarity >= threshold;
}

// ============================================================================
// SEARCH SUGGESTIONS ENGINE
// ============================================================================

function generateSearchSuggestions(
  query: string,
  recentSearches: string[],
  savedSearches: SavedSearch[],
  availableTags: string[],
  availableAssignees: string[]
): SearchSuggestion[] {
  const suggestions: SearchSuggestion[] = [];
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) {
    // Return recent searches and saved searches when no query
    recentSearches.slice(0, 5).forEach((search, index) => {
      suggestions.push({
        id: `recent-${index}`,
        text: search,
        type: 'recent',
        category: 'Recent Searches'
      });
    });
    
    savedSearches.slice(0, 5).forEach((search) => {
      suggestions.push({
        id: `saved-${search.id}`,
        text: search.name,
        type: 'saved',
        category: 'Saved Searches'
      });
    });
    
    return suggestions.slice(0, SEARCH_CONFIG.maxSuggestions);
  }
  
  // Filter recent searches
  recentSearches.forEach((search, index) => {
    if (fuzzyMatch(normalizedQuery, search)) {
      suggestions.push({
        id: `recent-${index}`,
        text: search,
        type: 'recent',
        category: 'Recent Searches'
      });
    }
  });
  
  // Filter saved searches
  savedSearches.forEach((search) => {
    if (fuzzyMatch(normalizedQuery, search.name) || fuzzyMatch(normalizedQuery, search.query)) {
      suggestions.push({
        id: `saved-${search.id}`,
        text: search.name,
        type: 'saved',
        category: 'Saved Searches'
      });
    }
  });
  
  // Filter tags
  availableTags.forEach((tag) => {
    if (fuzzyMatch(normalizedQuery, tag)) {
      suggestions.push({
        id: `tag-${tag}`,
        text: `tag:${tag}`,
        type: 'filter',
        category: 'Tags'
      });
    }
  });
  
  // Filter assignees
  availableAssignees.forEach((assignee) => {
    if (fuzzyMatch(normalizedQuery, assignee)) {
      suggestions.push({
        id: `assignee-${assignee}`,
        text: `assignee:${assignee}`,
        type: 'filter',
        category: 'Assignees'
      });
    }
  });
  
  return suggestions.slice(0, SEARCH_CONFIG.maxSuggestions);
}

// ============================================================================
// ADVANCED SEARCH HOOK
// ============================================================================

export interface UseAdvancedSearchOptions {
  initialQuery?: string;
  initialFilters?: TaskSearchFilters;
  enableSuggestions?: boolean;
  enableAnalytics?: boolean;
  userId?: string;
}

export interface UseAdvancedSearchReturn {
  // Search state
  query: string;
  filters: TaskSearchFilters;
  suggestions: SearchSuggestion[];
  recentSearches: string[];
  savedSearches: SavedSearch[];
  
  // Search actions
  setQuery: (query: string) => void;
  setFilters: (filters: TaskSearchFilters) => void;
  updateFilter: (key: keyof TaskSearchFilters, value: any) => void;
  clearFilters: () => void;
  clearQuery: () => void;
  
  // Search execution
  executeSearch: (options?: AdvancedSearchOptions) => Promise<TaskSearchResult>;
  searchWithSuggestion: (suggestion: SearchSuggestion) => Promise<TaskSearchResult>;
  
  // Saved searches
  saveSearch: (name: string, isPublic?: boolean) => Promise<void>;
  deleteSavedSearch: (id: string) => Promise<void>;
  loadSavedSearch: (id: string) => Promise<void>;
  
  // Search analytics
  getSearchAnalytics: () => Promise<SearchAnalytics[]>;
  
  // UI state
  isSearching: boolean;
  lastSearchResult: TaskSearchResult | null;
  searchError: string | null;
}

export function useAdvancedSearch(options: UseAdvancedSearchOptions = {}): UseAdvancedSearchReturn {
  const {
    initialQuery = '',
    initialFilters = {},
    enableSuggestions = true,
    enableAnalytics = true,
    userId
  } = options;
  
  // Search state
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<TaskSearchFilters>(initialFilters);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  
  // Search execution state
  const [isSearching, setIsSearching] = useState(false);
  const [lastSearchResult, setLastSearchResult] = useState<TaskSearchResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Load initial data
  useEffect(() => {
    loadRecentSearches();
    loadSavedSearches();
  }, []);
  
  // Generate suggestions when query changes
  useEffect(() => {
    if (enableSuggestions && query !== undefined) {
      generateSuggestions();
    }
  }, [query, recentSearches, savedSearches]);
  
  // Load recent searches from localStorage
  const loadRecentSearches = useCallback(() => {
    try {
      const stored = localStorage.getItem('hero-tasks-recent-searches');
      if (stored) {
        const searches = JSON.parse(stored);
        setRecentSearches(searches.slice(0, SEARCH_CONFIG.maxRecentSearches));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  }, []);
  
  // Save recent searches to localStorage
  const saveRecentSearches = useCallback((searches: string[]) => {
    try {
      localStorage.setItem('hero-tasks-recent-searches', JSON.stringify(searches));
    } catch (error) {
      console.error('Failed to save recent searches:', error);
    }
  }, []);
  
  // Load saved searches from API
  const loadSavedSearches = useCallback(async () => {
    try {
      const response = await fetch('/api/hero-tasks/saved-searches');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSavedSearches(result.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to load saved searches:', error);
    }
  }, []);
  
  // Generate search suggestions
  const generateSuggestions = useCallback(async () => {
    try {
      // Get available tags and assignees for suggestions
      const response = await fetch('/api/hero-tasks/suggestions');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const { tags = [], assignees = [] } = result.data;
          const newSuggestions = generateSearchSuggestions(
            query,
            recentSearches,
            savedSearches,
            tags,
            assignees
          );
          setSuggestions(newSuggestions);
        }
      }
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    }
  }, [query, recentSearches, savedSearches]);
  
  // Update a specific filter
  const updateFilter = useCallback((key: keyof TaskSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);
  
  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);
  
  // Clear search query
  const clearQuery = useCallback(() => {
    setQuery('');
  }, []);
  
  // Execute search
  const executeSearch = useCallback(async (searchOptions?: AdvancedSearchOptions): Promise<TaskSearchResult> => {
    setIsSearching(true);
    setSearchError(null);
    
    try {
      const searchRequest: TaskSearchRequest = {
        filters: { ...filters, search_text: query },
        search_options: searchOptions,
        include_suggestions: enableSuggestions,
        page: 1,
        page_size: 20
      };
      
      const response = await fetch('/api/hero-tasks/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchRequest),
      });
      
      if (!response.ok) {
        throw new Error('Search request failed');
      }
      
      const result: TaskSearchResult = await response.json();
      
      if (result.success) {
        setLastSearchResult(result);
        
        // Add to recent searches
        if (query.trim()) {
          const newRecentSearches = [query.trim(), ...recentSearches.filter(s => s !== query.trim())];
          setRecentSearches(newRecentSearches.slice(0, SEARCH_CONFIG.maxRecentSearches));
          saveRecentSearches(newRecentSearches);
        }
        
        // Track analytics
        if (enableAnalytics) {
          trackSearchAnalytics(query, filters, result);
        }
        
        return result;
      } else {
        throw new Error(result.error || 'Search failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      setSearchError(errorMessage);
      throw error;
    } finally {
      setIsSearching(false);
    }
  }, [query, filters, enableSuggestions, enableAnalytics, recentSearches, saveRecentSearches]);
  
  // Search with suggestion
  const searchWithSuggestion = useCallback(async (suggestion: SearchSuggestion): Promise<TaskSearchResult> => {
    if (suggestion.type === 'saved') {
      const savedSearch = savedSearches.find(s => s.id === suggestion.id);
      if (savedSearch) {
        setQuery(savedSearch.query);
        setFilters(savedSearch.filters);
        return executeSearch();
      }
    } else if (suggestion.type === 'filter') {
      // Handle filter suggestions like "tag:urgent" or "assignee:john"
      const [filterType, filterValue] = suggestion.text.split(':');
      if (filterType === 'tag') {
        updateFilter('tags', [...(filters.tags || []), filterValue]);
      } else if (filterType === 'assignee') {
        updateFilter('assignee_id', [...(filters.assignee_id || []), filterValue]);
      }
      return executeSearch();
    } else {
      setQuery(suggestion.text);
      return executeSearch();
    }
    
    throw new Error('Invalid suggestion type');
  }, [savedSearches, executeSearch, filters, updateFilter]);
  
  // Save search
  const saveSearch = useCallback(async (name: string, isPublic: boolean = false) => {
    try {
      const savedSearch: Omit<SavedSearch, 'id' | 'created_at' | 'updated_at'> = {
        name,
        query,
        filters,
        is_public: isPublic,
        created_by: userId
      };
      
      const response = await fetch('/api/hero-tasks/saved-searches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(savedSearch),
      });
      
      if (response.ok) {
        await loadSavedSearches();
      } else {
        throw new Error('Failed to save search');
      }
    } catch (error) {
      console.error('Failed to save search:', error);
      throw error;
    }
  }, [query, filters, userId, loadSavedSearches]);
  
  // Delete saved search
  const deleteSavedSearch = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/hero-tasks/saved-searches/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await loadSavedSearches();
      } else {
        throw new Error('Failed to delete saved search');
      }
    } catch (error) {
      console.error('Failed to delete saved search:', error);
      throw error;
    }
  }, [loadSavedSearches]);
  
  // Load saved search
  const loadSavedSearch = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/hero-tasks/saved-searches/${id}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const savedSearch = result.data;
          setQuery(savedSearch.query);
          setFilters(savedSearch.filters);
        }
      } else {
        throw new Error('Failed to load saved search');
      }
    } catch (error) {
      console.error('Failed to load saved search:', error);
      throw error;
    }
  }, []);
  
  // Track search analytics
  const trackSearchAnalytics = useCallback(async (
    searchQuery: string,
    searchFilters: TaskSearchFilters,
    result: TaskSearchResult
  ) => {
    try {
      const analytics: SearchAnalytics = {
        query: searchQuery,
        filters: searchFilters,
        result_count: result.data?.total_count || 0,
        search_time_ms: 0, // Would be calculated in real implementation
        user_id: userId,
        timestamp: new Date().toISOString()
      };
      
      await fetch('/api/hero-tasks/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analytics),
      });
    } catch (error) {
      console.error('Failed to track search analytics:', error);
    }
  }, [userId]);
  
  // Get search analytics
  const getSearchAnalytics = useCallback(async (): Promise<SearchAnalytics[]> => {
    try {
      const response = await fetch('/api/hero-tasks/analytics');
      if (response.ok) {
        const result = await response.json();
        return result.success ? result.data : [];
      }
      return [];
    } catch (error) {
      console.error('Failed to get search analytics:', error);
      return [];
    }
  }, []);
  
  return {
    // Search state
    query,
    filters,
    suggestions,
    recentSearches,
    savedSearches,
    
    // Search actions
    setQuery,
    setFilters,
    updateFilter,
    clearFilters,
    clearQuery,
    
    // Search execution
    executeSearch,
    searchWithSuggestion,
    
    // Saved searches
    saveSearch,
    deleteSavedSearch,
    loadSavedSearch,
    
    // Search analytics
    getSearchAnalytics,
    
    // UI state
    isSearching,
    lastSearchResult,
    searchError
  };
}

export default useAdvancedSearch;
