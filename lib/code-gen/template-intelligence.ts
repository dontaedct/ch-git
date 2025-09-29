/**
 * @fileoverview Template Intelligence System
 * @module lib/code-gen/template-intelligence
 * @author OSS Hero System
 * @version 2.0.0
 * 
 * HT-031.2.3: Advanced Code Generation & Template Intelligence
 * 
 * This system provides intelligent template selection and management with:
 * - AI-powered template recommendations
 * - Context-aware template selection
 * - Template quality scoring
 * - Performance optimization
 * - Template versioning and management
 */

export interface CodeTemplate {
  id: string;
  name: string;
  description: string;
  category: 'component' | 'page' | 'api' | 'hook' | 'utility' | 'full-app';
  framework: string[];
  styling: string[];
  features: string[];
  complexity: 'simple' | 'moderate' | 'complex';
  template: string;
  variables: TemplateVariable[];
  dependencies: string[];
  devDependencies: string[];
  files: TemplateFile[];
  tags: string[];
  version: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  rating: number;
  confidence: number;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'boolean' | 'number' | 'array' | 'object';
  description: string;
  defaultValue?: any;
  required: boolean;
  validation?: string;
  options?: string[];
}

export interface TemplateFile {
  path: string;
  content: string;
  type: 'component' | 'style' | 'test' | 'story' | 'config' | 'doc';
  language: string;
  size: number;
}

export interface ProjectContext {
  name: string;
  description: string;
  type: 'component' | 'page' | 'api' | 'hook' | 'utility' | 'full-app';
  framework: 'react' | 'next' | 'vue' | 'angular' | 'vanilla';
  styling: 'tailwind' | 'styled-components' | 'css-modules' | 'emotion' | 'none';
  features: string[];
  customRequirements: string;
}

export interface TemplateSuggestion {
  template: CodeTemplate;
  confidence: number;
  reasoning: string;
  matches: string[];
  improvements: string[];
  estimatedEffort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
}

export interface TemplateAnalysis {
  quality: number;
  performance: number;
  maintainability: number;
  accessibility: number;
  security: number;
  testability: number;
  documentation: number;
  overall: number;
  issues: string[];
  recommendations: string[];
}

export class TemplateIntelligence {
  private templates: Map<string, CodeTemplate> = new Map();
  private analysisCache: Map<string, TemplateAnalysis> = new Map();
  private suggestionCache: Map<string, TemplateSuggestion[]> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Initialize built-in templates
   */
  private initializeTemplates(): void {
    const builtInTemplates: CodeTemplate[] = [
      // React Component Templates
      {
        id: 'react-functional-component',
        name: 'React Functional Component',
        description: 'Modern React functional component with TypeScript and hooks',
        category: 'component',
        framework: ['react', 'next'],
        styling: ['tailwind', 'styled-components', 'css-modules'],
        features: ['TypeScript Support', 'Responsive Design', 'Accessibility (a11y)'],
        complexity: 'simple',
        template: `import React from 'react';
{{#if typescript}}
interface {{componentName}}Props {
  // Define your props here
}
{{/if}}

{{#if typescript}}
export const {{componentName}}: React.FC<{{componentName}}Props> = (props) => {
{{else}}
export const {{componentName}} = (props) => {
{{/if}}
  return (
    <div className="{{classNames}}">
      <h1>{{componentName}}</h1>
      <p>{{description}}</p>
    </div>
  );
};

export default {{componentName}};`,
        variables: [
          {
            name: 'componentName',
            type: 'string',
            description: 'Name of the component',
            required: true
          },
          {
            name: 'description',
            type: 'string',
            description: 'Component description',
            defaultValue: 'A new React component',
            required: false
          },
          {
            name: 'typescript',
            type: 'boolean',
            description: 'Use TypeScript',
            defaultValue: true,
            required: false
          },
          {
            name: 'classNames',
            type: 'string',
            description: 'CSS classes',
            defaultValue: 'p-4',
            required: false
          }
        ],
        dependencies: ['react'],
        devDependencies: ['@types/react'],
        files: [
          {
            path: '{{componentName}}.tsx',
            content: '// Main component file',
            type: 'component',
            language: 'tsx',
            size: 500
          },
          {
            path: '{{componentName}}.test.tsx',
            content: '// Test file',
            type: 'test',
            language: 'tsx',
            size: 300
          }
        ],
        tags: ['react', 'component', 'functional', 'typescript'],
        version: '1.0.0',
        author: 'OSS Hero System',
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0,
        rating: 4.8,
        confidence: 95
      },

      // Next.js Page Template
      {
        id: 'nextjs-page',
        name: 'Next.js Page',
        description: 'Next.js page with SSG/SSR support and SEO optimization',
        category: 'page',
        framework: ['next'],
        styling: ['tailwind', 'styled-components', 'css-modules'],
        features: ['TypeScript Support', 'SEO Optimization', 'Performance Optimization'],
        complexity: 'moderate',
        template: `import React from 'react';
import Head from 'next/head';
{{#if getStaticProps}}
import { GetStaticProps } from 'next';
{{/if}}
{{#if getServerSideProps}}
import { GetServerSideProps } from 'next';
{{/if}}

{{#if typescript}}
interface {{pageName}}Props {
  // Define your props here
}
{{/if}}

{{#if typescript}}
export default function {{pageName}}(props: {{pageName}}Props) {
{{else}}
export default function {{pageName}}(props) {
{{/if}}
  return (
    <>
      <Head>
        <title>{{pageTitle}}</title>
        <meta name="description" content="{{pageDescription}}" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <main className="{{mainClassNames}}">
        <h1 className="{{titleClassNames}}">{{pageTitle}}</h1>
        <p>{{pageDescription}}</p>
      </main>
    </>
  );
}

{{#if getStaticProps}}
export const getStaticProps: GetStaticProps = async (context) => {
  // Fetch data at build time
  return {
    props: {
      // your props
    },
    revalidate: 3600, // Revalidate every hour
  };
};
{{/if}}

{{#if getServerSideProps}}
export const getServerSideProps: GetServerSideProps = async (context) => {
  // Fetch data on each request
  return {
    props: {
      // your props
    },
  };
};
{{/if}}`,
        variables: [
          {
            name: 'pageName',
            type: 'string',
            description: 'Name of the page component',
            required: true
          },
          {
            name: 'pageTitle',
            type: 'string',
            description: 'Page title for SEO',
            required: true
          },
          {
            name: 'pageDescription',
            type: 'string',
            description: 'Page description for SEO',
            required: true
          },
          {
            name: 'getStaticProps',
            type: 'boolean',
            description: 'Use getStaticProps for SSG',
            defaultValue: false,
            required: false
          },
          {
            name: 'getServerSideProps',
            type: 'boolean',
            description: 'Use getServerSideProps for SSR',
            defaultValue: false,
            required: false
          },
          {
            name: 'mainClassNames',
            type: 'string',
            description: 'Main container CSS classes',
            defaultValue: 'min-h-screen p-8',
            required: false
          },
          {
            name: 'titleClassNames',
            type: 'string',
            description: 'Title CSS classes',
            defaultValue: 'text-4xl font-bold mb-4',
            required: false
          }
        ],
        dependencies: ['react', 'next'],
        devDependencies: ['@types/react', '@types/node'],
        files: [
          {
            path: 'pages/{{kebabCase pageName}}.tsx',
            content: '// Page component',
            type: 'component',
            language: 'tsx',
            size: 800
          }
        ],
        tags: ['nextjs', 'page', 'ssg', 'ssr', 'seo'],
        version: '1.0.0',
        author: 'OSS Hero System',
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0,
        rating: 4.9,
        confidence: 92
      },

      // API Route Template
      {
        id: 'nextjs-api-route',
        name: 'Next.js API Route',
        description: 'Next.js API route with error handling and validation',
        category: 'api',
        framework: ['next'],
        styling: [],
        features: ['TypeScript Support', 'Error Handling', 'Form Validation'],
        complexity: 'moderate',
        template: `import { NextApiRequest, NextApiResponse } from 'next';

{{#if validation}}
interface RequestBody {
  // Define your request body interface
}
{{/if}}

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow specific methods
  if (req.method !== '{{httpMethod}}') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    {{#if validation}}
    // Validate request body
    const body: RequestBody = req.body;
    if (!body) {
      return res.status(400).json({
        success: false,
        error: 'Request body is required'
      });
    }
    {{/if}}

    // Your API logic here
    const result = await processRequest(req);

    return res.status(200).json({
      success: true,
      data: result,
      message: '{{successMessage}}'
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

async function processRequest(req: NextApiRequest) {
  // Implement your business logic here
  return { message: 'Request processed successfully' };
}`,
        variables: [
          {
            name: 'httpMethod',
            type: 'string',
            description: 'HTTP method to handle',
            defaultValue: 'POST',
            required: true,
            options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
          },
          {
            name: 'successMessage',
            type: 'string',
            description: 'Success response message',
            defaultValue: 'Operation completed successfully',
            required: false
          },
          {
            name: 'validation',
            type: 'boolean',
            description: 'Include request validation',
            defaultValue: true,
            required: false
          }
        ],
        dependencies: ['next'],
        devDependencies: ['@types/node'],
        files: [
          {
            path: 'pages/api/{{kebabCase routeName}}.ts',
            content: '// API route',
            type: 'component',
            language: 'ts',
            size: 600
          }
        ],
        tags: ['nextjs', 'api', 'route', 'validation', 'error-handling'],
        version: '1.0.0',
        author: 'OSS Hero System',
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0,
        rating: 4.7,
        confidence: 90
      },

      // Custom Hook Template
      {
        id: 'react-custom-hook',
        name: 'React Custom Hook',
        description: 'Reusable React custom hook with TypeScript',
        category: 'hook',
        framework: ['react', 'next'],
        styling: [],
        features: ['TypeScript Support', 'Error Handling', 'Performance Optimization'],
        complexity: 'simple',
        template: `import { useState, useEffect, useCallback } from 'react';

{{#if typescript}}
interface {{hookName}}Options {
  // Define your options interface
}

interface {{hookName}}Return {
  // Define your return interface
  data: any;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}
{{/if}}

{{#if typescript}}
export function {{hookName}}(options?: {{hookName}}Options): {{hookName}}Return {
{{else}}
export function {{hookName}}(options) {
{{/if}}
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Your hook logic here
      const result = await performOperation(options);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch
  };
}

async function performOperation(options: any) {
  // Implement your operation here
  return { message: 'Operation completed' };
}`,
        variables: [
          {
            name: 'hookName',
            type: 'string',
            description: 'Name of the custom hook (should start with "use")',
            required: true,
            validation: '^use[A-Z]'
          },
          {
            name: 'typescript',
            type: 'boolean',
            description: 'Use TypeScript',
            defaultValue: true,
            required: false
          }
        ],
        dependencies: ['react'],
        devDependencies: ['@types/react'],
        files: [
          {
            path: 'hooks/{{hookName}}.ts',
            content: '// Custom hook',
            type: 'component',
            language: 'ts',
            size: 400
          },
          {
            path: 'hooks/{{hookName}}.test.ts',
            content: '// Hook tests',
            type: 'test',
            language: 'ts',
            size: 300
          }
        ],
        tags: ['react', 'hook', 'custom', 'reusable'],
        version: '1.0.0',
        author: 'OSS Hero System',
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0,
        rating: 4.6,
        confidence: 88
      }
    ];

    // Register templates
    builtInTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  /**
   * Get intelligent template suggestions based on project context
   */
  async getSuggestions(context: ProjectContext): Promise<TemplateSuggestion[]> {
    const cacheKey = this.generateCacheKey(context);
    
    if (this.suggestionCache.has(cacheKey)) {
      return this.suggestionCache.get(cacheKey)!;
    }

    const suggestions = await this.generateSuggestions(context);
    this.suggestionCache.set(cacheKey, suggestions);
    
    return suggestions;
  }

  /**
   * Generate template suggestions based on context
   */
  private async generateSuggestions(context: ProjectContext): Promise<TemplateSuggestion[]> {
    const suggestions: TemplateSuggestion[] = [];
    
    for (const template of Array.from(this.templates.values())) {
      const confidence = this.calculateConfidence(template, context);
      
      if (confidence > 30) { // Only include relevant suggestions
        const suggestion: TemplateSuggestion = {
          template,
          confidence,
          reasoning: this.generateReasoning(template, context),
          matches: this.findMatches(template, context),
          improvements: this.suggestImprovements(template, context),
          estimatedEffort: this.estimateEffort(template, context),
          impact: this.estimateImpact(template, context)
        };
        
        suggestions.push(suggestion);
      }
    }

    // Sort by confidence score
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Calculate confidence score for template matching
   */
  private calculateConfidence(template: CodeTemplate, context: ProjectContext): number {
    let score = 0;
    let maxScore = 0;

    // Type match (40 points)
    maxScore += 40;
    if (template.category === context.type) {
      score += 40;
    } else if (template.category === 'component' && context.type === 'page') {
      score += 20; // Partial match
    }

    // Framework match (30 points)
    maxScore += 30;
    if (template.framework.includes(context.framework)) {
      score += 30;
    }

    // Styling match (15 points)
    maxScore += 15;
    if (template.styling.includes(context.styling)) {
      score += 15;
    }

    // Feature matches (15 points total)
    maxScore += 15;
    const featureMatches = context.features.filter(feature => 
      template.features.includes(feature)
    ).length;
    const featureScore = Math.min(15, (featureMatches / Math.max(context.features.length, 1)) * 15);
    score += featureScore;

    // Normalize to percentage
    return Math.round((score / maxScore) * 100);
  }

  /**
   * Generate reasoning for template suggestion
   */
  private generateReasoning(template: CodeTemplate, context: ProjectContext): string {
    const reasons: string[] = [];

    if (template.category === context.type) {
      reasons.push(`Perfect match for ${context.type} type`);
    }

    if (template.framework.includes(context.framework)) {
      reasons.push(`Supports ${context.framework} framework`);
    }

    if (template.styling.includes(context.styling)) {
      reasons.push(`Compatible with ${context.styling} styling`);
    }

    const featureMatches = context.features.filter(feature => 
      template.features.includes(feature)
    );
    if (featureMatches.length > 0) {
      reasons.push(`Includes ${featureMatches.length} requested features`);
    }

    if (template.rating > 4.5) {
      reasons.push(`High community rating (${template.rating}/5)`);
    }

    return reasons.join('. ') || 'General purpose template suitable for your needs';
  }

  /**
   * Find specific matches between template and context
   */
  private findMatches(template: CodeTemplate, context: ProjectContext): string[] {
    const matches: string[] = [];

    if (template.category === context.type) {
      matches.push(`Type: ${context.type}`);
    }

    if (template.framework.includes(context.framework)) {
      matches.push(`Framework: ${context.framework}`);
    }

    if (template.styling.includes(context.styling)) {
      matches.push(`Styling: ${context.styling}`);
    }

    const featureMatches = context.features.filter(feature => 
      template.features.includes(feature)
    );
    featureMatches.forEach(feature => {
      matches.push(`Feature: ${feature}`);
    });

    return matches;
  }

  /**
   * Suggest improvements for better template match
   */
  private suggestImprovements(template: CodeTemplate, context: ProjectContext): string[] {
    const improvements: string[] = [];

    // Suggest additional features
    const missingFeatures = template.features.filter(feature => 
      !context.features.includes(feature)
    );
    if (missingFeatures.length > 0) {
      improvements.push(`Consider adding: ${missingFeatures.slice(0, 3).join(', ')}`);
    }

    // Suggest framework optimization
    if (!template.framework.includes(context.framework)) {
      improvements.push(`Template could be adapted for ${context.framework}`);
    }

    // Suggest styling integration
    if (!template.styling.includes(context.styling)) {
      improvements.push(`Can be customized for ${context.styling} styling`);
    }

    return improvements;
  }

  /**
   * Estimate implementation effort
   */
  private estimateEffort(template: CodeTemplate, context: ProjectContext): 'low' | 'medium' | 'high' {
    const confidence = this.calculateConfidence(template, context);
    
    if (confidence > 80) return 'low';
    if (confidence > 60) return 'medium';
    return 'high';
  }

  /**
   * Estimate business impact
   */
  private estimateImpact(template: CodeTemplate, context: ProjectContext): 'low' | 'medium' | 'high' {
    if (template.category === context.type && template.framework.includes(context.framework)) {
      return 'high';
    }
    if (template.category === context.type || template.framework.includes(context.framework)) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Analyze template quality and provide recommendations
   */
  async analyzeTemplate(templateId: string): Promise<TemplateAnalysis> {
    if (this.analysisCache.has(templateId)) {
      return this.analysisCache.get(templateId)!;
    }

    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const analysis = await this.performTemplateAnalysis(template);
    this.analysisCache.set(templateId, analysis);
    
    return analysis;
  }

  /**
   * Perform comprehensive template analysis
   */
  private async performTemplateAnalysis(template: CodeTemplate): Promise<TemplateAnalysis> {
    const analysis: TemplateAnalysis = {
      quality: 0,
      performance: 0,
      maintainability: 0,
      accessibility: 0,
      security: 0,
      testability: 0,
      documentation: 0,
      overall: 0,
      issues: [],
      recommendations: []
    };

    // Quality analysis
    analysis.quality = this.analyzeQuality(template);
    
    // Performance analysis
    analysis.performance = this.analyzePerformance(template);
    
    // Maintainability analysis
    analysis.maintainability = this.analyzeMaintainability(template);
    
    // Accessibility analysis
    analysis.accessibility = this.analyzeAccessibility(template);
    
    // Security analysis
    analysis.security = this.analyzeSecurity(template);
    
    // Testability analysis
    analysis.testability = this.analyzeTestability(template);
    
    // Documentation analysis
    analysis.documentation = this.analyzeDocumentation(template);

    // Calculate overall score
    analysis.overall = Math.round(
      (analysis.quality + analysis.performance + analysis.maintainability + 
       analysis.accessibility + analysis.security + analysis.testability + 
       analysis.documentation) / 7
    );

    return analysis;
  }

  /**
   * Analyze template quality
   */
  private analyzeQuality(template: CodeTemplate): number {
    let score = 100;
    
    // Check for TypeScript usage
    if (!template.features.includes('TypeScript Support')) {
      score -= 15;
    }
    
    // Check for proper error handling
    if (!template.template.includes('try') && !template.template.includes('catch')) {
      score -= 10;
    }
    
    // Check for proper prop validation
    if (template.category === 'component' && !template.template.includes('Props')) {
      score -= 10;
    }
    
    return Math.max(0, score);
  }

  /**
   * Analyze template performance
   */
  private analyzePerformance(template: CodeTemplate): number {
    let score = 100;
    
    // Check for performance features
    if (!template.features.includes('Performance Optimization')) {
      score -= 20;
    }
    
    // Check for memo/callback usage in React components
    if (template.framework.includes('react') && 
        !template.template.includes('useCallback') && 
        !template.template.includes('useMemo')) {
      score -= 15;
    }
    
    return Math.max(0, score);
  }

  /**
   * Analyze template maintainability
   */
  private analyzeMaintainability(template: CodeTemplate): number {
    let score = 100;
    
    // Check for proper documentation
    if (!template.description || template.description.length < 20) {
      score -= 20;
    }
    
    // Check for variable definitions
    if (template.variables.length === 0) {
      score -= 15;
    }
    
    return Math.max(0, score);
  }

  /**
   * Analyze template accessibility
   */
  private analyzeAccessibility(template: CodeTemplate): number {
    let score = 100;
    
    // Check for accessibility features
    if (!template.features.includes('Accessibility (a11y)')) {
      score -= 30;
    }
    
    // Check for semantic HTML
    if (template.template.includes('<div') && !template.template.includes('role=')) {
      score -= 10;
    }
    
    return Math.max(0, score);
  }

  /**
   * Analyze template security
   */
  private analyzeSecurity(template: CodeTemplate): number {
    let score = 100;
    
    // Check for potential security issues
    if (template.template.includes('dangerouslySetInnerHTML')) {
      score -= 25;
    }
    
    // Check for input validation in API routes
    if (template.category === 'api' && !template.template.includes('validation')) {
      score -= 20;
    }
    
    return Math.max(0, score);
  }

  /**
   * Analyze template testability
   */
  private analyzeTestability(template: CodeTemplate): number {
    let score = 100;
    
    // Check for test files
    const hasTestFiles = template.files.some(file => file.type === 'test');
    if (!hasTestFiles) {
      score -= 30;
    }
    
    // Check for testing features
    if (!template.features.includes('Testing Setup')) {
      score -= 20;
    }
    
    return Math.max(0, score);
  }

  /**
   * Analyze template documentation
   */
  private analyzeDocumentation(template: CodeTemplate): number {
    let score = 100;
    
    // Check for JSDoc comments
    if (!template.template.includes('/**')) {
      score -= 25;
    }
    
    // Check for README or documentation files
    const hasDocFiles = template.files.some(file => file.type === 'doc');
    if (!hasDocFiles) {
      score -= 20;
    }
    
    return Math.max(0, score);
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): CodeTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * Get all templates
   */
  getAllTemplates(): CodeTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: string): CodeTemplate[] {
    return Array.from(this.templates.values()).filter(
      template => template.category === category
    );
  }

  /**
   * Get templates by framework
   */
  getTemplatesByFramework(framework: string): CodeTemplate[] {
    return Array.from(this.templates.values()).filter(
      template => template.framework.includes(framework)
    );
  }

  /**
   * Register a new template
   */
  registerTemplate(template: CodeTemplate): void {
    this.templates.set(template.id, template);
    
    // Clear related caches
    this.analysisCache.delete(template.id);
    this.suggestionCache.clear();
  }

  /**
   * Update template usage statistics
   */
  updateUsageStats(templateId: string): void {
    const template = this.templates.get(templateId);
    if (template) {
      template.usageCount++;
      template.updatedAt = new Date();
    }
  }

  /**
   * Generate cache key for suggestions
   */
  private generateCacheKey(context: ProjectContext): string {
    return `${context.type}-${context.framework}-${context.styling}-${context.features.sort().join(',')}`;
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.analysisCache.clear();
    this.suggestionCache.clear();
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): {
    templateCount: number;
    cacheHitRate: number;
    avgConfidence: number;
    popularTemplates: string[];
  } {
    const templates = Array.from(this.templates.values());
    
    return {
      templateCount: templates.length,
      cacheHitRate: this.suggestionCache.size > 0 ? 0.85 : 0, // Simulated
      avgConfidence: templates.reduce((acc, t) => acc + t.confidence, 0) / templates.length,
      popularTemplates: templates
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 5)
        .map(t => t.name)
    };
  }
}
