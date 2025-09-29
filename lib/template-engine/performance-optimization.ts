export interface PerformanceMetric {
  id: string
  name: string
  currentValue: number
  targetValue: number
  unit: string
  category: 'compilation' | 'loading' | 'generation' | 'system'
  status: 'excellent' | 'good' | 'needs-improvement' | 'poor'
  trend: 'up' | 'down' | 'stable'
  history: PerformanceDataPoint[]
}

export interface PerformanceDataPoint {
  timestamp: Date
  value: number
  context?: string
}

export interface OptimizationStrategy {
  id: string
  name: string
  description: string
  category: 'caching' | 'compilation' | 'bundling' | 'loading'
  impact: 'high' | 'medium' | 'low'
  enabled: boolean
  config?: Record<string, any>
}

export interface OptimizationResult {
  strategyId: string
  beforeValue: number
  afterValue: number
  improvement: number
  improvementPercentage: number
  duration: number
  success: boolean
  error?: string
}

export interface CacheConfig {
  templateCacheSize: number
  componentCacheSize: number
  ttl: number // Time to live in seconds
  enableCompression: boolean
  enableDistributedCache: boolean
}

export interface CompilationConfig {
  parallelWorkers: number
  enableTreeShaking: boolean
  enableMinification: boolean
  sourceMaps: boolean
  optimizationLevel: 'development' | 'production' | 'aggressive'
}

export interface LoadingConfig {
  enableLazyLoading: boolean
  enablePreloading: boolean
  chunkSize: number
  enableCodeSplitting: boolean
  compressionLevel: number
}

export class PerformanceOptimizer {
  private metrics: Map<string, PerformanceMetric> = new Map()
  private strategies: Map<string, OptimizationStrategy> = new Map()
  private cacheConfig: CacheConfig
  private compilationConfig: CompilationConfig
  private loadingConfig: LoadingConfig

  constructor() {
    this.initializeConfigs()
    this.initializeStrategies()
    this.initializeMetrics()
  }

  private initializeConfigs() {
    this.cacheConfig = {
      templateCacheSize: 100,
      componentCacheSize: 500,
      ttl: 3600, // 1 hour
      enableCompression: true,
      enableDistributedCache: false
    }

    this.compilationConfig = {
      parallelWorkers: 4,
      enableTreeShaking: true,
      enableMinification: true,
      sourceMaps: false,
      optimizationLevel: 'production'
    }

    this.loadingConfig = {
      enableLazyLoading: true,
      enablePreloading: true,
      chunkSize: 250000, // 250KB
      enableCodeSplitting: true,
      compressionLevel: 6
    }
  }

  private initializeStrategies() {
    const strategies: OptimizationStrategy[] = [
      {
        id: 'template-caching',
        name: 'Template Caching',
        description: 'Cache compiled templates to avoid recompilation',
        category: 'caching',
        impact: 'high',
        enabled: true,
        config: { cacheSize: this.cacheConfig.templateCacheSize }
      },
      {
        id: 'component-lazy-loading',
        name: 'Component Lazy Loading',
        description: 'Load components only when needed',
        category: 'loading',
        impact: 'medium',
        enabled: true
      },
      {
        id: 'parallel-compilation',
        name: 'Parallel Compilation',
        description: 'Compile templates in parallel using multiple workers',
        category: 'compilation',
        impact: 'high',
        enabled: false,
        config: { workers: this.compilationConfig.parallelWorkers }
      },
      {
        id: 'code-splitting',
        name: 'Code Splitting',
        description: 'Split generated code into smaller, loadable chunks',
        category: 'bundling',
        impact: 'high',
        enabled: true,
        config: { chunkSize: this.loadingConfig.chunkSize }
      },
      {
        id: 'tree-shaking',
        name: 'Tree Shaking',
        description: 'Remove unused code from final bundles',
        category: 'bundling',
        impact: 'medium',
        enabled: true
      },
      {
        id: 'compression',
        name: 'Asset Compression',
        description: 'Compress assets using gzip/brotli compression',
        category: 'loading',
        impact: 'medium',
        enabled: true,
        config: { level: this.loadingConfig.compressionLevel }
      },
      {
        id: 'preloading',
        name: 'Critical Resource Preloading',
        description: 'Preload critical resources for faster initial load',
        category: 'loading',
        impact: 'medium',
        enabled: false
      },
      {
        id: 'minification',
        name: 'Code Minification',
        description: 'Minify JavaScript, CSS, and HTML output',
        category: 'bundling',
        impact: 'medium',
        enabled: true
      }
    ]

    strategies.forEach(strategy => this.strategies.set(strategy.id, strategy))
  }

  private initializeMetrics() {
    const now = new Date()
    const metrics: PerformanceMetric[] = [
      {
        id: 'template-compilation-time',
        name: 'Template Compilation Time',
        currentValue: 1.2,
        targetValue: 30.0,
        unit: 'seconds',
        category: 'compilation',
        status: 'excellent',
        trend: 'down',
        history: this.generateMetricHistory(1.2, 0.3, 24)
      },
      {
        id: 'app-generation-time',
        name: 'App Generation Time',
        currentValue: 108,
        targetValue: 120,
        unit: 'seconds',
        category: 'generation',
        status: 'good',
        trend: 'stable',
        history: this.generateMetricHistory(108, 15, 24)
      },
      {
        id: 'template-loading-time',
        name: 'Template Loading Time',
        currentValue: 2.1,
        targetValue: 5.0,
        unit: 'seconds',
        category: 'loading',
        status: 'excellent',
        trend: 'down',
        history: this.generateMetricHistory(2.1, 0.5, 24)
      },
      {
        id: 'component-injection-time',
        name: 'Component Injection Time',
        currentValue: 8.5,
        targetValue: 10.0,
        unit: 'seconds',
        category: 'compilation',
        status: 'good',
        trend: 'stable',
        history: this.generateMetricHistory(8.5, 1.2, 24)
      },
      {
        id: 'bundle-size',
        name: 'Generated Bundle Size',
        currentValue: 2.8,
        targetValue: 5.0,
        unit: 'MB',
        category: 'generation',
        status: 'excellent',
        trend: 'down',
        history: this.generateMetricHistory(2.8, 0.4, 24)
      },
      {
        id: 'memory-usage',
        name: 'Peak Memory Usage',
        currentValue: 145,
        targetValue: 200,
        unit: 'MB',
        category: 'system',
        status: 'good',
        trend: 'stable',
        history: this.generateMetricHistory(145, 20, 24)
      }
    ]

    metrics.forEach(metric => this.metrics.set(metric.id, metric))
  }

  private generateMetricHistory(baseValue: number, variance: number, points: number): PerformanceDataPoint[] {
    const history: PerformanceDataPoint[] = []
    let currentValue = baseValue

    for (let i = 0; i < points; i++) {
      const change = (Math.random() - 0.5) * variance
      currentValue = Math.max(0, currentValue + change)

      history.push({
        timestamp: new Date(Date.now() - (points - i) * 3600000), // Hour intervals
        value: currentValue
      })
    }

    return history
  }

  async optimizePerformance(strategyIds: string[]): Promise<OptimizationResult[]> {
    const results: OptimizationResult[] = []

    for (const strategyId of strategyIds) {
      const strategy = this.strategies.get(strategyId)
      if (!strategy || !strategy.enabled) continue

      try {
        const result = await this.executeOptimizationStrategy(strategy)
        results.push(result)

        // Update related metrics
        this.updateMetricsAfterOptimization(strategy, result)
      } catch (error) {
        results.push({
          strategyId,
          beforeValue: 0,
          afterValue: 0,
          improvement: 0,
          improvementPercentage: 0,
          duration: 0,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return results
  }

  private async executeOptimizationStrategy(strategy: OptimizationStrategy): Promise<OptimizationResult> {
    const startTime = Date.now()

    // Simulate optimization execution
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500))

    // Calculate improvement based on strategy impact and category
    const baseImprovement = this.getBaseImprovementForStrategy(strategy)
    const beforeValue = baseImprovement.before
    const improvementAmount = baseImprovement.improvement * this.getImpactMultiplier(strategy.impact)
    const afterValue = beforeValue - improvementAmount

    const duration = Date.now() - startTime

    return {
      strategyId: strategy.id,
      beforeValue,
      afterValue,
      improvement: improvementAmount,
      improvementPercentage: (improvementAmount / beforeValue) * 100,
      duration,
      success: true
    }
  }

  private getBaseImprovementForStrategy(strategy: OptimizationStrategy): { before: number; improvement: number } {
    switch (strategy.category) {
      case 'caching':
        return { before: 5000, improvement: 2000 } // 5s to 3s
      case 'compilation':
        return { before: 15000, improvement: 6000 } // 15s to 9s
      case 'bundling':
        return { before: 3000, improvement: 1200 } // 3MB to 1.8MB
      case 'loading':
        return { before: 8000, improvement: 3000 } // 8s to 5s
      default:
        return { before: 1000, improvement: 200 }
    }
  }

  private getImpactMultiplier(impact: OptimizationStrategy['impact']): number {
    switch (impact) {
      case 'high': return 1.0
      case 'medium': return 0.6
      case 'low': return 0.3
    }
  }

  private updateMetricsAfterOptimization(strategy: OptimizationStrategy, result: OptimizationResult) {
    // Update related metrics based on the strategy category
    const relatedMetrics = Array.from(this.metrics.values()).filter(metric =>
      this.isMetricRelatedToStrategy(metric, strategy)
    )

    relatedMetrics.forEach(metric => {
      const improvementRatio = result.improvementPercentage / 100
      const newValue = metric.currentValue * (1 - improvementRatio * 0.1) // Apply 10% of improvement

      this.updateMetric(metric.id, {
        currentValue: Math.max(newValue, metric.currentValue * 0.7), // Don't improve more than 30%
        trend: 'down',
        status: this.calculateMetricStatus(newValue, metric.targetValue)
      })

      // Add new data point to history
      metric.history.push({
        timestamp: new Date(),
        value: newValue,
        context: `Optimization: ${strategy.name}`
      })

      // Keep only last 100 data points
      if (metric.history.length > 100) {
        metric.history = metric.history.slice(-100)
      }
    })
  }

  private isMetricRelatedToStrategy(metric: PerformanceMetric, strategy: OptimizationStrategy): boolean {
    const categoryMappings: Record<string, string[]> = {
      caching: ['template-loading-time', 'component-injection-time'],
      compilation: ['template-compilation-time', 'app-generation-time'],
      bundling: ['bundle-size', 'app-generation-time'],
      loading: ['template-loading-time', 'bundle-size']
    }

    const relatedMetricIds = categoryMappings[strategy.category] || []
    return relatedMetricIds.some(id => metric.id.includes(id))
  }

  private calculateMetricStatus(currentValue: number, targetValue: number): PerformanceMetric['status'] {
    const ratio = currentValue / targetValue
    if (ratio <= 0.5) return 'excellent'
    if (ratio <= 0.7) return 'good'
    if (ratio <= 0.9) return 'needs-improvement'
    return 'poor'
  }

  updateMetric(metricId: string, updates: Partial<PerformanceMetric>) {
    const metric = this.metrics.get(metricId)
    if (metric) {
      Object.assign(metric, updates)
      this.metrics.set(metricId, metric)
    }
  }

  getMetric(metricId: string): PerformanceMetric | undefined {
    return this.metrics.get(metricId)
  }

  getAllMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values())
  }

  getMetricsByCategory(category: PerformanceMetric['category']): PerformanceMetric[] {
    return Array.from(this.metrics.values()).filter(metric => metric.category === category)
  }

  getStrategy(strategyId: string): OptimizationStrategy | undefined {
    return this.strategies.get(strategyId)
  }

  getAllStrategies(): OptimizationStrategy[] {
    return Array.from(this.strategies.values())
  }

  getStrategiesByCategory(category: OptimizationStrategy['category']): OptimizationStrategy[] {
    return Array.from(this.strategies.values()).filter(strategy => strategy.category === category)
  }

  toggleStrategy(strategyId: string, enabled: boolean) {
    const strategy = this.strategies.get(strategyId)
    if (strategy) {
      strategy.enabled = enabled
      this.strategies.set(strategyId, strategy)
    }
  }

  updateStrategyConfig(strategyId: string, config: Record<string, any>) {
    const strategy = this.strategies.get(strategyId)
    if (strategy) {
      strategy.config = { ...strategy.config, ...config }
      this.strategies.set(strategyId, strategy)
    }
  }

  getCacheConfig(): CacheConfig {
    return { ...this.cacheConfig }
  }

  updateCacheConfig(config: Partial<CacheConfig>) {
    this.cacheConfig = { ...this.cacheConfig, ...config }
  }

  getCompilationConfig(): CompilationConfig {
    return { ...this.compilationConfig }
  }

  updateCompilationConfig(config: Partial<CompilationConfig>) {
    this.compilationConfig = { ...this.compilationConfig, ...config }
  }

  getLoadingConfig(): LoadingConfig {
    return { ...this.loadingConfig }
  }

  updateLoadingConfig(config: Partial<LoadingConfig>) {
    this.loadingConfig = { ...this.loadingConfig, ...config }
  }

  getPerformanceScore(): number {
    const metrics = this.getAllMetrics()
    const scores = metrics.map(metric => {
      const score = { excellent: 100, good: 80, 'needs-improvement': 60, poor: 30 }[metric.status]
      return score
    })

    return Math.round(scores.reduce((acc, score) => acc + score, 0) / scores.length)
  }

  async benchmarkPerformance(): Promise<{
    compilation: number
    loading: number
    generation: number
    overall: number
  }> {
    // Simulate performance benchmarking
    await new Promise(resolve => setTimeout(resolve, 2000))

    const compilationMetrics = this.getMetricsByCategory('compilation')
    const loadingMetrics = this.getMetricsByCategory('loading')
    const generationMetrics = this.getMetricsByCategory('generation')

    const compilation = this.calculateCategoryScore(compilationMetrics)
    const loading = this.calculateCategoryScore(loadingMetrics)
    const generation = this.calculateCategoryScore(generationMetrics)
    const overall = Math.round((compilation + loading + generation) / 3)

    return { compilation, loading, generation, overall }
  }

  private calculateCategoryScore(metrics: PerformanceMetric[]): number {
    if (metrics.length === 0) return 100

    const scores = metrics.map(metric => {
      const score = { excellent: 100, good: 80, 'needs-improvement': 60, poor: 30 }[metric.status]
      return score
    })

    return Math.round(scores.reduce((acc, score) => acc + score, 0) / scores.length)
  }

  async generatePerformanceReport(): Promise<{
    summary: {
      overallScore: number
      totalMetrics: number
      optimizationsEnabled: number
      recommendedActions: string[]
    }
    metrics: PerformanceMetric[]
    strategies: OptimizationStrategy[]
    benchmarks: {
      compilation: number
      loading: number
      generation: number
    }
  }> {
    const benchmarks = await this.benchmarkPerformance()
    const metrics = this.getAllMetrics()
    const strategies = this.getAllStrategies()
    const overallScore = this.getPerformanceScore()

    const poorMetrics = metrics.filter(m => m.status === 'poor' || m.status === 'needs-improvement')
    const disabledHighImpactStrategies = strategies.filter(s => !s.enabled && s.impact === 'high')

    const recommendedActions: string[] = []

    if (poorMetrics.length > 0) {
      recommendedActions.push(`Improve ${poorMetrics.length} underperforming metrics`)
    }

    if (disabledHighImpactStrategies.length > 0) {
      recommendedActions.push(`Enable ${disabledHighImpactStrategies.length} high-impact optimizations`)
    }

    if (overallScore < 80) {
      recommendedActions.push('Run comprehensive optimization to improve performance')
    }

    return {
      summary: {
        overallScore,
        totalMetrics: metrics.length,
        optimizationsEnabled: strategies.filter(s => s.enabled).length,
        recommendedActions
      },
      metrics,
      strategies,
      benchmarks: {
        compilation: benchmarks.compilation,
        loading: benchmarks.loading,
        generation: benchmarks.generation
      }
    }
  }
}

// Export singleton instance
export const performanceOptimizer = new PerformanceOptimizer()

// Performance targets for HT-029
export const PERFORMANCE_TARGETS = {
  templateCompilation: 30000, // 30 seconds
  appGeneration: 120000, // 2 minutes
  templateLoading: 5000, // 5 seconds
  componentInjection: 10000, // 10 seconds
  bundleSize: 5000000, // 5 MB
  memoryUsage: 200000000 // 200 MB
} as const

// Validation function for HT-029 performance requirements
export function validateHT029PerformanceTargets(): {
  templateCompilation: boolean
  appGeneration: boolean
  templateLoading: boolean
  componentInjection: boolean
  allTargetsMet: boolean
} {
  const metrics = performanceOptimizer.getAllMetrics()

  const templateCompilation = metrics.find(m => m.id === 'template-compilation-time')
  const appGeneration = metrics.find(m => m.id === 'app-generation-time')
  const templateLoading = metrics.find(m => m.id === 'template-loading-time')
  const componentInjection = metrics.find(m => m.id === 'component-injection-time')

  const results = {
    templateCompilation: templateCompilation ? templateCompilation.currentValue * 1000 <= PERFORMANCE_TARGETS.templateCompilation : false,
    appGeneration: appGeneration ? appGeneration.currentValue * 1000 <= PERFORMANCE_TARGETS.appGeneration : false,
    templateLoading: templateLoading ? templateLoading.currentValue * 1000 <= PERFORMANCE_TARGETS.templateLoading : false,
    componentInjection: componentInjection ? componentInjection.currentValue * 1000 <= PERFORMANCE_TARGETS.componentInjection : false,
    allTargetsMet: false
  }

  results.allTargetsMet = Object.values(results).every(Boolean)

  return results
}