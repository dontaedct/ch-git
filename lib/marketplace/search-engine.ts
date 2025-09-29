/**
 * @fileoverview Marketplace Search Engine System - HT-032.3.1
 * @module lib/marketplace/search-engine
 * @author HT-032.3.1 - Template Marketplace Infrastructure & Discovery Platform
 * @version 1.0.0
 *
 * HT-032.3.1: Template Marketplace Infrastructure & Discovery Platform
 *
 * Advanced template search engine with full-text search, faceted filtering,
 * search suggestions, saved searches, and intelligent ranking algorithms.
 */

import { DiscoveryPlatform, MarketplaceTemplate } from './discovery-platform';

export interface TemplateSearchParams {
  query?: string;
  filters?: SearchFilters;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchFilters {
  categories?: string[];
  tags?: string[];
  priceRange?: [number, number];
  rating?: number;
  complexity?: string[];
  industries?: string[];
  features?: string[];
  authors?: string[];
  lastUpdated?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TemplateSearchResult {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  rating: number;
  downloads: number;
  thumbnail?: string;
  author: {
    name: string;
    verified: boolean;
  };
  lastUpdated: Date;
  relevanceScore: number;
}

export interface SearchResult {
  templates: TemplateSearchResult[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  facets: SearchFacets;
  suggestions?: string[];
  queryTime: number;
}

export interface SearchFacets {
  categories: Array<{ name: string; count: number }>;
  tags: Array<{ name: string; count: number }>;
  authors: Array<{ name: string; count: number }>;
  ratings: Array<{ rating: number; count: number }>;
  priceRanges: Array<{ range: string; count: number }>;
  complexity: Array<{ level: string; count: number }>;
  industries: Array<{ name: string; count: number }>;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  createdAt: Date;
  lastUsed?: Date;
  useCount: number;
}

export interface SearchSuggestion {
  text: string;
  type: 'query' | 'category' | 'tag' | 'author';
  count?: number;
}

/**
 * Advanced Marketplace Search Engine
 * Provides comprehensive search functionality for the template marketplace
 */
export class MarketplaceSearchEngine {
  private discoveryPlatform: DiscoveryPlatform;
  private searchHistory: string[] = [];
  private savedSearches: Map<string, SavedSearch> = new Map();
  private searchIndex: Map<string, string[]> = new Map();
  private stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'template', 'templates', 'design', 'website', 'app', 'application'
  ]);

  constructor() {
    this.discoveryPlatform = new DiscoveryPlatform();
    this.initializeSearchIndex();
    this.loadSavedData();
  }

  /**
   * Perform comprehensive template search
   */
  async searchTemplates(params: TemplateSearchParams): Promise<SearchResult> {
    const startTime = Date.now();
    
    try {
      const {
        query = '',
        filters = {},
        page = 1,
        limit = 20,
        sortBy = 'relevance',
        sortOrder = 'desc'
      } = params;

      // Get all templates
      const allTemplates = await this.discoveryPlatform.getAllMarketplaceTemplates();
      
      // Apply text search
      let searchResults = query.trim() 
        ? this.performTextSearch(allTemplates, query)
        : allTemplates.map(template => ({ template, score: 0 }));

      // Apply filters
      searchResults = this.applySearchFilters(searchResults, filters);

      // Sort results
      searchResults = this.sortSearchResults(searchResults, sortBy, sortOrder);

      // Generate facets from filtered results
      const facets = this.generateSearchFacets(searchResults.map(r => r.template));

      // Apply pagination
      const total = searchResults.length;
      const startIndex = (page - 1) * limit;
      const paginatedResults = searchResults.slice(startIndex, startIndex + limit);

      // Convert to search result format
      const templates: TemplateSearchResult[] = paginatedResults.map(({ template, score }) => ({
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        tags: template.tags,
        price: template.price,
        rating: template.rating,
        downloads: template.downloads,
        thumbnail: template.thumbnail,
        author: {
          name: template.author.name,
          verified: template.author.verified
        },
        lastUpdated: template.lastUpdated,
        relevanceScore: score
      }));

      // Generate search suggestions
      const suggestions = query.trim() 
        ? await this.generateSearchSuggestions(query, allTemplates)
        : [];

      const queryTime = Date.now() - startTime;

      return {
        templates,
        total,
        page,
        limit,
        hasMore: startIndex + limit < total,
        facets,
        suggestions,
        queryTime
      };

    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Search failed');
    }
  }

  /**
   * Get search suggestions based on query
   */
  async getSearchSuggestions(query: string, limit: number = 8): Promise<string[]> {
    const allTemplates = await this.discoveryPlatform.getAllMarketplaceTemplates();
    return this.generateSearchSuggestions(query, allTemplates, limit);
  }

  /**
   * Get search facets for filtering
   */
  async getFacets(): Promise<SearchFacets> {
    const allTemplates = await this.discoveryPlatform.getAllMarketplaceTemplates();
    return this.generateSearchFacets(allTemplates);
  }

  /**
   * Save a search for later use
   */
  async saveSearch(savedSearch: SavedSearch): Promise<void> {
    this.savedSearches.set(savedSearch.id, savedSearch);
    await this.persistSavedSearches();
  }

  /**
   * Get all saved searches
   */
  async getSavedSearches(): Promise<SavedSearch[]> {
    return Array.from(this.savedSearches.values())
      .sort((a, b) => b.lastUsed?.getTime() || b.createdAt.getTime() - (a.lastUsed?.getTime() || a.createdAt.getTime()));
  }

  /**
   * Delete a saved search
   */
  async deleteSavedSearch(searchId: string): Promise<void> {
    this.savedSearches.delete(searchId);
    await this.persistSavedSearches();
  }

  /**
   * Add query to search history
   */
  async addToSearchHistory(query: string): Promise<void> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || this.searchHistory.includes(trimmedQuery)) {
      return;
    }

    this.searchHistory.unshift(trimmedQuery);
    this.searchHistory = this.searchHistory.slice(0, 50); // Keep only last 50 searches
    await this.persistSearchHistory();
  }

  /**
   * Get search history
   */
  async getSearchHistory(): Promise<string[]> {
    return [...this.searchHistory];
  }

  /**
   * Clear search history
   */
  async clearSearchHistory(): Promise<void> {
    this.searchHistory = [];
    await this.persistSearchHistory();
  }

  /**
   * Get popular search terms
   */
  async getPopularSearchTerms(limit: number = 10): Promise<Array<{ term: string; count: number }>> {
    // This would typically come from analytics data
    // For now, return mock popular terms
    return [
      { term: 'dashboard', count: 245 },
      { term: 'ecommerce', count: 189 },
      { term: 'saas', count: 156 },
      { term: 'portfolio', count: 134 },
      { term: 'landing page', count: 123 },
      { term: 'blog', count: 98 },
      { term: 'admin', count: 87 },
      { term: 'react', count: 76 },
      { term: 'nextjs', count: 65 },
      { term: 'tailwind', count: 54 }
    ].slice(0, limit);
  }

  /**
   * Get popular search queries (for analytics)
   */
  async getPopularSearchQueries(limit: number = 10): Promise<Array<{ query: string; count: number }>> {
    const terms = await this.getPopularSearchTerms(limit);
    return terms.map(term => ({ query: term.term, count: term.count }));
  }

  /**
   * Get search analytics
   */
  async getSearchAnalytics(): Promise<{
    totalSearches: number;
    uniqueQueries: number;
    averageResultsPerSearch: number;
    topQueries: Array<{ query: string; count: number }>;
    noResultQueries: string[];
  }> {
    // Mock analytics data
    return {
      totalSearches: 15847,
      uniqueQueries: 3421,
      averageResultsPerSearch: 12.3,
      topQueries: await this.getPopularSearchQueries(),
      noResultQueries: ['obscure template', 'very specific requirement']
    };
  }

  // Private helper methods

  private async initializeSearchIndex(): Promise<void> {
    const templates = await this.discoveryPlatform.getAllMarketplaceTemplates();
    
    templates.forEach(template => {
      const searchableText = [
        template.name,
        template.description,
        template.longDescription || '',
        template.category,
        ...template.tags,
        template.author.name,
        ...template.features.map(f => f.name),
        ...template.features.map(f => f.description)
      ].join(' ').toLowerCase();

      const tokens = this.tokenize(searchableText);
      this.searchIndex.set(template.id, tokens);
    });
  }

  private performTextSearch(
    templates: MarketplaceTemplate[], 
    query: string
  ): Array<{ template: MarketplaceTemplate; score: number }> {
    const queryTokens = this.tokenize(query.toLowerCase());
    const results: Array<{ template: MarketplaceTemplate; score: number }> = [];

    templates.forEach(template => {
      const templateTokens = this.searchIndex.get(template.id) || [];
      const score = this.calculateRelevanceScore(queryTokens, templateTokens, template);
      
      if (score > 0) {
        results.push({ template, score });
      }
    });

    return results.sort((a, b) => b.score - a.score);
  }

  private calculateRelevanceScore(
    queryTokens: string[], 
    templateTokens: string[], 
    template: MarketplaceTemplate
  ): number {
    let score = 0;

    queryTokens.forEach(queryToken => {
      // Exact matches in different fields have different weights
      if (template.name.toLowerCase().includes(queryToken)) {
        score += 10; // High weight for name matches
      }
      
      if (template.description.toLowerCase().includes(queryToken)) {
        score += 5; // Medium weight for description matches
      }

      if (template.tags.some(tag => tag.toLowerCase().includes(queryToken))) {
        score += 8; // High weight for tag matches
      }

      if (template.category.toLowerCase().includes(queryToken)) {
        score += 6; // Medium-high weight for category matches
      }

      // Count token occurrences
      const occurrences = templateTokens.filter(token => token.includes(queryToken)).length;
      score += occurrences * 2;
    });

    // Boost score based on template quality metrics
    score += template.rating * 2; // Rating boost
    score += Math.log(template.downloads + 1) * 0.5; // Download boost (logarithmic)
    
    if (template.isFeatured) score += 5;
    if (template.isPopular) score += 3;
    if (template.author.verified) score += 2;

    return score;
  }

  private applySearchFilters(
    results: Array<{ template: MarketplaceTemplate; score: number }>,
    filters: SearchFilters
  ): Array<{ template: MarketplaceTemplate; score: number }> {
    return results.filter(({ template }) => {
      // Categories filter
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

      // Authors filter
      if (filters.authors && filters.authors.length > 0) {
        if (!filters.authors.includes(template.author.name)) return false;
      }

      // Last updated filter
      if (filters.lastUpdated) {
        const now = new Date();
        const updatedAt = new Date(template.lastUpdated);
        const daysDiff = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);

        switch (filters.lastUpdated) {
          case '1d':
            if (daysDiff > 1) return false;
            break;
          case '7d':
            if (daysDiff > 7) return false;
            break;
          case '30d':
            if (daysDiff > 30) return false;
            break;
          case '90d':
            if (daysDiff > 90) return false;
            break;
        }
      }

      return true;
    });
  }

  private sortSearchResults(
    results: Array<{ template: MarketplaceTemplate; score: number }>,
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ): Array<{ template: MarketplaceTemplate; score: number }> {
    return results.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'relevance':
          comparison = b.score - a.score;
          break;
        case 'popular':
          comparison = b.template.downloads - a.template.downloads;
          break;
        case 'rating':
          comparison = b.template.rating - a.template.rating;
          break;
        case 'newest':
          comparison = new Date(b.template.lastUpdated).getTime() - new Date(a.template.lastUpdated).getTime();
          break;
        case 'price-low':
          comparison = a.template.price - b.template.price;
          break;
        case 'price-high':
          comparison = b.template.price - a.template.price;
          break;
        case 'name':
          comparison = a.template.name.localeCompare(b.template.name);
          break;
        default:
          comparison = b.score - a.score; // Default to relevance
      }

      return sortOrder === 'asc' ? -comparison : comparison;
    });
  }

  private generateSearchFacets(templates: MarketplaceTemplate[]): SearchFacets {
    const categories = new Map<string, number>();
    const tags = new Map<string, number>();
    const authors = new Map<string, number>();
    const ratings = new Map<number, number>();
    const priceRanges = new Map<string, number>();
    const complexity = new Map<string, number>();
    const industries = new Map<string, number>();

    templates.forEach(template => {
      // Categories
      categories.set(template.category, (categories.get(template.category) || 0) + 1);

      // Tags
      template.tags.forEach(tag => {
        tags.set(tag, (tags.get(tag) || 0) + 1);
      });

      // Authors
      authors.set(template.author.name, (authors.get(template.author.name) || 0) + 1);

      // Ratings (rounded)
      const roundedRating = Math.floor(template.rating);
      ratings.set(roundedRating, (ratings.get(roundedRating) || 0) + 1);

      // Price ranges
      let priceRange: string;
      if (template.isFree) {
        priceRange = 'Free';
      } else if (template.price < 25) {
        priceRange = '$1-$24';
      } else if (template.price < 50) {
        priceRange = '$25-$49';
      } else if (template.price < 100) {
        priceRange = '$50-$99';
      } else {
        priceRange = '$100+';
      }
      priceRanges.set(priceRange, (priceRanges.get(priceRange) || 0) + 1);

      // Complexity (from metadata)
      const level = template.metadata.difficulty;
      complexity.set(level, (complexity.get(level) || 0) + 1);

      // Industries (from tags - simplified)
      const industryTags = template.tags.filter(tag => 
        ['healthcare', 'finance', 'education', 'retail', 'saas', 'ecommerce'].includes(tag)
      );
      industryTags.forEach(industry => {
        industries.set(industry, (industries.get(industry) || 0) + 1);
      });
    });

    return {
      categories: Array.from(categories.entries()).map(([name, count]) => ({ name, count })),
      tags: Array.from(tags.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20), // Top 20 tags
      authors: Array.from(authors.entries()).map(([name, count]) => ({ name, count })),
      ratings: Array.from(ratings.entries()).map(([rating, count]) => ({ rating, count })),
      priceRanges: Array.from(priceRanges.entries()).map(([range, count]) => ({ range, count })),
      complexity: Array.from(complexity.entries()).map(([level, count]) => ({ level, count })),
      industries: Array.from(industries.entries()).map(([name, count]) => ({ name, count }))
    };
  }

  private async generateSearchSuggestions(
    query: string, 
    templates: MarketplaceTemplate[], 
    limit: number = 8
  ): Promise<string[]> {
    const queryLower = query.toLowerCase();
    const suggestions = new Set<string>();

    // Template name suggestions
    templates.forEach(template => {
      if (template.name.toLowerCase().includes(queryLower)) {
        suggestions.add(template.name);
      }
    });

    // Category suggestions
    const categories = new Set(templates.map(t => t.category));
    categories.forEach(category => {
      if (category.toLowerCase().includes(queryLower)) {
        suggestions.add(category);
      }
    });

    // Tag suggestions
    const allTags = new Set<string>();
    templates.forEach(template => {
      template.tags.forEach(tag => allTags.add(tag));
    });
    allTags.forEach(tag => {
      if (tag.toLowerCase().includes(queryLower)) {
        suggestions.add(tag);
      }
    });

    // Popular search completions
    const popularTerms = await this.getPopularSearchTerms();
    popularTerms.forEach(({ term }) => {
      if (term.toLowerCase().includes(queryLower)) {
        suggestions.add(term);
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Replace non-word characters with spaces
      .split(/\s+/) // Split on whitespace
      .filter(token => token.length > 2 && !this.stopWords.has(token)); // Filter short words and stop words
  }

  private async loadSavedData(): Promise<void> {
    // In a real implementation, this would load from persistent storage
    // For now, we'll use mock data
    this.searchHistory = [
      'dashboard template',
      'ecommerce starter',
      'saas analytics',
      'portfolio design',
      'landing page'
    ];

    const mockSavedSearch: SavedSearch = {
      id: 'saved-1',
      name: 'SaaS Templates',
      query: 'saas dashboard',
      filters: {
        categories: ['dashboard'],
        tags: ['saas'],
        priceRange: [0, 100]
      },
      createdAt: new Date('2024-01-01'),
      lastUsed: new Date('2024-01-15'),
      useCount: 5
    };

    this.savedSearches.set(mockSavedSearch.id, mockSavedSearch);
  }

  private async persistSavedSearches(): Promise<void> {
    // In a real implementation, this would save to persistent storage
    console.log('Saving searches to storage...');
  }

  private async persistSearchHistory(): Promise<void> {
    // In a real implementation, this would save to persistent storage
    console.log('Saving search history to storage...');
  }
}
