/**
 * @fileoverview Template Discovery Platform System - HT-032.3.1
 * @module lib/marketplace/discovery-platform
 * @author HT-032.3.1 - Template Marketplace Infrastructure & Discovery Platform
 * @version 1.0.0
 *
 * HT-032.3.1: Template Marketplace Infrastructure & Discovery Platform
 *
 * Template discovery platform system that handles template discovery,
 * marketplace management, featured templates, and template analytics.
 */

import { z } from 'zod';

// Template marketplace types
export interface MarketplaceTemplate {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  category: string;
  tags: string[];
  price: number;
  isFree: boolean;
  isPopular: boolean;
  isFeatured: boolean;
  rating: number;
  downloads: number;
  reviews: TemplateReview[];
  screenshots: string[];
  thumbnail?: string;
  demoUrl?: string;
  videoUrl?: string;
  author: TemplateAuthor;
  lastUpdated: Date;
  createdAt: Date;
  version: string;
  changelog: ChangelogEntry[];
  requirements: string[];
  features: TemplateFeature[];
  compatibilityInfo: CompatibilityInfo;
  metadata: TemplateMetadata;
}

export interface TemplateReview {
  id: string;
  templateId: string;
  userId: string;
  author: string;
  avatar?: string;
  rating: number;
  comment: string;
  date: Date;
  helpful: number;
  verified: boolean;
}

export interface TemplateAuthor {
  id: string;
  name: string;
  avatar?: string;
  verified: boolean;
  totalTemplates: number;
  bio: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
}

export interface ChangelogEntry {
  version: string;
  date: Date;
  changes: string[];
  type: 'major' | 'minor' | 'patch';
}

export interface TemplateFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  included: boolean;
  premium?: boolean;
}

export interface CompatibilityInfo {
  nextjs: string;
  react: string;
  typescript: string;
  tailwind: string;
  node: string;
  browsers: string[];
}

export interface TemplateMetadata {
  size: number;
  files: number;
  components: number;
  pages: number;
  apis: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedSetupTime: string;
  documentation: string;
  support: string;
  license: string;
}

export interface DiscoveryFilters {
  categories?: string[];
  tags?: string[];
  priceRange?: [number, number];
  rating?: number;
  author?: string;
  featured?: boolean;
  popular?: boolean;
  free?: boolean;
  sortBy?: 'popular' | 'rating' | 'newest' | 'price-low' | 'price-high' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface DiscoveryResult {
  templates: MarketplaceTemplate[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  facets: {
    categories: Array<{ name: string; count: number }>;
    tags: Array<{ name: string; count: number }>;
    authors: Array<{ name: string; count: number }>;
    priceRanges: Array<{ range: string; count: number }>;
  };
}

/**
 * Template Discovery Platform Implementation
 * Manages template discovery, marketplace operations, and analytics
 */
export class DiscoveryPlatform {
  private templates: Map<string, MarketplaceTemplate> = new Map();
  private featuredTemplates: string[] = [];
  private popularTemplates: string[] = [];
  private categories: Map<string, number> = new Map();
  private tags: Map<string, number> = new Map();

  constructor() {
    this.initializeMockData();
  }

  /**
   * Initialize with mock marketplace data
   */
  private initializeMockData(): void {
    const mockTemplates: MarketplaceTemplate[] = [
      {
        id: 'saas-dashboard-pro',
        name: 'SaaS Dashboard Pro',
        description: 'Professional SaaS dashboard template with analytics, user management, and billing',
        longDescription: 'A comprehensive SaaS dashboard template featuring advanced analytics, user management, subscription billing, team collaboration, and more. Perfect for building modern SaaS applications.',
        category: 'dashboard',
        tags: ['saas', 'dashboard', 'analytics', 'billing', 'pro'],
        price: 99,
        isFree: false,
        isPopular: true,
        isFeatured: true,
        rating: 4.8,
        downloads: 2847,
        reviews: [],
        screenshots: [
          '/templates/saas-dashboard-pro/screenshot-1.png',
          '/templates/saas-dashboard-pro/screenshot-2.png',
          '/templates/saas-dashboard-pro/screenshot-3.png'
        ],
        thumbnail: '/templates/saas-dashboard-pro/thumbnail.png',
        demoUrl: 'https://demo.saas-dashboard-pro.com',
        videoUrl: 'https://youtube.com/watch?v=demo',
        author: {
          id: 'author-1',
          name: 'Digital Solutions Inc',
          avatar: '/authors/digital-solutions.png',
          verified: true,
          totalTemplates: 12,
          bio: 'Professional template creators specializing in SaaS and business applications',
          website: 'https://digitalsolutions.com'
        },
        lastUpdated: new Date('2024-01-15'),
        createdAt: new Date('2023-06-01'),
        version: '2.1.0',
        changelog: [
          {
            version: '2.1.0',
            date: new Date('2024-01-15'),
            changes: ['Added new analytics charts', 'Improved mobile responsiveness', 'Bug fixes'],
            type: 'minor'
          }
        ],
        requirements: ['Node.js 18+', 'Next.js 14+', 'PostgreSQL or MySQL'],
        features: [
          {
            id: 'analytics',
            name: 'Advanced Analytics',
            description: 'Comprehensive analytics dashboard with charts and metrics',
            icon: 'chart',
            included: true
          },
          {
            id: 'billing',
            name: 'Subscription Billing',
            description: 'Integrated Stripe billing system',
            icon: 'credit-card',
            included: true
          }
        ],
        compatibilityInfo: {
          nextjs: '14.x',
          react: '18.x',
          typescript: '5.x',
          tailwind: '3.x',
          node: '18.x',
          browsers: ['Chrome 90+', 'Firefox 88+', 'Safari 14+', 'Edge 90+']
        },
        metadata: {
          size: 15.2,
          files: 247,
          components: 45,
          pages: 18,
          apis: 12,
          difficulty: 'intermediate',
          estimatedSetupTime: '2-3 hours',
          documentation: 'comprehensive',
          support: 'email',
          license: 'MIT'
        }
      },
      {
        id: 'ecommerce-starter',
        name: 'E-commerce Starter Kit',
        description: 'Complete e-commerce solution with product management, cart, and checkout',
        longDescription: 'A full-featured e-commerce template with product catalog, shopping cart, secure checkout, order management, and admin dashboard. Built with modern technologies and best practices.',
        category: 'ecommerce',
        tags: ['ecommerce', 'shop', 'cart', 'checkout', 'products'],
        price: 0,
        isFree: true,
        isPopular: true,
        isFeatured: false,
        rating: 4.6,
        downloads: 5234,
        reviews: [],
        screenshots: [
          '/templates/ecommerce-starter/screenshot-1.png',
          '/templates/ecommerce-starter/screenshot-2.png'
        ],
        thumbnail: '/templates/ecommerce-starter/thumbnail.png',
        demoUrl: 'https://demo.ecommerce-starter.com',
        author: {
          id: 'author-2',
          name: 'Open Commerce Team',
          avatar: '/authors/open-commerce.png',
          verified: true,
          totalTemplates: 8,
          bio: 'Building open-source e-commerce solutions for everyone',
          website: 'https://opencommerce.dev'
        },
        lastUpdated: new Date('2024-01-10'),
        createdAt: new Date('2023-08-15'),
        version: '1.5.2',
        changelog: [
          {
            version: '1.5.2',
            date: new Date('2024-01-10'),
            changes: ['Payment gateway improvements', 'Mobile cart optimization'],
            type: 'patch'
          }
        ],
        requirements: ['Node.js 16+', 'Next.js 13+', 'Stripe account'],
        features: [
          {
            id: 'products',
            name: 'Product Management',
            description: 'Complete product catalog with categories and variants',
            icon: 'package',
            included: true
          },
          {
            id: 'cart',
            name: 'Shopping Cart',
            description: 'Persistent shopping cart with local storage',
            icon: 'shopping-cart',
            included: true
          }
        ],
        compatibilityInfo: {
          nextjs: '13.x',
          react: '18.x',
          typescript: '4.x',
          tailwind: '3.x',
          node: '16.x',
          browsers: ['Chrome 88+', 'Firefox 85+', 'Safari 13+', 'Edge 88+']
        },
        metadata: {
          size: 8.7,
          files: 156,
          components: 28,
          pages: 12,
          apis: 8,
          difficulty: 'beginner',
          estimatedSetupTime: '1-2 hours',
          documentation: 'good',
          support: 'community',
          license: 'MIT'
        }
      },
      {
        id: 'portfolio-creative',
        name: 'Creative Portfolio',
        description: 'Modern portfolio template for designers and creative professionals',
        longDescription: 'A stunning portfolio template designed for creative professionals, featuring smooth animations, project showcases, and contact forms.',
        category: 'portfolio',
        tags: ['portfolio', 'creative', 'design', 'showcase'],
        price: 49,
        isFree: false,
        isPopular: false,
        isFeatured: true,
        rating: 4.9,
        downloads: 1823,
        reviews: [],
        screenshots: [
          '/templates/portfolio-creative/screenshot-1.png'
        ],
        thumbnail: '/templates/portfolio-creative/thumbnail.png',
        demoUrl: 'https://demo.creative-portfolio.com',
        author: {
          id: 'author-3',
          name: 'Creative Studio',
          avatar: '/authors/creative-studio.png',
          verified: false,
          totalTemplates: 5,
          bio: 'Crafting beautiful designs for the web',
          website: 'https://creativestudio.design'
        },
        lastUpdated: new Date('2023-12-20'),
        createdAt: new Date('2023-09-01'),
        version: '1.2.1',
        changelog: [
          {
            version: '1.2.1',
            date: new Date('2023-12-20'),
            changes: ['Animation performance improvements', 'New project layout options'],
            type: 'minor'
          }
        ],
        requirements: ['Node.js 16+', 'Next.js 13+'],
        features: [
          {
            id: 'animations',
            name: 'Smooth Animations',
            description: 'Beautiful CSS and JS animations throughout',
            icon: 'zap',
            included: true
          }
        ],
        compatibilityInfo: {
          nextjs: '13.x',
          react: '18.x',
          typescript: '4.x',
          tailwind: '3.x',
          node: '16.x',
          browsers: ['Chrome 88+', 'Firefox 85+', 'Safari 13+', 'Edge 88+']
        },
        metadata: {
          size: 5.3,
          files: 89,
          components: 15,
          pages: 8,
          apis: 3,
          difficulty: 'beginner',
          estimatedSetupTime: '30 minutes',
          documentation: 'basic',
          support: 'none',
          license: 'Commercial'
        }
      }
    ];

    // Initialize templates
    mockTemplates.forEach(template => {
      this.templates.set(template.id, template);
      
      if (template.isFeatured) {
        this.featuredTemplates.push(template.id);
      }
      
      if (template.isPopular) {
        this.popularTemplates.push(template.id);
      }

      // Update categories and tags counts
      this.categories.set(template.category, (this.categories.get(template.category) || 0) + 1);
      template.tags.forEach(tag => {
        this.tags.set(tag, (this.tags.get(tag) || 0) + 1);
      });
    });
  }

  /**
   * Get all marketplace templates with optional filtering
   */
  async getAllMarketplaceTemplates(filters?: DiscoveryFilters): Promise<MarketplaceTemplate[]> {
    let templates = Array.from(this.templates.values());

    if (filters) {
      templates = this.applyFilters(templates, filters);
    }

    return this.sortTemplates(templates, filters?.sortBy, filters?.sortOrder);
  }

  /**
   * Get featured templates
   */
  async getFeaturedTemplates(): Promise<MarketplaceTemplate[]> {
    return this.featuredTemplates
      .map(id => this.templates.get(id))
      .filter(Boolean) as MarketplaceTemplate[];
  }

  /**
   * Get popular templates
   */
  async getPopularTemplates(): Promise<MarketplaceTemplate[]> {
    return this.popularTemplates
      .map(id => this.templates.get(id))
      .filter(Boolean) as MarketplaceTemplate[];
  }

  /**
   * Get template by ID
   */
  async getTemplateDetail(templateId: string): Promise<MarketplaceTemplate> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }
    return template;
  }

  /**
   * Search templates with filters and pagination
   */
  async discoverTemplates(
    query?: string,
    filters?: DiscoveryFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<DiscoveryResult> {
    let templates = Array.from(this.templates.values());

    // Apply text search
    if (query && query.trim()) {
      const searchTerm = query.toLowerCase();
      templates = templates.filter(template =>
        template.name.toLowerCase().includes(searchTerm) ||
        template.description.toLowerCase().includes(searchTerm) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        template.category.toLowerCase().includes(searchTerm)
      );
    }

    // Apply filters
    if (filters) {
      templates = this.applyFilters(templates, filters);
    }

    // Sort templates
    templates = this.sortTemplates(templates, filters?.sortBy, filters?.sortOrder);

    // Generate facets
    const facets = this.generateFacets(templates);

    // Apply pagination
    const total = templates.length;
    const startIndex = (page - 1) * limit;
    const paginatedTemplates = templates.slice(startIndex, startIndex + limit);

    return {
      templates: paginatedTemplates,
      total,
      page,
      limit,
      hasMore: startIndex + limit < total,
      facets
    };
  }

  /**
   * Get template categories with counts
   */
  async getCategories(): Promise<Array<{ name: string; count: number }>> {
    return Array.from(this.categories.entries()).map(([name, count]) => ({ name, count }));
  }

  /**
   * Get popular tags with counts
   */
  async getPopularTags(limit: number = 20): Promise<Array<{ name: string; count: number }>> {
    return Array.from(this.tags.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get template recommendations based on a template
   */
  async getRelatedTemplates(templateId: string, limit: number = 6): Promise<MarketplaceTemplate[]> {
    const template = this.templates.get(templateId);
    if (!template) {
      return [];
    }

    const allTemplates = Array.from(this.templates.values())
      .filter(t => t.id !== templateId);

    // Score templates based on similarity
    const scoredTemplates = allTemplates.map(t => ({
      template: t,
      score: this.calculateSimilarityScore(template, t)
    }));

    // Sort by score and return top results
    return scoredTemplates
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.template);
  }

  /**
   * Add a review to a template
   */
  async addTemplateReview(templateId: string, review: Omit<TemplateReview, 'id' | 'templateId'>): Promise<void> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const newReview: TemplateReview = {
      ...review,
      id: Date.now().toString(),
      templateId
    };

    template.reviews.push(newReview);

    // Recalculate rating
    const totalRating = template.reviews.reduce((sum, r) => sum + r.rating, 0);
    template.rating = totalRating / template.reviews.length;
  }

  /**
   * Get marketplace statistics
   */
  async getMarketplaceStats(): Promise<{
    totalTemplates: number;
    totalDownloads: number;
    averageRating: number;
    totalAuthors: number;
    categoriesCount: number;
    freeTemplates: number;
    paidTemplates: number;
  }> {
    const templates = Array.from(this.templates.values());
    const authors = new Set(templates.map(t => t.author.id));

    return {
      totalTemplates: templates.length,
      totalDownloads: templates.reduce((sum, t) => sum + t.downloads, 0),
      averageRating: templates.reduce((sum, t) => sum + t.rating, 0) / templates.length,
      totalAuthors: authors.size,
      categoriesCount: this.categories.size,
      freeTemplates: templates.filter(t => t.isFree).length,
      paidTemplates: templates.filter(t => !t.isFree).length
    };
  }

  // Private helper methods

  private applyFilters(templates: MarketplaceTemplate[], filters: DiscoveryFilters): MarketplaceTemplate[] {
    return templates.filter(template => {
      // Category filter
      if (filters.categories && filters.categories.length > 0) {
        if (!filters.categories.includes(template.category)) return false;
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        if (!filters.tags.some(tag => template.tags.includes(tag))) return false;
      }

      // Price range filter
      if (filters.priceRange) {
        const [min, max] = filters.priceRange;
        if (template.price < min || template.price > max) return false;
      }

      // Rating filter
      if (filters.rating && template.rating < filters.rating) return false;

      // Author filter
      if (filters.author && template.author.name !== filters.author) return false;

      // Featured filter
      if (filters.featured !== undefined && template.isFeatured !== filters.featured) return false;

      // Popular filter
      if (filters.popular !== undefined && template.isPopular !== filters.popular) return false;

      // Free filter
      if (filters.free !== undefined && template.isFree !== filters.free) return false;

      return true;
    });
  }

  private sortTemplates(
    templates: MarketplaceTemplate[],
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc'
  ): MarketplaceTemplate[] {
    return templates.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'popular':
          comparison = b.downloads - a.downloads;
          break;
        case 'rating':
          comparison = b.rating - a.rating;
          break;
        case 'newest':
          comparison = new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
          break;
        case 'price-low':
          comparison = a.price - b.price;
          break;
        case 'price-high':
          comparison = b.price - a.price;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        default:
          // Default to popularity
          comparison = b.downloads - a.downloads;
      }

      return sortOrder === 'asc' ? -comparison : comparison;
    });
  }

  private generateFacets(templates: MarketplaceTemplate[]) {
    const categories = new Map<string, number>();
    const tags = new Map<string, number>();
    const authors = new Map<string, number>();
    const priceRanges = new Map<string, number>();

    templates.forEach(template => {
      // Categories
      categories.set(template.category, (categories.get(template.category) || 0) + 1);

      // Tags
      template.tags.forEach(tag => {
        tags.set(tag, (tags.get(tag) || 0) + 1);
      });

      // Authors
      authors.set(template.author.name, (authors.get(template.author.name) || 0) + 1);

      // Price ranges
      let priceRange: string;
      if (template.isFree) {
        priceRange = 'Free';
      } else if (template.price < 50) {
        priceRange = '$1-$49';
      } else if (template.price < 100) {
        priceRange = '$50-$99';
      } else {
        priceRange = '$100+';
      }
      priceRanges.set(priceRange, (priceRanges.get(priceRange) || 0) + 1);
    });

    return {
      categories: Array.from(categories.entries()).map(([name, count]) => ({ name, count })),
      tags: Array.from(tags.entries()).map(([name, count]) => ({ name, count })),
      authors: Array.from(authors.entries()).map(([name, count]) => ({ name, count })),
      priceRanges: Array.from(priceRanges.entries()).map(([range, count]) => ({ range, count }))
    };
  }

  private calculateSimilarityScore(template1: MarketplaceTemplate, template2: MarketplaceTemplate): number {
    let score = 0;

    // Category match (highest weight)
    if (template1.category === template2.category) {
      score += 5;
    }

    // Tag overlap
    const commonTags = template1.tags.filter(tag => template2.tags.includes(tag));
    score += commonTags.length * 2;

    // Price similarity
    const priceDiff = Math.abs(template1.price - template2.price);
    if (priceDiff < 20) {
      score += 2;
    } else if (priceDiff < 50) {
      score += 1;
    }

    // Rating similarity
    const ratingDiff = Math.abs(template1.rating - template2.rating);
    if (ratingDiff < 0.5) {
      score += 1;
    }

    // Same author
    if (template1.author.id === template2.author.id) {
      score += 3;
    }

    return score;
  }
}
