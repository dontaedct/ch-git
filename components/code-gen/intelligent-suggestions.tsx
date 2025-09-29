/**
 * @fileoverview Intelligent Code Generation Suggestions Component
 * @module components/code-gen/intelligent-suggestions
 * @author OSS Hero System
 * @version 2.0.0
 * 
 * HT-031.2.3: Advanced Code Generation & Template Intelligence
 * 
 * This component provides intelligent suggestions for code generation with:
 * - AI-powered recommendations
 * - Context-aware suggestions
 * - Impact and effort scoring
 * - Real-time suggestion application
 * - Comprehensive insights and analytics
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';
import { Button } from '@ui/button';
import { Badge } from '@ui/badge';
import { Progress } from '@ui/progress';
import { Alert, AlertDescription } from '@ui/alert';
import { 
  Lightbulb, 
  TrendingUp, 
  Clock, 
  Target, 
  CheckCircle, 
  AlertTriangle,
  Info,
  Zap,
  Star,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Filter,
  BarChart3,
  Brain,
  Sparkles
} from 'lucide-react';

export interface ProjectContext {
  name: string;
  description: string;
  type: 'component' | 'page' | 'api' | 'hook' | 'utility' | 'full-app';
  framework: 'react' | 'next' | 'vue' | 'angular' | 'vanilla';
  styling: 'tailwind' | 'styled-components' | 'css-modules' | 'emotion' | 'none';
  features: string[];
  customRequirements: string;
}

export interface Suggestion {
  id: string;
  type: 'template' | 'feature' | 'optimization' | 'best-practice' | 'security';
  title: string;
  description: string;
  reasoning: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  confidence: number;
  category: string;
  tags: string[];
  code?: string;
  documentation?: string;
  dependencies?: string[];
  examples?: string[];
  relatedSuggestions?: string[];
  priority: number;
  isApplied?: boolean;
  appliedAt?: Date;
}

export interface SuggestionAnalytics {
  totalSuggestions: number;
  appliedSuggestions: number;
  avgConfidence: number;
  topCategories: { name: string; count: number }[];
  impactDistribution: { impact: string; count: number }[];
  effortDistribution: { effort: string; count: number }[];
}

interface IntelligentSuggestionsProps {
  project: ProjectContext;
  suggestions: Suggestion[];
  onApplySuggestion: (suggestion: Suggestion) => void;
  onRefreshSuggestions?: () => void;
  className?: string;
}

export function IntelligentSuggestions({
  project,
  suggestions: initialSuggestions,
  onApplySuggestion,
  onRefreshSuggestions,
  className = ''
}: IntelligentSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(initialSuggestions);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>(initialSuggestions);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedImpact, setSelectedImpact] = useState<string>('all');
  const [selectedEffort, setSelectedEffort] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [analytics, setAnalytics] = useState<SuggestionAnalytics | null>(null);

  // Update suggestions when props change
  useEffect(() => {
    setSuggestions(initialSuggestions);
    generateIntelligentSuggestions();
  }, [initialSuggestions, project]);

  // Update filtered suggestions when filters change
  useEffect(() => {
    applyFilters();
  }, [suggestions, selectedFilter, selectedImpact, selectedEffort]);

  // Calculate analytics when suggestions change
  useEffect(() => {
    calculateAnalytics();
  }, [suggestions]);

  /**
   * Generate intelligent suggestions based on project context
   */
  const generateIntelligentSuggestions = async () => {
    if (!project.name || !project.description) return;

    setIsGenerating(true);

    try {
      // Simulate AI-powered suggestion generation
      const contextSuggestions = await generateContextualSuggestions(project);
      const enhancedSuggestions = [...initialSuggestions, ...contextSuggestions];
      
      // Sort by priority and confidence
      enhancedSuggestions.sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return b.confidence - a.confidence;
      });

      setSuggestions(enhancedSuggestions);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Generate contextual suggestions based on project
   */
  const generateContextualSuggestions = async (context: ProjectContext): Promise<Suggestion[]> => {
    const suggestions: Suggestion[] = [];

    // Framework-specific suggestions
    if (context.framework === 'react' || context.framework === 'next') {
      suggestions.push({
        id: 'react-performance',
        type: 'optimization',
        title: 'Add React Performance Optimizations',
        description: 'Implement React.memo, useCallback, and useMemo for better performance',
        reasoning: 'React components can benefit from memoization to prevent unnecessary re-renders',
        impact: 'high',
        effort: 'medium',
        confidence: 90,
        category: 'Performance',
        tags: ['react', 'performance', 'optimization'],
        code: `import React, { memo, useCallback, useMemo } from 'react';

const OptimizedComponent = memo(({ data, onUpdate }) => {
  const processedData = useMemo(() => {
    return data.map(item => ({ ...item, processed: true }));
  }, [data]);

  const handleUpdate = useCallback((id) => {
    onUpdate(id);
  }, [onUpdate]);

  return (
    <div>
      {processedData.map(item => (
        <div key={item.id} onClick={() => handleUpdate(item.id)}>
          {item.name}
        </div>
      ))}
    </div>
  );
});`,
        priority: 8
      });
    }

    // TypeScript suggestions
    if (!context.features.includes('TypeScript Support')) {
      suggestions.push({
        id: 'add-typescript',
        type: 'feature',
        title: 'Add TypeScript Support',
        description: 'Enable TypeScript for better type safety and developer experience',
        reasoning: 'TypeScript provides compile-time type checking and improved IDE support',
        impact: 'high',
        effort: 'medium',
        confidence: 95,
        category: 'Type Safety',
        tags: ['typescript', 'type-safety', 'dx'],
        dependencies: ['typescript', '@types/react', '@types/node'],
        priority: 9
      });
    }

    // Testing suggestions
    if (!context.features.includes('Testing Setup')) {
      suggestions.push({
        id: 'add-testing',
        type: 'best-practice',
        title: 'Add Comprehensive Testing',
        description: 'Set up unit tests, integration tests, and component testing',
        reasoning: 'Testing ensures code reliability and prevents regressions',
        impact: 'high',
        effort: 'high',
        confidence: 88,
        category: 'Quality Assurance',
        tags: ['testing', 'quality', 'reliability'],
        dependencies: ['vitest', '@testing-library/react', '@testing-library/jest-dom'],
        priority: 7
      });
    }

    // Accessibility suggestions
    if (!context.features.includes('Accessibility (a11y)')) {
      suggestions.push({
        id: 'add-accessibility',
        type: 'best-practice',
        title: 'Implement Accessibility Features',
        description: 'Add ARIA labels, keyboard navigation, and screen reader support',
        reasoning: 'Accessibility ensures your application is usable by everyone',
        impact: 'high',
        effort: 'medium',
        confidence: 92,
        category: 'Accessibility',
        tags: ['a11y', 'accessibility', 'inclusive'],
        code: `// Add ARIA labels and semantic HTML
<button 
  aria-label="Close dialog"
  aria-describedby="dialog-description"
  onClick={handleClose}
>
  <span aria-hidden="true">×</span>
</button>

<div 
  role="dialog" 
  aria-modal="true"
  aria-labelledby="dialog-title"
>
  <h2 id="dialog-title">Dialog Title</h2>
  <p id="dialog-description">Dialog description</p>
</div>`,
        priority: 8
      });
    }

    // Security suggestions
    if (context.type === 'api') {
      suggestions.push({
        id: 'api-security',
        type: 'security',
        title: 'Add API Security Measures',
        description: 'Implement input validation, rate limiting, and CORS protection',
        reasoning: 'API endpoints need proper security measures to prevent attacks',
        impact: 'high',
        effort: 'medium',
        confidence: 94,
        category: 'Security',
        tags: ['security', 'api', 'validation'],
        code: `import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { z } from 'zod';

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Input validation schema
const requestSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  message: z.string().min(1).max(1000)
});

export default async function handler(req, res) {
  // Apply rate limiting and CORS
  await limiter(req, res);
  
  // Validate input
  const validation = requestSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  
  // Process request...
}`,
        priority: 9
      });
    }

    // Styling suggestions
    if (context.styling === 'none') {
      suggestions.push({
        id: 'add-styling',
        type: 'feature',
        title: 'Add Styling Solution',
        description: 'Choose a styling solution like Tailwind CSS or Styled Components',
        reasoning: 'A consistent styling approach improves maintainability and user experience',
        impact: 'medium',
        effort: 'medium',
        confidence: 85,
        category: 'Styling',
        tags: ['css', 'styling', 'ui'],
        priority: 6
      });
    }

    // Performance suggestions for Next.js
    if (context.framework === 'next') {
      suggestions.push({
        id: 'nextjs-optimization',
        type: 'optimization',
        title: 'Add Next.js Performance Features',
        description: 'Implement Image optimization, dynamic imports, and SSG/SSR',
        reasoning: 'Next.js provides built-in optimizations for better performance',
        impact: 'high',
        effort: 'low',
        confidence: 93,
        category: 'Performance',
        tags: ['nextjs', 'performance', 'optimization'],
        code: `import Image from 'next/image';
import dynamic from 'next/dynamic';

// Optimized image loading
<Image
  src="/hero-image.jpg"
  alt="Hero image"
  width={800}
  height={600}
  priority
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// Dynamic component loading
const DynamicComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false
});

// Static generation
export async function getStaticProps() {
  return {
    props: { data },
    revalidate: 3600 // Revalidate every hour
  };
}`,
        priority: 8
      });
    }

    return suggestions;
  };

  /**
   * Apply filters to suggestions
   */
  const applyFilters = () => {
    let filtered = [...suggestions];

    // Filter by type/category
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(s => 
        s.type === selectedFilter || s.category.toLowerCase() === selectedFilter.toLowerCase()
      );
    }

    // Filter by impact
    if (selectedImpact !== 'all') {
      filtered = filtered.filter(s => s.impact === selectedImpact);
    }

    // Filter by effort
    if (selectedEffort !== 'all') {
      filtered = filtered.filter(s => s.effort === selectedEffort);
    }

    setFilteredSuggestions(filtered);
  };

  /**
   * Calculate analytics for suggestions
   */
  const calculateAnalytics = () => {
    if (suggestions.length === 0) {
      setAnalytics(null);
      return;
    }

    const appliedCount = suggestions.filter(s => s.isApplied).length;
    const avgConfidence = suggestions.reduce((acc, s) => acc + s.confidence, 0) / suggestions.length;

    const categoryMap = new Map<string, number>();
    const impactMap = new Map<string, number>();
    const effortMap = new Map<string, number>();

    suggestions.forEach(s => {
      categoryMap.set(s.category, (categoryMap.get(s.category) || 0) + 1);
      impactMap.set(s.impact, (impactMap.get(s.impact) || 0) + 1);
      effortMap.set(s.effort, (effortMap.get(s.effort) || 0) + 1);
    });

    setAnalytics({
      totalSuggestions: suggestions.length,
      appliedSuggestions: appliedCount,
      avgConfidence: Math.round(avgConfidence),
      topCategories: Array.from(categoryMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      impactDistribution: Array.from(impactMap.entries())
        .map(([impact, count]) => ({ impact, count })),
      effortDistribution: Array.from(effortMap.entries())
        .map(([effort, count]) => ({ effort, count }))
    });
  };

  /**
   * Handle applying a suggestion
   */
  const handleApplySuggestion = (suggestion: Suggestion) => {
    // Update suggestion as applied
    setSuggestions(prev => prev.map(s => 
      s.id === suggestion.id 
        ? { ...s, isApplied: true, appliedAt: new Date() }
        : s
    ));

    // Call parent handler
    onApplySuggestion(suggestion);
  };

  /**
   * Get impact color
   */
  const getImpactColor = (impact: string): string => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  /**
   * Get effort color
   */
  const getEffortColor = (effort: string): string => {
    switch (effort) {
      case 'high': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'low': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  /**
   * Get suggestion type icon
   */
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'template': return <Sparkles className="h-4 w-4" />;
      case 'feature': return <Zap className="h-4 w-4" />;
      case 'optimization': return <TrendingUp className="h-4 w-4" />;
      case 'best-practice': return <Star className="h-4 w-4" />;
      case 'security': return <AlertTriangle className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Analytics */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Intelligent Suggestions
          </h2>
          <p className="text-gray-600 mt-1">
            AI-powered recommendations for your {project.name} project
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {analytics && (
            <div className="text-right">
              <div className="text-sm text-gray-600">
                {analytics.appliedSuggestions}/{analytics.totalSuggestions} applied
              </div>
              <div className="text-sm text-gray-600">
                {analytics.avgConfidence}% avg confidence
              </div>
            </div>
          )}
          
          <Button
            variant="outline"
            onClick={onRefreshSuggestions}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {analytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Suggestion Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Applied Progress</span>
                  <span className="text-sm text-gray-600">
                    {Math.round((analytics.appliedSuggestions / analytics.totalSuggestions) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={(analytics.appliedSuggestions / analytics.totalSuggestions) * 100} 
                  className="h-2"
                />
              </div>

              {/* Top Categories */}
              <div>
                <h4 className="text-sm font-medium mb-2">Top Categories</h4>
                <div className="space-y-1">
                  {analytics.topCategories.slice(0, 3).map(({ name, count }) => (
                    <div key={name} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{name}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Impact Distribution */}
              <div>
                <h4 className="text-sm font-medium mb-2">Impact Distribution</h4>
                <div className="flex gap-2">
                  {analytics.impactDistribution.map(({ impact, count }) => (
                    <div key={impact} className="text-center">
                      <div className={`text-xs px-2 py-1 rounded ${getImpactColor(impact)}`}>
                        {count}
                      </div>
                      <div className="text-xs text-gray-600 mt-1 capitalize">{impact}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            {/* Type Filter */}
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">All Types</option>
              <option value="template">Templates</option>
              <option value="feature">Features</option>
              <option value="optimization">Optimizations</option>
              <option value="best-practice">Best Practices</option>
              <option value="security">Security</option>
            </select>

            {/* Impact Filter */}
            <select
              value={selectedImpact}
              onChange={(e) => setSelectedImpact(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">All Impact</option>
              <option value="high">High Impact</option>
              <option value="medium">Medium Impact</option>
              <option value="low">Low Impact</option>
            </select>

            {/* Effort Filter */}
            <select
              value={selectedEffort}
              onChange={(e) => setSelectedEffort(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">All Effort</option>
              <option value="low">Low Effort</option>
              <option value="medium">Medium Effort</option>
              <option value="high">High Effort</option>
            </select>

            <div className="text-sm text-gray-600">
              {filteredSuggestions.length} of {suggestions.length} suggestions
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions List */}
      <div className="space-y-4">
        {isGenerating && (
          <Alert>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Generating intelligent suggestions based on your project context...
            </AlertDescription>
          </Alert>
        )}

        {filteredSuggestions.length === 0 && !isGenerating ? (
          <Card>
            <CardContent className="text-center py-8">
              <Lightbulb className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No suggestions found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or refresh to get new suggestions
              </p>
              <Button onClick={onRefreshSuggestions} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Suggestions
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredSuggestions.map((suggestion) => (
            <Card key={suggestion.id} className={`${suggestion.isApplied ? 'bg-green-50 border-green-200' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                      {getSuggestionIcon(suggestion.type)}
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {suggestion.title}
                        {suggestion.isApplied && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {suggestion.description}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-right text-xs text-gray-600">
                      <div>Confidence</div>
                      <div className="font-medium">{suggestion.confidence}%</div>
                    </div>
                    <div className="w-12 h-12 relative">
                      <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-gray-200"
                          strokeWidth="3"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-purple-600"
                          strokeWidth="3"
                          strokeDasharray={`${suggestion.confidence}, 100`}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Tags and Metadata */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={getImpactColor(suggestion.impact)}>
                    <Target className="h-3 w-3 mr-1" />
                    {suggestion.impact} impact
                  </Badge>
                  <Badge variant="outline" className={getEffortColor(suggestion.effort)}>
                    <Clock className="h-3 w-3 mr-1" />
                    {suggestion.effort} effort
                  </Badge>
                  <Badge variant="secondary">{suggestion.category}</Badge>
                  {suggestion.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Reasoning */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-blue-900 mb-1">Why this suggestion?</div>
                      <div className="text-sm text-blue-800">{suggestion.reasoning}</div>
                    </div>
                  </div>
                </div>

                {/* Code Example */}
                {suggestion.code && (
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">Code Example</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-gray-100 h-6 px-2"
                        onClick={() => navigator.clipboard.writeText(suggestion.code || '')}
                      >
                        Copy
                      </Button>
                    </div>
                    <pre className="text-xs overflow-x-auto">
                      <code>{suggestion.code}</code>
                    </pre>
                  </div>
                )}

                {/* Dependencies */}
                {suggestion.dependencies && suggestion.dependencies.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Required Dependencies:</div>
                    <div className="flex flex-wrap gap-1">
                      {suggestion.dependencies.map(dep => (
                        <Badge key={dep} variant="outline" className="text-xs font-mono">
                          {dep}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    {suggestion.isApplied ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Applied
                      </Badge>
                    ) : (
                      <Button
                        onClick={() => handleApplySuggestion(suggestion)}
                        className="bg-purple-600 hover:bg-purple-700"
                        size="sm"
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Apply Suggestion
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="text-gray-500">
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-500">
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
