/**
 * Template Marketplace Component
 * 
 * Marketplace for sharing, discovering, and downloading templates
 * with categories, ratings, and community features.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { getTemplateStorage } from '../../lib/template-storage/TemplateStorage';
import { TemplateManifest } from '../../types/componentContracts';

interface MarketplaceTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    verified: boolean;
  };
  preview: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  downloadCount: number;
  price: number; // 0 for free
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
  featured: boolean;
  components: number;
  compatibility: string[];
}

interface MarketplaceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  templateCount: number;
}

interface MarketplaceFilters {
  category: string;
  price: 'all' | 'free' | 'premium';
  rating: number;
  tags: string[];
  sortBy: 'popular' | 'newest' | 'rating' | 'price';
}

interface TemplateReview {
  id: string;
  templateId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
}

export const TemplateMarketplace: React.FC<{
  onClose: () => void;
  onTemplateSelect?: (template: MarketplaceTemplate) => void;
}> = ({ onClose, onTemplateSelect }) => {
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([]);
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [reviews, setReviews] = useState<TemplateReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<MarketplaceTemplate | null>(null);
  const [showReviews, setShowReviews] = useState(false);
  const [filters, setFilters] = useState<MarketplaceFilters>({
    category: 'all',
    price: 'all',
    rating: 0,
    tags: [],
    sortBy: 'popular'
  });
  const [searchQuery, setSearchQuery] = useState('');

  const templateStorage = getTemplateStorage();

  // Load marketplace data
  const loadMarketplaceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock marketplace data (in real implementation, this would come from API)
      const mockTemplates: MarketplaceTemplate[] = [
        {
          id: 'marketplace_1',
          name: 'Modern Business Landing',
          description: 'Professional landing page with hero section, features, testimonials, and contact form',
          category: 'business',
          author: {
            id: 'author_1',
            name: 'Design Studio Pro',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
            verified: true
          },
          preview: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
          tags: ['business', 'landing', 'modern', 'responsive'],
          rating: 4.8,
          reviewCount: 127,
          downloadCount: 2847,
          price: 0,
          isPremium: false,
          createdAt: '2024-01-15',
          updatedAt: '2024-01-20',
          featured: true,
          components: 8,
          compatibility: ['Next.js', 'React', 'Tailwind CSS']
        },
        {
          id: 'marketplace_2',
          name: 'E-commerce Store Pro',
          description: 'Complete e-commerce template with product showcase, cart, checkout, and admin dashboard',
          category: 'ecommerce',
          author: {
            id: 'author_2',
            name: 'E-commerce Experts',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
            verified: true
          },
          preview: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
          tags: ['ecommerce', 'store', 'shopping', 'premium'],
          rating: 4.9,
          reviewCount: 89,
          downloadCount: 1523,
          price: 49,
          isPremium: true,
          createdAt: '2024-01-10',
          updatedAt: '2024-01-18',
          featured: true,
          components: 15,
          compatibility: ['Next.js', 'React', 'Stripe', 'Tailwind CSS']
        },
        {
          id: 'marketplace_3',
          name: 'Creative Portfolio',
          description: 'Stunning portfolio template for designers, photographers, and creative professionals',
          category: 'portfolio',
          author: {
            id: 'author_3',
            name: 'Creative Minds',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
            verified: false
          },
          preview: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=300&fit=crop',
          tags: ['portfolio', 'creative', 'gallery', 'minimal'],
          rating: 4.6,
          reviewCount: 203,
          downloadCount: 3421,
          price: 0,
          isPremium: false,
          createdAt: '2024-01-05',
          updatedAt: '2024-01-15',
          featured: false,
          components: 12,
          compatibility: ['Next.js', 'React', 'Framer Motion', 'Tailwind CSS']
        }
      ];

      const mockCategories: MarketplaceCategory[] = [
        { id: 'all', name: 'All Templates', description: 'Browse all available templates', icon: '📦', templateCount: 156 },
        { id: 'business', name: 'Business', description: 'Professional business websites', icon: '🏢', templateCount: 34 },
        { id: 'ecommerce', name: 'E-commerce', description: 'Online stores and shopping', icon: '🛍️', templateCount: 28 },
        { id: 'portfolio', name: 'Portfolio', description: 'Creative portfolios and galleries', icon: '🎨', templateCount: 42 },
        { id: 'landing', name: 'Landing Pages', description: 'High-converting landing pages', icon: '🚀', templateCount: 31 },
        { id: 'blog', name: 'Blog', description: 'Content and blog templates', icon: '📝', templateCount: 21 }
      ];

      const mockReviews: TemplateReview[] = [
        {
          id: 'review_1',
          templateId: 'marketplace_1',
          userId: 'user_1',
          userName: 'Sarah Johnson',
          userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
          rating: 5,
          comment: 'Perfect template for our business! Easy to customize and looks professional.',
          createdAt: '2024-01-18',
          helpful: 12
        },
        {
          id: 'review_2',
          templateId: 'marketplace_1',
          userId: 'user_2',
          userName: 'Mike Chen',
          userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
          rating: 4,
          comment: 'Great design, but could use more customization options.',
          createdAt: '2024-01-16',
          helpful: 8
        }
      ];

      setTemplates(mockTemplates);
      setCategories(mockCategories);
      setReviews(mockReviews);
    } catch (err) {
      setError('Failed to load marketplace data');
      console.error('Failed to load marketplace:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMarketplaceData();
  }, [loadMarketplaceData]);

  // Filter and sort templates
  const filteredTemplates = templates
    .filter(template => {
      if (filters.category !== 'all' && template.category !== filters.category) return false;
      if (filters.price === 'free' && template.price > 0) return false;
      if (filters.price === 'premium' && template.price === 0) return false;
      if (filters.rating > 0 && template.rating < filters.rating) return false;
      if (filters.tags.length > 0 && !filters.tags.some(tag => template.tags.includes(tag))) return false;
      if (searchQuery && !template.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !template.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          return a.price - b.price;
        case 'popular':
        default:
          return b.downloadCount - a.downloadCount;
      }
    });

  // Handle template download
  const handleDownloadTemplate = async (template: MarketplaceTemplate) => {
    try {
      // In real implementation, this would download from marketplace API
      const mockTemplate: TemplateManifest = {
        id: `tpl_${Date.now()}`,
        name: template.name,
        slug: template.name.toLowerCase().replace(/\s+/g, '-'),
        description: template.description,
        category: template.category as any,
        components: [], // Would be populated from marketplace
        theme: { useSiteDefaults: true },
        meta: {
          version: '1.0.0',
          createdBy: 'marketplace',
          createdAt: new Date().toISOString().split('T')[0],
          tags: template.tags,
          schemaVersion: '1.0.0'
        }
      };

      await templateStorage.saveTemplate(mockTemplate, {
        description: `Downloaded from marketplace: ${template.name}`,
        isActive: true
      });

      alert('Template downloaded successfully!');
      onTemplateSelect?.(template);
    } catch (error) {
      console.error('Failed to download template:', error);
      alert('Failed to download template. Please try again.');
    }
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-center">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Marketplace</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={loadMarketplaceData}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Retry
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Template Marketplace</h2>
              <p className="text-sm text-gray-600 mt-1">Discover and download professional templates</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-200px)]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setFilters(prev => ({ ...prev, category: category.id }))}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      filters.category === category.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name} ({category.templateCount})
                  </button>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Price</h3>
                <select
                  value={filters.price}
                  onChange={(e) => setFilters(prev => ({ ...prev, price: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Prices</option>
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                </select>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Minimum Rating</h3>
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters(prev => ({ ...prev, rating: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value={0}>Any Rating</option>
                  <option value={4}>4+ Stars</option>
                  <option value={4.5}>4.5+ Stars</option>
                  <option value={4.8}>4.8+ Stars</option>
                </select>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Sort By</h3>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price">Price</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Featured Templates */}
            {filters.category === 'all' && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Featured Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.filter(t => t.featured).map((template) => (
                    <div key={template.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img src={template.preview} alt={template.name} className="w-full h-48 object-cover" />
                        {template.isPremium && (
                          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 text-xs font-medium rounded">
                            Premium
                          </div>
                        )}
                        {template.featured && (
                          <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 text-xs font-medium rounded">
                            Featured
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{template.name}</h4>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            {renderStars(template.rating)}
                            <span className="text-sm text-gray-600 ml-2">({template.reviewCount})</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {template.price === 0 ? 'Free' : `$${template.price}`}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <img src={template.author.avatar} alt={template.author.name} className="w-6 h-6 rounded-full mr-2" />
                            <span>{template.author.name}</span>
                            {template.author.verified && <span className="ml-1 text-blue-500">✓</span>}
                          </div>
                          <button
                            onClick={() => handleDownloadTemplate(template)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Templates */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {filters.category === 'all' ? 'All Templates' : categories.find(c => c.id === filters.category)?.name}
                ({filteredTemplates.length})
              </h3>
              
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                  <p className="text-gray-600">Try adjusting your filters or search terms</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTemplates.map((template) => (
                    <div key={template.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img src={template.preview} alt={template.name} className="w-full h-48 object-cover" />
                        {template.isPremium && (
                          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 text-xs font-medium rounded">
                            Premium
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{template.name}</h4>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            {renderStars(template.rating)}
                            <span className="text-sm text-gray-600 ml-2">({template.reviewCount})</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {template.price === 0 ? 'Free' : `$${template.price}`}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <img src={template.author.avatar} alt={template.author.name} className="w-6 h-6 rounded-full mr-2" />
                            <span>{template.author.name}</span>
                            {template.author.verified && <span className="ml-1 text-blue-500">✓</span>}
                          </div>
                          <button
                            onClick={() => handleDownloadTemplate(template)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateMarketplace;
