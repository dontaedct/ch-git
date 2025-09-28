/**
 * @fileoverview Template Marketplace Main Interface - HT-032.3.1
 * @module app/marketplace/page
 * @author HT-032.3.1 - Template Marketplace Infrastructure & Discovery Platform
 * @version 1.0.0
 *
 * HT-032.3.1: Template Marketplace Infrastructure & Discovery Platform
 *
 * Main template marketplace interface with comprehensive template browsing,
 * discovery platform, search functionality, and marketplace management.
 * Provides a centralized hub for template discovery and installation.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, Star, Download, Eye, TrendingUp, Filter, Grid, List, ShoppingBag, Package, Sparkles } from 'lucide-react';
import { DiscoveryPlatform } from '@/lib/marketplace/discovery-platform';
import { MarketplaceSearchEngine } from '@/lib/marketplace/search-engine';
import { getTemplateRegistryManager } from '@/lib/admin/template-registry';
import type { TemplateRegistration, TemplateInstance } from '@/types/admin/template-registry';

interface MarketplaceTemplate extends TemplateRegistration {
  downloads: number;
  rating: number;
  reviews: number;
  price: number;
  isFree: boolean;
  isPopular: boolean;
  isFeatured: boolean;
  lastUpdated: Date;
  screenshots: string[];
  demoUrl?: string;
  author: {
    name: string;
    avatar?: string;
    verified: boolean;
    totalTemplates: number;
  };
}

interface MarketplaceFilters {
  category: string;
  priceRange: string;
  rating: string;
  complexity: string;
  industry: string;
  sortBy: string;
  viewMode: 'grid' | 'list';
}

interface MarketplaceState {
  isLoading: boolean;
  templates: MarketplaceTemplate[];
  filteredTemplates: MarketplaceTemplate[];
  featuredTemplates: MarketplaceTemplate[];
  popularTemplates: MarketplaceTemplate[];
  searchQuery: string;
  filters: MarketplaceFilters;
  totalResults: number;
  currentPage: number;
  error: string | null;
}

const initialFilters: MarketplaceFilters = {
  category: '',
  priceRange: '',
  rating: '',
  complexity: '',
  industry: '',
  sortBy: 'popular',
  viewMode: 'grid'
};

const initialState: MarketplaceState = {
  isLoading: false,
  templates: [],
  filteredTemplates: [],
  featuredTemplates: [],
  popularTemplates: [],
  searchQuery: '',
  filters: initialFilters,
  totalResults: 0,
  currentPage: 1,
  error: null
};

export default function MarketplacePage() {
  const [state, setState] = useState<MarketplaceState>(initialState);
  const [activeTab, setActiveTab] = useState('browse');

  // Initialize marketplace services
  const discoveryPlatform = new DiscoveryPlatform();
  const searchEngine = new MarketplaceSearchEngine();
  const templateRegistry = getTemplateRegistryManager();

  useEffect(() => {
    // Load initial marketplace data
    loadMarketplaceData();
  }, []);

  useEffect(() => {
    // Filter templates when search query or filters change
    filterTemplates();
  }, [state.searchQuery, state.filters, state.templates]);

  const loadMarketplaceData = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Load templates from discovery platform
      const allTemplates = await discoveryPlatform.getAllMarketplaceTemplates();
      const featured = await discoveryPlatform.getFeaturedTemplates();
      const popular = await discoveryPlatform.getPopularTemplates();

      setState(prev => ({
        ...prev,
        templates: allTemplates,
        featuredTemplates: featured,
        popularTemplates: popular,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load marketplace data',
        isLoading: false
      }));
    }
  };

  const filterTemplates = async () => {
    try {
      let filtered = [...state.templates];

      // Apply search query
      if (state.searchQuery.trim()) {
        const searchResults = await searchEngine.searchTemplates({
          query: state.searchQuery,
          filters: state.filters
        });
        filtered = searchResults.templates;
      }

      // Apply filters
      if (state.filters.category) {
        filtered = filtered.filter(template => template.metadata.category === state.filters.category);
      }

      if (state.filters.priceRange) {
        const [min, max] = state.filters.priceRange.split('-').map(Number);
        filtered = filtered.filter(template => {
          if (template.isFree && min === 0) return true;
          return template.price >= min && template.price <= max;
        });
      }

      if (state.filters.rating) {
        const minRating = Number(state.filters.rating);
        filtered = filtered.filter(template => template.rating >= minRating);
      }

      if (state.filters.complexity) {
        filtered = filtered.filter(template => 
          template.metadata.tags.includes(state.filters.complexity)
        );
      }

      if (state.filters.industry) {
        filtered = filtered.filter(template => 
          template.metadata.tags.includes(state.filters.industry)
        );
      }

      // Apply sorting
      filtered.sort((a, b) => {
        switch (state.filters.sortBy) {
          case 'popular':
            return b.downloads - a.downloads;
          case 'rating':
            return b.rating - a.rating;
          case 'newest':
            return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
          case 'price-low':
            return a.price - b.price;
          case 'price-high':
            return b.price - a.price;
          case 'name':
            return a.metadata.name.localeCompare(b.metadata.name);
          default:
            return 0;
        }
      });

      setState(prev => ({
        ...prev,
        filteredTemplates: filtered,
        totalResults: filtered.length
      }));
    } catch (error) {
      console.error('Error filtering templates:', error);
    }
  };

  const handleSearch = (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  };

  const updateFilter = (key: keyof MarketplaceFilters, value: string) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, [key]: value }
    }));
  };

  const clearFilters = () => {
    setState(prev => ({
      ...prev,
      filters: initialFilters,
      searchQuery: ''
    }));
  };

  const handleTemplateInstall = async (templateId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await templateRegistry.installTemplate(templateId);
      
      // Show success message
      console.log(`Template ${templateId} installed successfully`);
    } catch (error) {
      console.error(`Failed to install template ${templateId}:`, error);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const renderHeroSection = () => (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 mb-8 rounded-lg">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <ShoppingBag className="w-10 h-10" />
          Template Marketplace
        </h1>
        <p className="text-xl mb-8 opacity-90">
          Discover, install, and customize professional templates for your projects
        </p>
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search templates, categories, or features..."
                value={state.searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="bg-white text-gray-900"
              />
            </div>
            <Button variant="secondary" size="lg">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
        <div className="flex justify-center gap-8 mt-8 text-sm">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            {state.templates.length}+ Templates
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Featured Collections
          </div>
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Free & Premium
          </div>
        </div>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="bg-white p-4 rounded-lg border mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <span className="font-medium">Filters:</span>
        </div>

        <Select value={state.filters.category} onValueChange={(value) => updateFilter('category', value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="ecommerce">E-commerce</SelectItem>
            <SelectItem value="portfolio">Portfolio</SelectItem>
            <SelectItem value="blog">Blog</SelectItem>
            <SelectItem value="landing">Landing Page</SelectItem>
            <SelectItem value="dashboard">Dashboard</SelectItem>
          </SelectContent>
        </Select>

        <Select value={state.filters.priceRange} onValueChange={(value) => updateFilter('priceRange', value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Price" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Prices</SelectItem>
            <SelectItem value="0-0">Free</SelectItem>
            <SelectItem value="1-49">$1 - $49</SelectItem>
            <SelectItem value="50-99">$50 - $99</SelectItem>
            <SelectItem value="100-999">$100+</SelectItem>
          </SelectContent>
        </Select>

        <Select value={state.filters.rating} onValueChange={(value) => updateFilter('rating', value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Ratings</SelectItem>
            <SelectItem value="4">4+ Stars</SelectItem>
            <SelectItem value="3">3+ Stars</SelectItem>
            <SelectItem value="2">2+ Stars</SelectItem>
          </SelectContent>
        </Select>

        <Select value={state.filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Popular</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant={state.filters.viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('viewMode', 'grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={state.filters.viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('viewMode', 'list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>

        {(state.searchQuery || Object.values(state.filters).some(f => f && f !== 'popular' && f !== 'grid')) && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        )}
      </div>
    </div>
  );

  const renderTemplateCard = (template: MarketplaceTemplate) => (
    <Card key={template.metadata.id} className="hover:shadow-lg transition-shadow duration-200 group">
      <div className="relative">
        {template.screenshots && template.screenshots.length > 0 && (
          <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
            <img
              src={template.screenshots[0]}
              alt={template.metadata.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
        )}
        {template.isFeatured && (
          <Badge className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-blue-500">
            <Sparkles className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        )}
        {template.isPopular && (
          <Badge className="absolute top-2 right-2 bg-orange-500">
            <TrendingUp className="w-3 h-3 mr-1" />
            Popular
          </Badge>
        )}
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-1">{template.metadata.name}</CardTitle>
            <CardDescription className="line-clamp-2">{template.metadata.description}</CardDescription>
          </div>
          <div className="text-right">
            {template.isFree ? (
              <Badge variant="secondary">Free</Badge>
            ) : (
              <span className="font-bold text-lg">${template.price}</span>
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
              <span>({template.reviews})</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              <span>{template.downloads.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {template.author.avatar && (
              <img
                src={template.author.avatar}
                alt={template.author.name}
                className="w-6 h-6 rounded-full"
              />
            )}
            <span className="text-sm text-muted-foreground">
              by {template.author.name}
              {template.author.verified && (
                <Badge variant="outline" className="ml-1 text-xs">
                  Verified
                </Badge>
              )}
            </span>
          </div>

          <div className="flex flex-wrap gap-1">
            {template.metadata.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={() => handleTemplateInstall(template.metadata.id)}
              disabled={state.isLoading}
              className="flex-1"
            >
              {state.isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Install
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href={`/marketplace/template/${template.metadata.id}`}>
                <Eye className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderFeaturedSection = () => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-purple-500" />
        Featured Templates
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.featuredTemplates.slice(0, 6).map(renderTemplateCard)}
      </div>
    </div>
  );

  const renderPopularSection = () => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-orange-500" />
        Popular Templates
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {state.popularTemplates.slice(0, 8).map(renderTemplateCard)}
      </div>
    </div>
  );

  const renderBrowseResults = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {state.searchQuery ? `Search Results` : 'All Templates'} 
          <span className="text-muted-foreground ml-2">({state.totalResults})</span>
        </h2>
      </div>

      {state.filteredTemplates.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <Package className="w-16 h-16 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">No templates found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </Card>
      ) : (
        <div className={`grid gap-6 ${
          state.filters.viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {state.filteredTemplates.map(renderTemplateCard)}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {renderHeroSection()}

        {state.error && (
          <Card className="border-red-200 bg-red-50 mb-6">
            <CardContent className="pt-6">
              <p className="text-red-600">{state.error}</p>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse All</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {renderFilters()}
            {renderBrowseResults()}
          </TabsContent>

          <TabsContent value="featured" className="space-y-6">
            {renderFeaturedSection()}
          </TabsContent>

          <TabsContent value="popular" className="space-y-6">
            {renderPopularSection()}
          </TabsContent>
        </Tabs>

        {state.isLoading && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin" />
                <p>Loading marketplace...</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
