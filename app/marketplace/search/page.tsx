/**
 * @fileoverview Template Search and Filtering Interface - HT-032.3.1
 * @module app/marketplace/search/page
 * @author HT-032.3.1 - Template Marketplace Infrastructure & Discovery Platform
 * @version 1.0.0
 *
 * HT-032.3.1: Template Marketplace Infrastructure & Discovery Platform
 *
 * Advanced template search and filtering interface with faceted search,
 * saved searches, search history, and intelligent search suggestions.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Search, Filter, X, Save, Clock, TrendingUp, Star, 
  Download, Grid, List, SlidersHorizontal, Sparkles,
  ArrowUpDown, Calendar, DollarSign, Users
} from 'lucide-react';
import { MarketplaceSearchEngine } from '@/lib/marketplace/search-engine';
import type { TemplateSearchParams, TemplateSearchResult } from '@/lib/marketplace/search-engine';

interface SearchFilters {
  categories: string[];
  tags: string[];
  priceRange: [number, number];
  rating: number;
  complexity: string[];
  industries: string[];
  features: string[];
  authors: string[];
  lastUpdated: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  createdAt: Date;
}

interface SearchState {
  isLoading: boolean;
  query: string;
  filters: SearchFilters;
  results: TemplateSearchResult[];
  totalResults: number;
  currentPage: number;
  facets: SearchFacets;
  savedSearches: SavedSearch[];
  searchHistory: string[];
  suggestions: string[];
  viewMode: 'grid' | 'list';
  error: string | null;
}

interface SearchFacets {
  categories: Array<{ name: string; count: number }>;
  tags: Array<{ name: string; count: number }>;
  authors: Array<{ name: string; count: number }>;
  ratings: Array<{ rating: number; count: number }>;
  priceRanges: Array<{ range: string; count: number }>;
}

const initialFilters: SearchFilters = {
  categories: [],
  tags: [],
  priceRange: [0, 500],
  rating: 0,
  complexity: [],
  industries: [],
  features: [],
  authors: [],
  lastUpdated: '',
  sortBy: 'relevance',
  sortOrder: 'desc'
};

const initialState: SearchState = {
  isLoading: false,
  query: '',
  filters: initialFilters,
  results: [],
  totalResults: 0,
  currentPage: 1,
  facets: {
    categories: [],
    tags: [],
    authors: [],
    ratings: [],
    priceRanges: []
  },
  savedSearches: [],
  searchHistory: [],
  suggestions: [],
  viewMode: 'grid',
  error: null
};

export default function MarketplaceSearchPage() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<SearchState>(initialState);
  const [showFilters, setShowFilters] = useState(true);

  // Initialize search engine
  const searchEngine = new MarketplaceSearchEngine();

  useEffect(() => {
    // Initialize from URL parameters
    const initialQuery = searchParams.get('q') || '';
    const initialCategory = searchParams.get('category') || '';
    
    setState(prev => ({
      ...prev,
      query: initialQuery,
      filters: {
        ...prev.filters,
        categories: initialCategory ? [initialCategory] : []
      }
    }));

    // Load initial data
    loadSearchData();
  }, []);

  useEffect(() => {
    // Perform search when query or filters change
    if (state.query || hasActiveFilters()) {
      performSearch();
    }
  }, [state.query, state.filters]);

  const loadSearchData = async () => {
    try {
      const facets = await searchEngine.getFacets();
      const savedSearches = await searchEngine.getSavedSearches();
      const searchHistory = await searchEngine.getSearchHistory();
      
      setState(prev => ({
        ...prev,
        facets,
        savedSearches,
        searchHistory
      }));
    } catch (error) {
      console.error('Error loading search data:', error);
    }
  };

  const performSearch = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const searchParams: TemplateSearchParams = {
        query: state.query,
        filters: state.filters,
        page: state.currentPage,
        limit: 20
      };

      const results = await searchEngine.searchTemplates(searchParams);
      const suggestions = state.query ? await searchEngine.getSearchSuggestions(state.query) : [];

      setState(prev => ({
        ...prev,
        results: results.templates,
        totalResults: results.total,
        suggestions,
        isLoading: false
      }));

      // Save to search history
      if (state.query.trim()) {
        await searchEngine.addToSearchHistory(state.query);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Search failed',
        isLoading: false
      }));
    }
  };

  const hasActiveFilters = (): boolean => {
    const { filters } = state;
    return (
      filters.categories.length > 0 ||
      filters.tags.length > 0 ||
      filters.priceRange[0] > 0 || filters.priceRange[1] < 500 ||
      filters.rating > 0 ||
      filters.complexity.length > 0 ||
      filters.industries.length > 0 ||
      filters.features.length > 0 ||
      filters.authors.length > 0 ||
      filters.lastUpdated !== ''
    );
  };

  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, [key]: value },
      currentPage: 1 // Reset to first page when filters change
    }));
  };

  const toggleArrayFilter = (key: keyof Pick<SearchFilters, 'categories' | 'tags' | 'complexity' | 'industries' | 'features' | 'authors'>, value: string) => {
    setState(prev => {
      const currentArray = prev.filters[key] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      return {
        ...prev,
        filters: { ...prev.filters, [key]: newArray },
        currentPage: 1
      };
    });
  };

  const clearFilters = () => {
    setState(prev => ({
      ...prev,
      filters: initialFilters,
      currentPage: 1
    }));
  };

  const saveCurrentSearch = async () => {
    if (!state.query.trim()) return;

    const searchName = prompt('Enter a name for this search:');
    if (!searchName) return;

    try {
      const savedSearch: SavedSearch = {
        id: Date.now().toString(),
        name: searchName,
        query: state.query,
        filters: state.filters,
        createdAt: new Date()
      };

      await searchEngine.saveSearch(savedSearch);
      setState(prev => ({
        ...prev,
        savedSearches: [...prev.savedSearches, savedSearch]
      }));
    } catch (error) {
      console.error('Error saving search:', error);
    }
  };

  const loadSavedSearch = (savedSearch: SavedSearch) => {
    setState(prev => ({
      ...prev,
      query: savedSearch.query,
      filters: savedSearch.filters,
      currentPage: 1
    }));
  };

  const renderSearchBar = () => (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search templates, features, or keywords..."
            value={state.query}
            onChange={(e) => setState(prev => ({ ...prev, query: e.target.value }))}
            className="text-lg h-12"
          />
        </div>
        <Button size="lg" onClick={() => performSearch()}>
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
        <Button variant="outline" size="lg" onClick={() => setShowFilters(!showFilters)}>
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Search Suggestions */}
      {state.suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Suggestions:</span>
          {state.suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => setState(prev => ({ ...prev, query: suggestion }))}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      )}

      {/* Search History */}
      {state.searchHistory.length > 0 && !state.query && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            Recent searches:
          </div>
          <div className="flex flex-wrap gap-2">
            {state.searchHistory.slice(0, 5).map((historyItem, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => setState(prev => ({ ...prev, query: historyItem }))}
                className="text-muted-foreground hover:text-foreground"
              >
                {historyItem}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderFilters = () => (
    <Card className={`transition-all duration-200 ${showFilters ? 'block' : 'hidden'}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={saveCurrentSearch}>
              <Save className="w-4 h-4 mr-2" />
              Save Search
            </Button>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Categories */}
        <div>
          <Label className="text-base font-medium mb-3 block">Categories</Label>
          <div className="space-y-2">
            {state.facets.categories.map((category) => (
              <div key={category.name} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.name}`}
                  checked={state.filters.categories.includes(category.name)}
                  onCheckedChange={() => toggleArrayFilter('categories', category.name)}
                />
                <Label htmlFor={`category-${category.name}`} className="flex-1 cursor-pointer">
                  {category.name}
                  <span className="text-muted-foreground ml-2">({category.count})</span>
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <Label className="text-base font-medium mb-3 block">
            Price Range: ${state.filters.priceRange[0]} - ${state.filters.priceRange[1]}
          </Label>
          <Slider
            value={state.filters.priceRange}
            onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
            max={500}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-1">
            <span>Free</span>
            <span>$500+</span>
          </div>
        </div>

        {/* Rating */}
        <div>
          <Label className="text-base font-medium mb-3 block">Minimum Rating</Label>
          <Select
            value={state.filters.rating.toString()}
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
        </div>

        {/* Popular Tags */}
        <div>
          <Label className="text-base font-medium mb-3 block">Popular Tags</Label>
          <div className="flex flex-wrap gap-2">
            {state.facets.tags.slice(0, 10).map((tag) => (
              <Button
                key={tag.name}
                variant={state.filters.tags.includes(tag.name) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleArrayFilter('tags', tag.name)}
              >
                {tag.name}
                <span className="ml-2 text-xs">({tag.count})</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Last Updated */}
        <div>
          <Label className="text-base font-medium mb-3 block">Last Updated</Label>
          <Select
            value={state.filters.lastUpdated}
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
        </div>

        {/* Authors */}
        {state.facets.authors.length > 0 && (
          <div>
            <Label className="text-base font-medium mb-3 block">Authors</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {state.facets.authors.map((author) => (
                <div key={author.name} className="flex items-center space-x-2">
                  <Checkbox
                    id={`author-${author.name}`}
                    checked={state.filters.authors.includes(author.name)}
                    onCheckedChange={() => toggleArrayFilter('authors', author.name)}
                  />
                  <Label htmlFor={`author-${author.name}`} className="flex-1 cursor-pointer">
                    {author.name}
                    <span className="text-muted-foreground ml-2">({author.count})</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderSavedSearches = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Saved Searches</CardTitle>
        <CardDescription>Your previously saved search queries</CardDescription>
      </CardHeader>
      <CardContent>
        {state.savedSearches.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No saved searches yet. Save your current search to access it later.
          </p>
        ) : (
          <div className="space-y-2">
            {state.savedSearches.map((savedSearch) => (
              <div
                key={savedSearch.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => loadSavedSearch(savedSearch)}
              >
                <div>
                  <div className="font-medium">{savedSearch.name}</div>
                  <div className="text-sm text-muted-foreground">{savedSearch.query}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {savedSearch.createdAt.toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderResults = () => (
    <div className="space-y-4">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            Search Results
            {state.totalResults > 0 && (
              <span className="text-muted-foreground ml-2">
                ({state.totalResults.toLocaleString()} found)
              </span>
            )}
          </h2>
          {state.query && (
            <p className="text-muted-foreground">
              Results for "{state.query}"
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={state.filters.sortBy}
            onValueChange={(value) => updateFilter('sortBy', value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => updateFilter('sortOrder', state.filters.sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <ArrowUpDown className="w-4 h-4" />
          </Button>

          <div className="flex border rounded-md">
            <Button
              variant={state.viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setState(prev => ({ ...prev, viewMode: 'grid' }))}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={state.viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setState(prev => ({ ...prev, viewMode: 'list' }))}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      {state.results.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <Search className="w-16 h-16 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">No results found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
            </div>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </Card>
      ) : (
        <div className={`grid gap-6 ${
          state.viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {state.results.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                {template.thumbnail && (
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">{template.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{template.description}</CardDescription>
                  </div>
                  <div className="text-right">
                    {template.price === 0 ? (
                      <Badge variant="secondary">Free</Badge>
                    ) : (
                      <span className="font-bold">${template.price}</span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{template.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      <span>{template.downloads.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <Button className="w-full" asChild>
                    <a href={`/marketplace/template/${template.id}`}>
                      View Details
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Search className="w-6 h-6 text-white" />
          </div>
          Template Search
        </h1>
        <p className="text-muted-foreground">
          Find the perfect template with advanced search and filtering options.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {renderFilters()}
          {renderSavedSearches()}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {renderSearchBar()}
          
          {state.error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-600">{state.error}</p>
              </CardContent>
            </Card>
          )}

          {renderResults()}
        </div>
      </div>
    </div>
  );
}
