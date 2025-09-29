/**
 * Route Generator System
 * 
 * Generates dynamic routes from templates with URL structure management,
 * SEO optimization, and custom domain support for tenant apps.
 */

import { TemplateManifest } from '../../types/componentContracts';

export interface RouteConfig {
  id: string;
  templateId: string;
  tenantId: string;
  path: string;
  fullUrl: string;
  customDomain?: string;
  seo: SEOConfig;
  metadata: RouteMetadata;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  robots?: 'index' | 'noindex' | 'follow' | 'nofollow';
  sitemap?: boolean;
  priority?: number;
}

export interface RouteMetadata {
  componentCount: number;
  lastModified: string;
  version: string;
  tags: string[];
  category: string;
  estimatedLoadTime: number;
  accessibilityScore?: number;
  performanceScore?: number;
}

export interface URLStructure {
  baseUrl: string;
  tenantSlug: string;
  templateSlug: string;
  customPath?: string;
  queryParams?: Record<string, string>;
}

export interface RouteValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

class RouteGenerator {
  private routes = new Map<string, RouteConfig>();
  private urlConflicts = new Map<string, string[]>();

  /**
   * Generate a route from a template manifest
   */
  generateRoute(
    template: TemplateManifest,
    tenantId: string,
    options: {
      customPath?: string;
      customDomain?: string;
      seoOverrides?: Partial<SEOConfig>;
    } = {}
  ): RouteConfig {
    // Check if a route already exists for this template and tenant
    const existingRoute = this.findExistingRoute(template.id, tenantId, options);
    if (existingRoute) {
      return existingRoute;
    }

    const routeId = this.generateRouteId(template.id, tenantId);
    const urlStructure = this.buildURLStructure(template, tenantId, options);
    const seoConfig = this.generateSEOConfig(template, urlStructure, options.seoOverrides);
    const metadata = this.generateRouteMetadata(template);

    const route: RouteConfig = {
      id: routeId,
      templateId: template.id,
      tenantId,
      path: urlStructure.customPath || `/${urlStructure.tenantSlug}/${urlStructure.templateSlug}`,
      fullUrl: this.buildFullUrl(urlStructure, options.customDomain),
      customDomain: options.customDomain,
      seo: seoConfig,
      metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };

    // Validate route
    const validation = this.validateRoute(route);
    if (!validation.isValid) {
      throw new Error(`Route validation failed: ${validation.errors.join(', ')}`);
    }

    // Check for conflicts
    this.checkURLConflicts(route);

    // Store route
    this.routes.set(routeId, route);

    return route;
  }

  /**
   * Generate multiple routes for a template (e.g., different languages, A/B tests)
   */
  generateMultipleRoutes(
    template: TemplateManifest,
    tenantId: string,
    variations: Array<{
      customPath?: string;
      customDomain?: string;
      seoOverrides?: Partial<SEOConfig>;
      language?: string;
      variant?: string;
    }>
  ): RouteConfig[] {
    return variations.map((variation, index) => {
      const route = this.generateRoute(template, tenantId, variation);
      
      // Add variation identifier to route ID
      if (variation.language || variation.variant) {
        route.id = `${route.id}_${variation.language || variation.variant || index}`;
      }

      return route;
    });
  }

  /**
   * Update an existing route
   */
  updateRoute(
    routeId: string,
    updates: Partial<RouteConfig>
  ): RouteConfig {
    const existingRoute = this.routes.get(routeId);
    if (!existingRoute) {
      throw new Error(`Route ${routeId} not found`);
    }

    const updatedRoute: RouteConfig = {
      ...existingRoute,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Validate updated route
    const validation = this.validateRoute(updatedRoute);
    if (!validation.isValid) {
      throw new Error(`Route validation failed: ${validation.errors.join(', ')}`);
    }

    this.routes.set(routeId, updatedRoute);
    return updatedRoute;
  }

  /**
   * Delete a route
   */
  deleteRoute(routeId: string): boolean {
    return this.routes.delete(routeId);
  }

  /**
   * Get route by ID
   */
  getRoute(routeId: string): RouteConfig | null {
    return this.routes.get(routeId) || null;
  }

  /**
   * Get all routes for a tenant
   */
  getTenantRoutes(tenantId: string): RouteConfig[] {
    return Array.from(this.routes.values())
      .filter(route => route.tenantId === tenantId);
  }

  /**
   * Get all routes for a template
   */
  getTemplateRoutes(templateId: string): RouteConfig[] {
    return Array.from(this.routes.values())
      .filter(route => route.templateId === templateId);
  }

  /**
   * Resolve route from URL
   */
  resolveRoute(url: string): RouteConfig | null {
    for (const route of this.routes.values()) {
      if (route.fullUrl === url || route.path === url) {
        return route;
      }
    }
    return null;
  }

  /**
   * Generate sitemap for a tenant
   */
  generateSitemap(tenantId: string): string {
    const routes = this.getTenantRoutes(tenantId)
      .filter(route => route.isActive && route.seo.sitemap !== false);

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `  <url>
    <loc>${route.fullUrl}</loc>
    <lastmod>${route.updatedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route.seo.priority || 0.5}</priority>
  </url>`).join('\n')}
</urlset>`;

    return sitemap;
  }

  /**
   * Generate robots.txt for a tenant
   */
  generateRobotsTxt(tenantId: string, baseUrl: string): string {
    const routes = this.getTenantRoutes(tenantId);
    const disallowedPaths = routes
      .filter(route => route.seo.robots === 'noindex')
      .map(route => route.path);

    let robots = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;

    if (disallowedPaths.length > 0) {
      robots += `\nDisallow: ${disallowedPaths.join('\nDisallow: ')}`;
    }

    return robots;
  }

  /**
   * Validate route configuration
   */
  validateRoute(route: RouteConfig): RouteValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check required fields
    if (!route.id) errors.push('Route ID is required');
    if (!route.templateId) errors.push('Template ID is required');
    if (!route.tenantId) errors.push('Tenant ID is required');
    if (!route.path) errors.push('Route path is required');
    if (!route.fullUrl) errors.push('Full URL is required');

    // Validate path format
    if (route.path && !route.path.startsWith('/')) {
      errors.push('Route path must start with /');
    }

    // Validate URL format
    if (route.fullUrl) {
      try {
        new URL(route.fullUrl);
      } catch {
        errors.push('Invalid full URL format');
      }
    }

    // Check SEO configuration
    if (!route.seo.title) warnings.push('SEO title is missing');
    if (!route.seo.description) warnings.push('SEO description is missing');
    if (route.seo.description && route.seo.description.length > 160) {
      warnings.push('SEO description is too long (should be under 160 characters)');
    }

    // Check for URL conflicts
    const conflicts = this.urlConflicts.get(route.fullUrl);
    if (conflicts && conflicts.length > 1) {
      errors.push(`URL conflict detected: ${conflicts.join(', ')}`);
    }

    // Performance suggestions
    if (route.metadata.estimatedLoadTime > 3000) {
      suggestions.push('Consider optimizing template for faster loading');
    }

    if (route.metadata.componentCount > 20) {
      suggestions.push('Consider reducing component count for better performance');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Get route analytics
   */
  getRouteAnalytics(tenantId: string): {
    totalRoutes: number;
    activeRoutes: number;
    customDomains: number;
    avgLoadTime: number;
    seoScore: number;
  } {
    const routes = this.getTenantRoutes(tenantId);
    const activeRoutes = routes.filter(route => route.isActive);
    const customDomains = new Set(routes.map(route => route.customDomain).filter(Boolean)).size;
    const avgLoadTime = routes.reduce((sum, route) => sum + route.metadata.estimatedLoadTime, 0) / routes.length;
    
    // Calculate SEO score based on completeness
    const seoScore = routes.reduce((sum, route) => {
      let score = 0;
      if (route.seo.title) score += 25;
      if (route.seo.description) score += 25;
      if (route.seo.keywords.length > 0) score += 25;
      if (route.seo.ogImage) score += 25;
      return sum + score;
    }, 0) / routes.length;

    return {
      totalRoutes: routes.length,
      activeRoutes: activeRoutes.length,
      customDomains,
      avgLoadTime: Math.round(avgLoadTime),
      seoScore: Math.round(seoScore)
    };
  }

  // Private helper methods

  private generateRouteId(templateId: string, tenantId: string): string {
    return `route_${tenantId}_${templateId}_${Date.now()}`;
  }

  private buildURLStructure(
    template: TemplateManifest,
    tenantId: string,
    options: any
  ): URLStructure {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://app.example.com';
    const tenantSlug = this.slugify(tenantId);
    const templateSlug = template.slug;

    return {
      baseUrl,
      tenantSlug,
      templateSlug,
      customPath: options.customPath,
      queryParams: options.queryParams
    };
  }

  private buildFullUrl(urlStructure: URLStructure, customDomain?: string): string {
    if (customDomain) {
      return `https://${customDomain}${urlStructure.customPath || `/${urlStructure.tenantSlug}/${urlStructure.templateSlug}`}`;
    }

    const path = urlStructure.customPath || `/${urlStructure.tenantSlug}/${urlStructure.templateSlug}`;
    return `${urlStructure.baseUrl}${path}`;
  }

  private generateSEOConfig(
    template: TemplateManifest,
    urlStructure: URLStructure,
    overrides?: Partial<SEOConfig>
  ): SEOConfig {
    const baseTitle = template.name;
    const baseDescription = template.description || `Professional ${template.category} template`;

    return {
      title: overrides?.title || `${baseTitle} | ${urlStructure.tenantSlug}`,
      description: overrides?.description || baseDescription,
      keywords: overrides?.keywords || this.extractKeywords(template),
      canonicalUrl: overrides?.canonicalUrl,
      ogImage: overrides?.ogImage,
      ogTitle: overrides?.ogTitle || baseTitle,
      ogDescription: overrides?.ogDescription || baseDescription,
      twitterCard: overrides?.twitterCard || 'summary_large_image',
      robots: overrides?.robots || 'index',
      sitemap: overrides?.sitemap !== false,
      priority: overrides?.priority || 0.5
    };
  }

  private generateRouteMetadata(template: TemplateManifest): RouteMetadata {
    const componentCount = template.components.length;
    const estimatedLoadTime = this.estimateLoadTime(template);

    return {
      componentCount,
      lastModified: new Date().toISOString(),
      version: template.metadata?.version || template.version,
      tags: template.metadata?.tags || [],
      category: template.category,
      estimatedLoadTime
    };
  }

  private extractKeywords(template: TemplateManifest): string[] {
    const keywords = new Set<string>();
    
    // Add category
    keywords.add(template.category);
    
    // Add tags
    if (template.metadata?.tags) {
      template.metadata.tags.forEach(tag => keywords.add(tag));
    }
    
    // Add component types
    template.components.forEach(component => {
      keywords.add(component.type);
    });
    
    // Add common keywords based on category
    const categoryKeywords: Record<string, string[]> = {
      'landing-page': ['landing page', 'conversion', 'marketing'],
      'business-website': ['business', 'corporate', 'professional'],
      'portfolio': ['portfolio', 'creative', 'showcase'],
      'ecommerce': ['ecommerce', 'online store', 'shopping'],
      'blog': ['blog', 'content', 'articles']
    };
    
    if (categoryKeywords[template.category]) {
      categoryKeywords[template.category].forEach(keyword => keywords.add(keyword));
    }
    
    return Array.from(keywords);
  }

  private estimateLoadTime(template: TemplateManifest): number {
    let baseTime = 500; // Base load time in ms
    
    // Add time based on component count
    baseTime += template.components.length * 50;
    
    // Add time for complex components
    const complexComponents = ['hero', 'feature_grid', 'pricing', 'contact'];
    const complexCount = template.components.filter(comp => 
      complexComponents.includes(comp.type)
    ).length;
    baseTime += complexCount * 100;
    
    // Add time for media components
    const mediaComponents = ['image', 'video'];
    const mediaCount = template.components.filter(comp => 
      mediaComponents.includes(comp.type)
    ).length;
    baseTime += mediaCount * 200;
    
    return Math.min(baseTime, 5000); // Cap at 5 seconds
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private findExistingRoute(
    templateId: string, 
    tenantId: string, 
    options: { customPath?: string; customDomain?: string; seoOverrides?: Partial<SEOConfig> } = {}
  ): RouteConfig | null {
    // Look for existing routes with the same template and tenant
    for (const route of this.routes.values()) {
      if (route.templateId === templateId && route.tenantId === tenantId) {
        // Check if the options match (custom path and domain)
        const urlStructure = this.buildURLStructure(
          { id: templateId } as TemplateManifest, 
          tenantId, 
          options
        );
        const expectedPath = urlStructure.customPath || `/${urlStructure.tenantSlug}/${urlStructure.templateSlug}`;
        const expectedFullUrl = this.buildFullUrl(urlStructure, options.customDomain);
        
        if (route.path === expectedPath && route.fullUrl === expectedFullUrl) {
          return route;
        }
      }
    }
    return null;
  }

  private checkURLConflicts(route: RouteConfig): void {
    const existingConflicts = this.urlConflicts.get(route.fullUrl) || [];
    
    // If there are existing routes with the same URL, throw an error
    if (existingConflicts.length > 0) {
      const conflictIds = existingConflicts.join(', ');
      throw new Error(`URL conflict detected: ${conflictIds}, ${route.id}`);
    }
    
    // Add this route to the conflicts map
    existingConflicts.push(route.id);
    this.urlConflicts.set(route.fullUrl, existingConflicts);
  }
}

// Global instance
let globalRouteGenerator: RouteGenerator;

export function getRouteGenerator(): RouteGenerator {
  if (!globalRouteGenerator) {
    globalRouteGenerator = new RouteGenerator();
  }
  return globalRouteGenerator;
}

export function createRouteGenerator(): RouteGenerator {
  return new RouteGenerator();
}

export default RouteGenerator;
