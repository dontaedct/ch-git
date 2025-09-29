/**
 * @fileoverview Search Filters Component - HT-032.3.1
 * @module components/marketplace/search-filters
 * @author HT-032.3.1 - Template Marketplace Infrastructure & Discovery Platform
 * @version 1.0.0
 *
 * HT-032.3.1: Template Marketplace Infrastructure & Discovery Platform
 *
 * Advanced search filters component with faceted filtering, range sliders,
 * checkboxes, and filter management for the template marketplace.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  X, Filter, Star, DollarSign, Calendar, User, Tag, 
  ChevronDown, ChevronUp, Save, RotateCcw
} from 'lucide-react';

export interface FilterOptions {
  categories: Array<{ name: string; count: number }>;
  tags: Array<{ name: string; count: number }>;
  authors: Array<{ name: string; count: number }>;
  ratings: Array<{ rating: number; count: number }>;
  priceRanges: Array<{ range: string; count: number }>;
  complexity: Array<{ level: string; count: number }>;
  industries: Array<{ name: string; count: number }>;
}

export interface FilterValues {
  categories: string[];
  tags: string[];
  priceRange: [number, number];
  rating: number;
  complexity: string[];
  industries: string[];
  authors: string[];
  lastUpdated: string;
  isFree: boolean | null;
  isFeatured: boolean | null;
  isPopular: boolean | null;
}

export interface SearchFiltersProps {
  options: FilterOptions;
  values: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  onSaveFilters?: (name: string, filters: FilterValues) => void;
  onLoadFilters?: (filters: FilterValues) => void;
  onClearFilters?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

const initialValues: FilterValues = {
  categories: [],
  tags: [],
  priceRange: [0, 500],
  rating: 0,
  complexity: [],
  industries: [],
  authors: [],
  lastUpdated: '',
  isFree: null,
  isFeatured: null,
  isPopular: null
};

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  options,
  values = initialValues,
  onFiltersChange,
  onSaveFilters,
  onLoadFilters,
  onClearFilters,
  isCollapsed = false,
  onToggleCollapse,
  className = ''
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['categories', 'price', 'rating'])
  );
  const [saveFilterName, setSaveFilterName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const updateFilter = <K extends keyof FilterValues>(
    key: K,
    value: FilterValues[K]
  ) => {
    const newFilters = { ...values, [key]: value };
    onFiltersChange(newFilters);
  };

  const toggleArrayFilter = (
    key: keyof Pick<FilterValues, 'categories' | 'tags' | 'complexity' | 'industries' | 'authors'>,
    value: string
  ) => {
    const currentArray = values[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const hasActiveFilters = (): boolean => {
    return (
      values.categories.length > 0 ||
      values.tags.length > 0 ||
      values.priceRange[0] > 0 || values.priceRange[1] < 500 ||
      values.rating > 0 ||
      values.complexity.length > 0 ||
      values.industries.length > 0 ||
      values.authors.length > 0 ||
      values.lastUpdated !== '' ||
      values.isFree !== null ||
      values.isFeatured !== null ||
      values.isPopular !== null
    );
  };

  const getActiveFilterCount = (): number => {
    let count = 0;
    if (values.categories.length > 0) count++;
    if (values.tags.length > 0) count++;
    if (values.priceRange[0] > 0 || values.priceRange[1] < 500) count++;
    if (values.rating > 0) count++;
    if (values.complexity.length > 0) count++;
    if (values.industries.length > 0) count++;
    if (values.authors.length > 0) count++;
    if (values.lastUpdated !== '') count++;
    if (values.isFree !== null) count++;
    if (values.isFeatured !== null) count++;
    if (values.isPopular !== null) count++;
    return count;
  };

  const handleSaveFilters = () => {
    if (saveFilterName.trim() && onSaveFilters) {
      onSaveFilters(saveFilterName.trim(), values);
      setSaveFilterName('');
      setShowSaveDialog(false);
    }
  };

  const renderFilterSection = (
    title: string,
    icon: React.ReactNode,
    sectionKey: string,
    content: React.ReactNode,
    badge?: number
  ) => (
    <div className="space-y-2">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="flex items-center justify-between w-full text-left p-2 hover:bg-muted/50 rounded-md transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium">{title}</span>
          {badge !== undefined && badge > 0 && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        {expandedSections.has(sectionKey) ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      
      {expandedSections.has(sectionKey) && (
        <div className="pl-4 space-y-3">
          {content}
        </div>
      )}
    </div>
  );

  const renderCheckboxList = (
    items: Array<{ name: string; count: number }>,
    selectedValues: string[],
    onToggle: (value: string) => void,
    maxVisible: number = 8
  ) => {
    const [showAll, setShowAll] = useState(false);
    const visibleItems = showAll ? items : items.slice(0, maxVisible);

    return (
      <div className="space-y-2">
        {visibleItems.map((item) => (
          <div key={item.name} className="flex items-center space-x-2">
            <Checkbox
              id={`filter-${item.name}`}
              checked={selectedValues.includes(item.name)}
              onCheckedChange={() => onToggle(item.name)}
            />
            <Label 
              htmlFor={`filter-${item.name}`} 
              className="flex-1 cursor-pointer text-sm"
            >
              {item.name}
              <span className="text-muted-foreground ml-2">({item.count})</span>
            </Label>
          </div>
        ))}
        
        {items.length > maxVisible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="text-xs"
          >
            {showAll ? 'Show Less' : `Show ${items.length - maxVisible} More`}
          </Button>
        )}
      </div>
    );
  };

  const renderActiveFilters = () => {
    const activeFilters: Array<{ label: string; onRemove: () => void }> = [];

    // Categories
    values.categories.forEach(category => {
      activeFilters.push({
        label: `Category: ${category}`,
        onRemove: () => toggleArrayFilter('categories', category)
      });
    });

    // Tags
    values.tags.forEach(tag => {
      activeFilters.push({
        label: `Tag: ${tag}`,
        onRemove: () => toggleArrayFilter('tags', tag)
      });
    });

    // Price range
    if (values.priceRange[0] > 0 || values.priceRange[1] < 500) {
      activeFilters.push({
        label: `Price: $${values.priceRange[0]} - $${values.priceRange[1]}`,
        onRemove: () => updateFilter('priceRange', [0, 500])
      });
    }

    // Rating
    if (values.rating > 0) {
      activeFilters.push({
        label: `Rating: ${values.rating}+ stars`,
        onRemove: () => updateFilter('rating', 0)
      });
    }

    // Other filters...
    if (values.lastUpdated) {
      const labels: Record<string, string> = {
        '1d': 'Last 24 hours',
        '7d': 'Last week',
        '30d': 'Last month',
        '90d': 'Last 3 months'
      };
      activeFilters.push({
        label: `Updated: ${labels[values.lastUpdated]}`,
        onRemove: () => updateFilter('lastUpdated', '')
      });
    }

    if (values.isFree === true) {
      activeFilters.push({
        label: 'Free only',
        onRemove: () => updateFilter('isFree', null)
      });
    }

    if (values.isFeatured === true) {
      activeFilters.push({
        label: 'Featured only',
        onRemove: () => updateFilter('isFeatured', null)
      });
    }

    if (values.isPopular === true) {
      activeFilters.push({
        label: 'Popular only',
        onRemove: () => updateFilter('isPopular', null)
      });
    }

    if (activeFilters.length === 0) return null;

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">Active Filters</Label>
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
              onClick={filter.onRemove}
            >
              {filter.label}
              <X className="w-3 h-3 ml-1" />
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  if (isCollapsed) {
    return (
      <Button
        variant="outline"
        onClick={onToggleCollapse}
        className={className}
      >
        <Filter className="w-4 h-4 mr-2" />
        Filters
        {hasActiveFilters() && (
          <Badge variant="secondary" className="ml-2">
            {getActiveFilterCount()}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Card className={`search-filters ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <CardTitle className="text-lg">Filters</CardTitle>
            {hasActiveFilters() && (
              <Badge variant="secondary">
                {getActiveFilterCount()}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSaveDialog(true)}
              disabled={!hasActiveFilters()}
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              disabled={!hasActiveFilters()}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear
            </Button>
            {onToggleCollapse && (
              <Button variant="ghost" size="sm" onClick={onToggleCollapse}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Active Filters */}
        {hasActiveFilters() && (
          <>
            {renderActiveFilters()}
            <Separator />
          </>
        )}

        {/* Categories */}
        {renderFilterSection(
          'Categories',
          <Tag className="w-4 h-4" />,
          'categories',
          renderCheckboxList(
            options.categories,
            values.categories,
            (value) => toggleArrayFilter('categories', value)
          ),
          values.categories.length
        )}

        <Separator />

        {/* Price Range */}
        {renderFilterSection(
          'Price Range',
          <DollarSign className="w-4 h-4" />,
          'price',
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>${values.priceRange[0]}</span>
              <span>${values.priceRange[1]}</span>
            </div>
            <Slider
              value={values.priceRange}
              onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
              max={500}
              step={10}
              className="w-full"
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id="free-only"
                checked={values.isFree === true}
                onCheckedChange={(checked) => updateFilter('isFree', checked ? true : null)}
              />
              <Label htmlFor="free-only" className="text-sm cursor-pointer">
                Free templates only
              </Label>
            </div>
          </div>
        )}

        <Separator />

        {/* Rating */}
        {renderFilterSection(
          'Minimum Rating',
          <Star className="w-4 h-4" />,
          'rating',
          <Select
            value={values.rating.toString()}
            onValueChange={(value) => updateFilter('rating', Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Any rating</SelectItem>
              <SelectItem value="1">1+ stars</SelectItem>
              <SelectItem value="2">2+ stars</SelectItem>
              <SelectItem value="3">3+ stars</SelectItem>
              <SelectItem value="4">4+ stars</SelectItem>
              <SelectItem value="5">5 stars only</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Separator />

        {/* Tags */}
        {options.tags.length > 0 && (
          <>
            {renderFilterSection(
              'Tags',
              <Tag className="w-4 h-4" />,
              'tags',
              renderCheckboxList(
                options.tags,
                values.tags,
                (value) => toggleArrayFilter('tags', value),
                10
              ),
              values.tags.length
            )}
            <Separator />
          </>
        )}

        {/* Last Updated */}
        {renderFilterSection(
          'Last Updated',
          <Calendar className="w-4 h-4" />,
          'updated',
          <Select
            value={values.lastUpdated}
            onValueChange={(value) => updateFilter('lastUpdated', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any time</SelectItem>
              <SelectItem value="1d">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last week</SelectItem>
              <SelectItem value="30d">Last month</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Separator />

        {/* Special Filters */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Special Filters</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured-only"
                checked={values.isFeatured === true}
                onCheckedChange={(checked) => updateFilter('isFeatured', checked ? true : null)}
              />
              <Label htmlFor="featured-only" className="text-sm cursor-pointer">
                Featured templates only
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="popular-only"
                checked={values.isPopular === true}
                onCheckedChange={(checked) => updateFilter('isPopular', checked ? true : null)}
              />
              <Label htmlFor="popular-only" className="text-sm cursor-pointer">
                Popular templates only
              </Label>
            </div>
          </div>
        </div>

        {/* Authors */}
        {options.authors.length > 0 && (
          <>
            <Separator />
            {renderFilterSection(
              'Authors',
              <User className="w-4 h-4" />,
              'authors',
              renderCheckboxList(
                options.authors,
                values.authors,
                (value) => toggleArrayFilter('authors', value),
                6
              ),
              values.authors.length
            )}
          </>
        )}
      </CardContent>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Save Filter Set</CardTitle>
              <CardDescription>
                Give your filter combination a name to save it for later use.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="filter-name">Filter Set Name</Label>
                <input
                  id="filter-name"
                  type="text"
                  value={saveFilterName}
                  onChange={(e) => setSaveFilterName(e.target.value)}
                  placeholder="e.g., SaaS Templates Under $100"
                  className="w-full px-3 py-2 border rounded-md"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveFilters()}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSaveDialog(false);
                    setSaveFilterName('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveFilters}
                  disabled={!saveFilterName.trim()}
                >
                  Save Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  );
};

export default SearchFilters;
