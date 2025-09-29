import { z } from 'zod';

export interface TemplateMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    email: string;
    organization?: string;
  };
  created: Date;
  updated: Date;
  compatibility: {
    minVersion: string;
    maxVersion?: string;
    dependencies: Record<string, string>;
    conflicts?: string[];
  };
  permissions: {
    read: string[];
    write: string[];
    execute: string[];
  };
  customization: {
    supportedPoints: string[];
    requiredPoints: string[];
    aiTargets: string[];
    clientTypes: string[];
  };
  performance: {
    buildTime: number;
    memoryUsage: number;
    bundleSize: number;
    renderTime: number;
  };
  security: {
    scanResults: SecurityScanResult[];
    vulnerabilities: VulnerabilityReport[];
    complianceChecks: ComplianceCheck[];
  };
  analytics: {
    usage: UsageMetrics;
    performance: PerformanceMetrics;
    feedback: FeedbackMetrics;
  };
  documentation: {
    readme?: string;
    examples?: DocumentationExample[];
    guides?: DocumentationGuide[];
    api?: APIDocumentation;
  };
  deployment: {
    environments: string[];
    requirements: DeploymentRequirement[];
    scripts: DeploymentScript[];
  };
  testing: {
    coverage: number;
    testSuites: TestSuite[];
    lastRun: Date;
    status: 'passing' | 'failing' | 'unknown';
  };
}

export interface SecurityScanResult {
  scanner: string;
  version: string;
  timestamp: Date;
  status: 'passed' | 'failed' | 'warning';
  findings: SecurityFinding[];
  score: number;
}

export interface SecurityFinding {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  description: string;
  file?: string;
  line?: number;
  remediation?: string;
}

export interface VulnerabilityReport {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedVersions: string[];
  fixedVersion?: string;
  references: string[];
  cve?: string;
}

export interface ComplianceCheck {
  standard: string;
  version: string;
  status: 'compliant' | 'non-compliant' | 'partial';
  requirements: ComplianceRequirement[];
  lastCheck: Date;
}

export interface ComplianceRequirement {
  id: string;
  title: string;
  status: 'met' | 'not-met' | 'partial';
  evidence?: string[];
  remediation?: string;
}

export interface UsageMetrics {
  totalDownloads: number;
  monthlyActiveUsers: number;
  deployments: number;
  lastUsed: Date;
  popularFeatures: FeatureUsage[];
}

export interface FeatureUsage {
  feature: string;
  usage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface PerformanceMetrics {
  averageBuildTime: number;
  averageRenderTime: number;
  errorRate: number;
  uptime: number;
  resourceUsage: ResourceUsage;
}

export interface ResourceUsage {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

export interface FeedbackMetrics {
  rating: number;
  reviews: Review[];
  issues: Issue[];
  featureRequests: FeatureRequest[];
}

export interface Review {
  rating: number;
  comment: string;
  author: string;
  date: Date;
  helpful: number;
}

export interface Issue {
  id: string;
  title: string;
  status: 'open' | 'closed' | 'in-progress';
  priority: 'low' | 'medium' | 'high' | 'critical';
  reporter: string;
  created: Date;
  resolved?: Date;
}

export interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  votes: number;
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  requestedBy: string;
  created: Date;
}

export interface DocumentationExample {
  title: string;
  description: string;
  code: string;
  language: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface DocumentationGuide {
  title: string;
  description: string;
  content: string;
  category: string;
  estimatedTime: number;
  prerequisites: string[];
}

export interface APIDocumentation {
  endpoints: APIEndpoint[];
  schemas: APISchema[];
  examples: APIExample[];
}

export interface APIEndpoint {
  path: string;
  method: string;
  description: string;
  parameters: APIParameter[];
  responses: APIResponse[];
  examples: APIExample[];
}

export interface APIParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
  default?: any;
  validation?: ValidationRule[];
}

export interface APIResponse {
  status: number;
  description: string;
  schema?: string;
  examples?: any[];
}

export interface APIExample {
  title: string;
  description: string;
  request?: any;
  response?: any;
}

export interface APISchema {
  name: string;
  description: string;
  properties: Record<string, SchemaProperty>;
  required: string[];
}

export interface SchemaProperty {
  type: string;
  description: string;
  format?: string;
  enum?: any[];
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: string;
  value: any;
  message: string;
}

export interface DeploymentRequirement {
  type: 'system' | 'software' | 'network' | 'security';
  name: string;
  version?: string;
  description: string;
  required: boolean;
  alternatives?: string[];
}

export interface DeploymentScript {
  name: string;
  description: string;
  type: 'build' | 'test' | 'deploy' | 'migrate' | 'cleanup';
  command: string;
  environment?: string;
  timeout?: number;
  retries?: number;
}

export interface TestSuite {
  name: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance' | 'security';
  coverage: number;
  tests: TestCase[];
  lastRun: Date;
  duration: number;
  status: 'passed' | 'failed' | 'skipped';
}

export interface TestCase {
  name: string;
  description: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
}

const MetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  description: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  author: z.object({
    name: z.string(),
    email: z.string().email(),
    organization: z.string().optional(),
  }),
  created: z.date(),
  updated: z.date(),
  compatibility: z.object({
    minVersion: z.string(),
    maxVersion: z.string().optional(),
    dependencies: z.record(z.string()),
    conflicts: z.array(z.string()).optional(),
  }),
  permissions: z.object({
    read: z.array(z.string()),
    write: z.array(z.string()),
    execute: z.array(z.string()),
  }),
  customization: z.object({
    supportedPoints: z.array(z.string()),
    requiredPoints: z.array(z.string()),
    aiTargets: z.array(z.string()),
    clientTypes: z.array(z.string()),
  }),
});

export class TemplateMetadataManager {
  private metadata: Map<string, TemplateMetadata> = new Map();
  private cache: Map<string, any> = new Map();
  private indexes: Map<string, Map<string, Set<string>>> = new Map();

  constructor() {
    this.initializeIndexes();
  }

  private initializeIndexes(): void {
    this.indexes.set('category', new Map());
    this.indexes.set('tag', new Map());
    this.indexes.set('author', new Map());
    this.indexes.set('compatibility', new Map());
    this.indexes.set('performance', new Map());
  }

  async createMetadata(metadata: Partial<TemplateMetadata>): Promise<TemplateMetadata> {
    const id = metadata.id || this.generateId();
    const now = new Date();

    const fullMetadata: TemplateMetadata = {
      id,
      name: metadata.name || 'Untitled Template',
      version: metadata.version || '1.0.0',
      description: metadata.description || '',
      category: metadata.category || 'general',
      tags: metadata.tags || [],
      author: metadata.author || {
        name: 'Unknown',
        email: 'unknown@example.com',
      },
      created: metadata.created || now,
      updated: now,
      compatibility: metadata.compatibility || {
        minVersion: '1.0.0',
        dependencies: {},
      },
      permissions: metadata.permissions || {
        read: ['public'],
        write: ['admin'],
        execute: ['admin'],
      },
      customization: metadata.customization || {
        supportedPoints: [],
        requiredPoints: [],
        aiTargets: [],
        clientTypes: [],
      },
      performance: metadata.performance || {
        buildTime: 0,
        memoryUsage: 0,
        bundleSize: 0,
        renderTime: 0,
      },
      security: metadata.security || {
        scanResults: [],
        vulnerabilities: [],
        complianceChecks: [],
      },
      analytics: metadata.analytics || {
        usage: {
          totalDownloads: 0,
          monthlyActiveUsers: 0,
          deployments: 0,
          lastUsed: now,
          popularFeatures: [],
        },
        performance: {
          averageBuildTime: 0,
          averageRenderTime: 0,
          errorRate: 0,
          uptime: 100,
          resourceUsage: {
            cpu: 0,
            memory: 0,
            disk: 0,
            network: 0,
          },
        },
        feedback: {
          rating: 0,
          reviews: [],
          issues: [],
          featureRequests: [],
        },
      },
      documentation: metadata.documentation || {},
      deployment: metadata.deployment || {
        environments: [],
        requirements: [],
        scripts: [],
      },
      testing: metadata.testing || {
        coverage: 0,
        testSuites: [],
        lastRun: now,
        status: 'unknown',
      },
    };

    try {
      MetadataSchema.parse(fullMetadata);
    } catch (error) {
      throw new Error(`Invalid metadata: ${error}`);
    }

    this.metadata.set(id, fullMetadata);
    this.updateIndexes(fullMetadata);
    this.clearCache();

    return fullMetadata;
  }

  async getMetadata(id: string): Promise<TemplateMetadata | null> {
    return this.metadata.get(id) || null;
  }

  async updateMetadata(id: string, updates: Partial<TemplateMetadata>): Promise<TemplateMetadata | null> {
    const existing = this.metadata.get(id);
    if (!existing) {
      return null;
    }

    const updated = {
      ...existing,
      ...updates,
      id: existing.id,
      created: existing.created,
      updated: new Date(),
    };

    try {
      MetadataSchema.parse(updated);
    } catch (error) {
      throw new Error(`Invalid metadata update: ${error}`);
    }

    this.metadata.set(id, updated);
    this.updateIndexes(updated);
    this.clearCache();

    return updated;
  }

  async deleteMetadata(id: string): Promise<boolean> {
    const metadata = this.metadata.get(id);
    if (!metadata) {
      return false;
    }

    this.metadata.delete(id);
    this.removeFromIndexes(metadata);
    this.clearCache();

    return true;
  }

  async searchMetadata(query: MetadataSearchQuery): Promise<TemplateMetadata[]> {
    const cacheKey = JSON.stringify(query);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    let results = Array.from(this.metadata.values());

    if (query.text) {
      const searchText = query.text.toLowerCase();
      results = results.filter(metadata =>
        metadata.name.toLowerCase().includes(searchText) ||
        metadata.description.toLowerCase().includes(searchText) ||
        metadata.tags.some(tag => tag.toLowerCase().includes(searchText))
      );
    }

    if (query.category) {
      results = results.filter(metadata => metadata.category === query.category);
    }

    if (query.tags && query.tags.length > 0) {
      results = results.filter(metadata =>
        query.tags!.every(tag => metadata.tags.includes(tag))
      );
    }

    if (query.author) {
      results = results.filter(metadata =>
        metadata.author.name === query.author ||
        metadata.author.email === query.author
      );
    }

    if (query.minRating) {
      results = results.filter(metadata =>
        metadata.analytics.feedback.rating >= query.minRating!
      );
    }

    if (query.compatibility) {
      results = results.filter(metadata =>
        this.isCompatible(metadata.compatibility, query.compatibility!)
      );
    }

    if (query.performance) {
      results = results.filter(metadata =>
        this.meetsPerformanceRequirements(metadata.performance, query.performance!)
      );
    }

    if (query.security) {
      results = results.filter(metadata =>
        this.meetsSecurityRequirements(metadata.security, query.security!)
      );
    }

    if (query.sortBy) {
      results = this.sortResults(results, query.sortBy, query.sortOrder || 'desc');
    }

    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    this.cache.set(cacheKey, results);
    return results;
  }

  async getMetadataStats(): Promise<MetadataStats> {
    const allMetadata = Array.from(this.metadata.values());

    const categories = new Map<string, number>();
    const authors = new Map<string, number>();
    const tags = new Map<string, number>();
    let totalSize = 0;
    let totalBuildTime = 0;
    let totalRating = 0;

    for (const metadata of allMetadata) {
      categories.set(metadata.category, (categories.get(metadata.category) || 0) + 1);
      authors.set(metadata.author.name, (authors.get(metadata.author.name) || 0) + 1);

      for (const tag of metadata.tags) {
        tags.set(tag, (tags.get(tag) || 0) + 1);
      }

      totalSize += metadata.performance.bundleSize;
      totalBuildTime += metadata.performance.buildTime;
      totalRating += metadata.analytics.feedback.rating;
    }

    return {
      total: allMetadata.length,
      categories: Object.fromEntries(categories),
      authors: Object.fromEntries(authors),
      popularTags: Object.fromEntries(
        Array.from(tags.entries())
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
      ),
      averageSize: allMetadata.length > 0 ? totalSize / allMetadata.length : 0,
      averageBuildTime: allMetadata.length > 0 ? totalBuildTime / allMetadata.length : 0,
      averageRating: allMetadata.length > 0 ? totalRating / allMetadata.length : 0,
      lastUpdated: new Date(),
    };
  }

  async validateMetadata(metadata: TemplateMetadata): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      MetadataSchema.parse(metadata);
    } catch (error) {
      errors.push({
        field: 'schema',
        message: `Schema validation failed: ${error}`,
        severity: 'error',
      });
    }

    if (metadata.performance.buildTime > 300000) {
      warnings.push({
        field: 'performance.buildTime',
        message: 'Build time exceeds 5 minutes',
        severity: 'warning',
      });
    }

    if (metadata.performance.bundleSize > 10485760) {
      warnings.push({
        field: 'performance.bundleSize',
        message: 'Bundle size exceeds 10MB',
        severity: 'warning',
      });
    }

    if (metadata.security.vulnerabilities.some(v => v.severity === 'critical')) {
      errors.push({
        field: 'security.vulnerabilities',
        message: 'Contains critical security vulnerabilities',
        severity: 'error',
      });
    }

    if (metadata.testing.coverage < 80) {
      warnings.push({
        field: 'testing.coverage',
        message: 'Test coverage below 80%',
        severity: 'warning',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private generateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private updateIndexes(metadata: TemplateMetadata): void {
    const categoryIndex = this.indexes.get('category')!;
    const tagIndex = this.indexes.get('tag')!;
    const authorIndex = this.indexes.get('author')!;

    if (!categoryIndex.has(metadata.category)) {
      categoryIndex.set(metadata.category, new Set());
    }
    categoryIndex.get(metadata.category)!.add(metadata.id);

    for (const tag of metadata.tags) {
      if (!tagIndex.has(tag)) {
        tagIndex.set(tag, new Set());
      }
      tagIndex.get(tag)!.add(metadata.id);
    }

    if (!authorIndex.has(metadata.author.name)) {
      authorIndex.set(metadata.author.name, new Set());
    }
    authorIndex.get(metadata.author.name)!.add(metadata.id);
  }

  private removeFromIndexes(metadata: TemplateMetadata): void {
    const categoryIndex = this.indexes.get('category')!;
    const tagIndex = this.indexes.get('tag')!;
    const authorIndex = this.indexes.get('author')!;

    categoryIndex.get(metadata.category)?.delete(metadata.id);

    for (const tag of metadata.tags) {
      tagIndex.get(tag)?.delete(metadata.id);
    }

    authorIndex.get(metadata.author.name)?.delete(metadata.id);
  }

  private clearCache(): void {
    this.cache.clear();
  }

  private isCompatible(metadata: any, requirements: any): boolean {
    return true;
  }

  private meetsPerformanceRequirements(performance: any, requirements: any): boolean {
    return true;
  }

  private meetsSecurityRequirements(security: any, requirements: any): boolean {
    return true;
  }

  private sortResults(results: TemplateMetadata[], sortBy: string, order: 'asc' | 'desc'): TemplateMetadata[] {
    return results.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = a.created.getTime() - b.created.getTime();
          break;
        case 'updated':
          comparison = a.updated.getTime() - b.updated.getTime();
          break;
        case 'rating':
          comparison = a.analytics.feedback.rating - b.analytics.feedback.rating;
          break;
        case 'downloads':
          comparison = a.analytics.usage.totalDownloads - b.analytics.usage.totalDownloads;
          break;
        default:
          return 0;
      }

      return order === 'asc' ? comparison : -comparison;
    });
  }
}

export interface MetadataSearchQuery {
  text?: string;
  category?: string;
  tags?: string[];
  author?: string;
  minRating?: number;
  compatibility?: any;
  performance?: any;
  security?: any;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

export interface MetadataStats {
  total: number;
  categories: Record<string, number>;
  authors: Record<string, number>;
  popularTags: Record<string, number>;
  averageSize: number;
  averageBuildTime: number;
  averageRating: number;
  lastUpdated: Date;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error';
}

export interface ValidationWarning {
  field: string;
  message: string;
  severity: 'warning';
}

export const metadataManager = new TemplateMetadataManager();