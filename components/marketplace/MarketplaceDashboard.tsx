/**
 * Module Marketplace Dashboard
 * 
 * Main interface for browsing, searching, and managing modules
 */

'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Star, Download, TrendingUp, Clock } from 'lucide-react';
import { ModuleMetadata, Category } from '@/lib/marketplace/module-registry';

interface MarketplaceStats {
  totalModules: number;
  approvedModules: number;
  pendingModules: number;
  totalInstalls: number;
  averageRating: number;
  categoryBreakdown: Record<string, number>;
}

interface MarketplaceDashboardProps {
  initialModules?: ModuleMetadata[];
  initialCategories?: Category[];
  initialStats?: MarketplaceStats;
}

export function MarketplaceDashboard({
  initialModules = [],
  initialCategories = [],
  initialStats,
}: MarketplaceDashboardProps) {
  const [modules, setModules] = useState<ModuleMetadata[]>(initialModules);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [stats, setStats] = useState<MarketplaceStats | null>(initialStats || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'installCount' | 'createdAt'>('relevance');
  const [pricingFilter, setPricingFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadMarketplaceData();
  }, []);

  const loadMarketplaceData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [modulesRes, categoriesRes, statsRes] = await Promise.all([
        fetch('/api/marketplace/modules?limit=20'),
        fetch('/api/marketplace/categories'),
        fetch('/api/marketplace/stats'),
      ]);

      if (modulesRes.ok) {
        const modulesData = await modulesRes.json();
        setModules(modulesData.data.modules);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.data);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load marketplace data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      
      const params = new URLSearchParams({
        limit: '20',
        ...(searchQuery && { query: searchQuery }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(pricingFilter !== 'all' && { pricing: pricingFilter }),
        sortBy,
      });

      const response = await fetch(`/api/marketplace/modules?${params}`);
      if (response.ok) {
        const data = await response.json();
        setModules(data.data.modules);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstallModule = async (moduleId: string) => {
    try {
      const response = await fetch(`/api/marketplace/modules/${moduleId}/install`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'current-tenant', // In real app, get from context
        }),
      });

      if (response.ok) {
        // Show success message
        console.log('Module installed successfully');
      } else if (response.status === 402) {
        // Payment required
        const data = await response.json();
        console.log('Payment required:', data.pricingInfo);
      }
    } catch (err) {
      console.error('Installation failed:', err);
    }
  };

  const formatInstallCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatPrice = (pricing: ModuleMetadata['pricing']) => {
    if (pricing.type === 'free') return 'Free';
    if (pricing.type === 'one-time') return `$${pricing.amount}`;
    if (pricing.type === 'subscription') {
      return `$${pricing.amount}/${pricing.period}`;
    }
    return 'Contact for pricing';
  };

  return (
    <div className="marketplace-dashboard min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Module Marketplace</h1>
              <p className="mt-2 text-gray-600">
                Discover and install modules to extend your application
              </p>
            </div>
            {stats && (
              <div className="flex space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.totalModules}</div>
                  <div className="text-sm text-gray-500">Modules</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{formatInstallCount(stats.totalInstalls)}</div>
                  <div className="text-sm text-gray-500">Installs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</div>
                  <div className="text-sm text-gray-500">Avg Rating</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.moduleCount})
                  </option>
                ))}
              </select>
            </div>

            {/* Pricing Filter */}
            <div className="lg:w-32">
              <select
                value={pricingFilter}
                onChange={(e) => setPricingFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Pricing</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            {/* Sort */}
            <div className="lg:w-40">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="relevance">Relevance</option>
                <option value="rating">Rating</option>
                <option value="installCount">Popular</option>
                <option value="createdAt">Newest</option>
              </select>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <div key={module.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Module Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{module.displayName}</h3>
                  <p className="text-sm text-gray-500">by {module.author}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-900">{module.rating.average.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">({module.rating.count})</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{module.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {module.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {module.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    +{module.tags.length - 3} more
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-1">
                  <Download className="h-4 w-4" />
                  <span>{formatInstallCount(module.installCount)} installs</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(module.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Price and Install */}
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-gray-900">
                  {formatPrice(module.pricing)}
                </div>
                <button
                  onClick={() => handleInstallModule(module.id)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Install
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {modules.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No modules found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or browse all modules.</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading modules...</p>
          </div>
        )}
      </div>
    </div>
  );
}
