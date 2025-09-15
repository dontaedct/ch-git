/**
 * Hero Tasks - Advanced Search Bar Component
 * HT-004.1.2: Enhanced search input with suggestions and filters
 * Created: 2025-01-27T16:00:00.000Z
 * Version: 1.0.0
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  X, 
  Filter, 
  Clock, 
  Bookmark, 
  TrendingUp,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { useAdvancedSearch, UseAdvancedSearchReturn } from '@/hooks/useAdvancedSearch';
import { SearchSuggestion } from '@/types/hero-tasks';

interface AdvancedSearchBarProps {
  onSearch?: (query: string, filters: any) => void;
  placeholder?: string;
  className?: string;
  showFilters?: boolean;
  showSuggestions?: boolean;
  autoFocus?: boolean;
}

export function AdvancedSearchBar({
  onSearch,
  placeholder = "Search tasks...",
  className = "",
  showFilters = true,
  showSuggestions = true,
  autoFocus = false
}: AdvancedSearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const {
    query,
    filters,
    suggestions,
    recentSearches,
    savedSearches,
    setQuery,
    updateFilter,
    clearFilters,
    clearQuery,
    executeSearch,
    searchWithSuggestion,
    isSearching,
    searchError
  } = useAdvancedSearch({
    enableSuggestions: showSuggestions,
    enableAnalytics: true
  });

  // Handle input focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestionsPanel || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionClick(suggestions[selectedSuggestionIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestionsPanel(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // Handle search execution
  const handleSearch = async () => {
    try {
      const result = await executeSearch();
      onSearch?.(query, filters);
      setShowSuggestionsPanel(false);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = async (suggestion: SearchSuggestion) => {
    try {
      await searchWithSuggestion(suggestion);
      onSearch?.(query, filters);
      setShowSuggestionsPanel(false);
      setSelectedSuggestionIndex(-1);
    } catch (error) {
      console.error('Suggestion search failed:', error);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestionsPanel(value.length > 0 && showSuggestions);
    setSelectedSuggestionIndex(-1);
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (showSuggestions && (query.length > 0 || suggestions.length > 0)) {
      setShowSuggestionsPanel(true);
    }
  };

  // Handle input blur
  const handleInputBlur = (e: React.FocusEvent) => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestionsPanel(false);
        setSelectedSuggestionIndex(-1);
      }
    }, 150);
  };

  // Get suggestion icon
  const getSuggestionIcon = (suggestion: SearchSuggestion) => {
    switch (suggestion.type) {
      case 'recent':
        return <Clock className="w-4 h-4" />;
      case 'saved':
        return <Bookmark className="w-4 h-4" />;
      case 'suggestion':
        return <TrendingUp className="w-4 h-4" />;
      case 'filter':
        return <Filter className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  // Get active filters count
  const activeFiltersCount = Object.values(filters).filter(value => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== '';
  }).length;

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          ref={inputRef}
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-20"
          disabled={isSearching}
        />
        
        {/* Clear and Filter Buttons */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearQuery}
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
          
          {showFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="h-6 w-6 p-0"
            >
              <Filter className="w-3 h-3" />
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          )}
          
          {isSearching && (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          )}
        </div>
      </div>

      {/* Suggestions Panel */}
      {showSuggestionsPanel && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-y-auto">
          <CardContent className="p-0">
            <div ref={suggestionsRef} className="py-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 ${
                    index === selectedSuggestionIndex ? 'bg-gray-50' : ''
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="text-gray-400">
                    {getSuggestionIcon(suggestion)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {suggestion.text}
                    </div>
                    {suggestion.category && (
                      <div className="text-xs text-gray-500">
                        {suggestion.category}
                      </div>
                    )}
                  </div>
                  {suggestion.count && (
                    <Badge variant="secondary" className="text-xs">
                      {suggestion.count}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {searchError && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {searchError}
        </div>
      )}
    </div>
  );
}

export default AdvancedSearchBar;
