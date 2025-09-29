/**
 * @fileoverview Template Browser Component - HT-032.3.1
 * @module components/marketplace/template-browser
 * @author HT-032.3.1 - Template Marketplace Infrastructure & Discovery Platform
 * @version 1.0.0
 *
 * HT-032.3.1: Template Marketplace Infrastructure & Discovery Platform
 *
 * Template browsing component with grid/list views, filtering, sorting,
 * and template preview capabilities for the marketplace interface.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Grid, List, Filter, Search, Star, Download, Eye, Heart,
  ChevronLeft, ChevronRight, Loader2, SortAsc, SortDesc
} from 'lucide-react';
import { TemplateCard } from './template-card';
import { SearchFilters } from './search-filters';
import type { MarketplaceTemplate } from '@/lib/marketplace/discovery-platform';

export interface TemplateBrowserProps {
  templates: MarketplaceTemplate[];
  isLoading?: boolean;
  totalResults?: number;
  currentPage?: number;
  totalPages?: number;
  viewMode?: 'grid' | 'list';
  showFilters?: boolean;
  onSearch?: (query: string) => void;
  onFilter?: (filters: any) => void;
  onSort?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onPageChange?: (page: number) => void;
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  onTemplateSelect?: (template: MarketplaceTemplate) => void;
  onTemplatePreview?: (template: MarketplaceTemplate) => void;
  onTemplateFavorite?: (templateId: string) => void;
  className?: string;
}

export interface BrowserState {
  searchQuery: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  selectedTemplates: Set<string>;
  favoriteTemplates: Set<string>;
  previewTemplate: MarketplaceTemplate | null;
}

const initialState: BrowserState = {
  searchQuery: '',
  sortBy: 'popular',
  sortOrder: 'desc',
  selectedTemplates: new Set(),
  favoriteTemplates: new Set(),
  previewTemplate: null
};

export const TemplateBrowser: React.FC<TemplateBrowserProps> = ({
  templates = [],
  isLoading = false,
  totalResults = 0,
  currentPage = 1,
  totalPages = 1,
  viewMode = 'grid',
  showFilters = true,
  onSearch,
  onFilter,
  onSort,
  onPageChange,
  onViewModeChange,
  onTemplateSelect,
  onTemplatePreview,
  onTemplateFavorite,
  className = ''
}) => {
  const [state, setState] = useState<BrowserState>(initialState);

  const handleSearchChange = (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
    onSearch?.(query);
  };

  const handleSortChange = (sortBy: string) => {
    setState(prev => ({ ...prev, sortBy }));
    onSort?.(sortBy, state.sortOrder);
  };

  const handleSortOrderToggle = () => {
    const newOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
    setState(prev => ({ ...prev, sortOrder: newOrder }));
    onSort?.(state.sortBy, newOrder);
  };

  const handleTemplateSelect = (template: MarketplaceTemplate) => {
    setState(prev => ({
      ...prev,
      selectedTemplates: new Set(prev.selectedTemplates).add(template.id)
    }));
    onTemplateSelect?.(template);
  };

  const handleTemplatePreview = (template: MarketplaceTemplate) => {
    setState(prev => ({ ...prev, previewTemplate: template }));
    onTemplatePreview?.(template);
  };

  const handleTemplateFavorite = (templateId: string) => {
    setState(prev => {
      const newFavorites = new Set(prev.favoriteTemplates);
      if (newFavorites.has(templateId)) {
        newFavorites.delete(templateId);
      } else {
        newFavorites.add(templateId);
      }
      return { ...prev, favoriteTemplates: newFavorites };
    });
    onTemplateFavorite?.(templateId);
  };

  const renderToolbar = () => (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search templates..."
            value={state.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Sort Controls */}
        <Select value={state.sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSortOrderToggle}
          className="px-2"
        >
          {state.sortOrder === 'asc' ? (
            <SortAsc className="w-4 h-4" />
          ) : (
            <SortDesc className="w-4 h-4" />
          )}
        </Button>

        {/* View Mode Toggle */}
        <div className="flex border rounded-md">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange?.('grid')}
            className="px-2"
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange?.('list')}
            className="px-2"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>

        {/* Filters Toggle */}
        {showFilters && (
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        )}
      </div>
    </div>
  );

  const renderResultsHeader = () => (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-lg font-semibold">
          {state.searchQuery ? 'Search Results' : 'All Templates'}
        </h2>
        {totalResults > 0 && (
          <p className="text-sm text-muted-foreground">
            Showing {templates.length} of {totalResults.toLocaleString()} templates
            {state.searchQuery && (
              <span> for "{state.searchQuery}"</span>
            )}
          </p>
        )}
      </div>
    </div>
  );

  const renderTemplateGrid = () => (
    <div className={`grid gap-6 ${
      viewMode === 'grid' 
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
        : 'grid-cols-1'
    }`}>
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          viewMode={viewMode}
          isSelected={state.selectedTemplates.has(template.id)}
          isFavorite={state.favoriteTemplates.has(template.id)}
          onSelect={() => handleTemplateSelect(template)}
          onPreview={() => handleTemplatePreview(template)}
          onFavorite={() => handleTemplateFavorite(template.id)}
          className="hover:shadow-lg transition-shadow duration-200"
        />
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <Card className="p-12 text-center">
      <div className="space-y-4">
        <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
          <Search className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            {state.searchQuery ? 'No templates found' : 'No templates available'}
          </h3>
          <p className="text-muted-foreground">
            {state.searchQuery 
              ? `Try adjusting your search terms or filters to find what you're looking for.`
              : 'Check back later for new templates.'
            }
          </p>
        </div>
        {state.searchQuery && (
          <Button variant="outline" onClick={() => handleSearchChange('')}>
            Clear Search
          </Button>
        )}
      </div>
    </Card>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex gap-1">
          {startPage > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(1)}
              >
                1
              </Button>
              {startPage > 2 && (
                <span className="px-2 py-1 text-muted-foreground">...</span>
              )}
            </>
          )}

          {pages.map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange?.(page)}
            >
              {page}
            </Button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="px-2 py-1 text-muted-foreground">...</span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(totalPages)}
              >
                {totalPages}
              </Button>
            </>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  const renderLoadingState = () => (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p>Loading templates...</p>
      </div>
    </div>
  );

  return (
    <div className={`template-browser ${className}`}>
      {renderToolbar()}
      
      {isLoading ? (
        renderLoadingState()
      ) : (
        <>
          {templates.length > 0 ? (
            <>
              {renderResultsHeader()}
              {renderTemplateGrid()}
              {renderPagination()}
            </>
          ) : (
            renderEmptyState()
          )}
        </>
      )}
    </div>
  );
};

export default TemplateBrowser;
