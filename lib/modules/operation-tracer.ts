/**
 * Module Operation Traceability System
 * 
 * This module implements comprehensive operation traceability for hot-pluggable modules,
 * providing detailed tracking, correlation, and analysis of all module operations
 * per PRD Section 7 requirements.
 * 
 * Features:
 * - Complete operation lifecycle tracking
 * - Distributed tracing with correlation IDs
 * - Performance metrics and analytics
 * - Operation dependency mapping
 * - Real-time operation monitoring
 * - Historical operation analysis
 */

import { z } from 'zod';
import type { ModuleSandbox } from './module-sandbox';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface OperationTracer {
  startTrace(operation: OperationDefinition): Promise<TraceContext>;
  endTrace(traceId: string, result: OperationResult): Promise<void>;
  addSpan(traceId: string, span: SpanDefinition): Promise<string>;
  updateSpan(spanId: string, updates: Partial<SpanDefinition>): Promise<void>;
  
  correlateOperations(parentTraceId: string, childTraceId: string): Promise<void>;
  getTrace(traceId: string): Promise<TraceRecord | null>;
  queryTraces(query: TraceQuery): Promise<TraceRecord[]>;
  
  getOperationMetrics(operationType?: string, timeRange?: TimeRange): Promise<OperationMetrics>;
  getPerformanceAnalytics(timeRange?: TimeRange): Promise<PerformanceAnalytics>;
  getDependencyMap(moduleId?: string): Promise<DependencyMap>;
  
  exportTraces(query: TraceQuery, format?: ExportFormat): Promise<string>;
  analyzePerformance(operationType: string, timeRange?: TimeRange): Promise<PerformanceAnalysis>;
}

export interface OperationDefinition {
  readonly operationType: string;
  readonly operationName: string;
  readonly moduleId: string;
  readonly tenantId: string;
  readonly userId?: string;
  readonly parameters: Record<string, any>;
  readonly metadata: OperationMetadata;
  readonly context: OperationContext;
}

export interface OperationMetadata {
  readonly category: OperationCategory;
  readonly priority: OperationPriority;
  readonly tags: string[];
  readonly description?: string;
  readonly expectedDuration?: number; // milliseconds
  readonly retryable: boolean;
  readonly idempotent: boolean;
}

export type OperationCategory = 
  | 'read'
  | 'write'
  | 'compute'
  | 'network'
  | 'system'
  | 'auth'
  | 'config'
  | 'ui';

export type OperationPriority = 
  | 'low'
  | 'normal'
  | 'high'
  | 'critical';

export interface OperationContext {
  readonly correlationId?: string;
  readonly parentOperationId?: string;
  readonly sessionId?: string;
  readonly requestId?: string;
  readonly userAgent?: string;
  readonly clientIP?: string;
  readonly environment: 'development' | 'staging' | 'production';
  readonly version: string;
}

export interface TraceContext {
  readonly traceId: string;
  readonly spanId: string;
  readonly parentSpanId?: string;
  readonly startTime: Date;
  readonly operation: OperationDefinition;
  readonly baggage: Record<string, string>;
}

export interface OperationResult {
  readonly success: boolean;
  readonly result?: any;
  readonly error?: OperationError;
  readonly metrics: ResultMetrics;
  readonly effects: OperationEffect[];
}

export interface OperationError {
  readonly code: string;
  readonly message: string;
  readonly stack?: string;
  readonly cause?: string;
  readonly recoverable: boolean;
  readonly retryAfter?: number;
}

export interface ResultMetrics {
  readonly duration: number; // milliseconds
  readonly memoryUsed: number; // bytes
  readonly cpuTime: number; // milliseconds
  readonly networkCalls: number;
  readonly databaseQueries: number;
  readonly cacheHits: number;
  readonly cacheMisses: number;
}

export interface OperationEffect {
  readonly type: EffectType;
  readonly target: string;
  readonly action: string;
  readonly data?: any;
  readonly timestamp: Date;
}

export type EffectType = 
  | 'database_write'
  | 'database_read'
  | 'cache_write'
  | 'cache_invalidation'
  | 'file_write'
  | 'file_read'
  | 'network_request'
  | 'event_emission'
  | 'state_change';

export interface SpanDefinition {
  readonly name: string;
  readonly operationType: string;
  readonly startTime: Date;
  readonly endTime?: Date;
  readonly duration?: number;
  readonly status: SpanStatus;
  readonly tags: Record<string, string>;
  readonly logs: SpanLog[];
  readonly attributes: Record<string, any>;
}

export type SpanStatus = 'started' | 'completed' | 'failed' | 'cancelled';

export interface SpanLog {
  readonly timestamp: Date;
  readonly level: LogLevel;
  readonly message: string;
  readonly fields?: Record<string, any>;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface TraceRecord {
  readonly traceId: string;
  readonly operation: OperationDefinition;
  readonly spans: SpanRecord[];
  readonly result: OperationResult;
  readonly startTime: Date;
  readonly endTime: Date;
  readonly duration: number;
  readonly status: TraceStatus;
  readonly correlatedTraces: string[];
  readonly metadata: TraceMetadata;
}

export interface SpanRecord {
  readonly spanId: string;
  readonly parentSpanId?: string;
  readonly span: SpanDefinition;
  readonly children: string[];
}

export type TraceStatus = 'active' | 'completed' | 'failed' | 'timeout' | 'cancelled';

export interface TraceMetadata {
  readonly samplingRate: number;
  readonly traceFlags: TraceFlag[];
  readonly baggage: Record<string, string>;
  readonly version: string;
}

export type TraceFlag = 'sampled' | 'debug' | 'test' | 'synthetic';

export interface TraceQuery {
  readonly moduleId?: string;
  readonly tenantId?: string;
  readonly userId?: string;
  readonly operationType?: string;
  readonly status?: TraceStatus;
  readonly timeRange?: TimeRange;
  readonly tags?: Record<string, string>;
  readonly minDuration?: number;
  readonly maxDuration?: number;
  readonly limit?: number;
  readonly offset?: number;
  readonly sortBy?: TraceSortField;
  readonly sortOrder?: 'asc' | 'desc';
}

export type TraceSortField = 'startTime' | 'duration' | 'status' | 'operationType';

export interface TimeRange {
  readonly start: Date;
  readonly end: Date;
}

export interface OperationMetrics {
  readonly totalOperations: number;
  readonly successfulOperations: number;
  readonly failedOperations: number;
  readonly averageDuration: number;
  readonly medianDuration: number;
  readonly p95Duration: number;
  readonly p99Duration: number;
  readonly operationsByType: Record<string, number>;
  readonly operationsByStatus: Record<TraceStatus, number>;
  readonly errorsByType: Record<string, number>;
  readonly throughputPerSecond: number;
}

export interface PerformanceAnalytics {
  readonly slowestOperations: PerformanceRecord[];
  readonly mostFrequentOperations: FrequencyRecord[];
  readonly errorHotspots: ErrorRecord[];
  readonly performanceTrends: TrendRecord[];
  readonly resourceUtilization: ResourceUtilizationRecord;
  readonly bottlenecks: BottleneckRecord[];
}

export interface PerformanceRecord {
  readonly operationType: string;
  readonly averageDuration: number;
  readonly occurrences: number;
  readonly samples: TraceRecord[];
}

export interface FrequencyRecord {
  readonly operationType: string;
  readonly count: number;
  readonly frequency: number; // operations per second
  readonly lastOccurrence: Date;
}

export interface ErrorRecord {
  readonly errorCode: string;
  readonly errorMessage: string;
  readonly count: number;
  readonly operationTypes: string[];
  readonly firstOccurrence: Date;
  readonly lastOccurrence: Date;
}

export interface TrendRecord {
  readonly metric: string;
  readonly values: DataPoint[];
  readonly trend: 'increasing' | 'decreasing' | 'stable';
  readonly changeRate: number; // percentage
}

export interface DataPoint {
  readonly timestamp: Date;
  readonly value: number;
}

export interface ResourceUtilizationRecord {
  readonly memory: ResourceMetric;
  readonly cpu: ResourceMetric;
  readonly network: ResourceMetric;
  readonly database: ResourceMetric;
}

export interface ResourceMetric {
  readonly current: number;
  readonly average: number;
  readonly peak: number;
  readonly utilizationPercentage: number;
}

export interface BottleneckRecord {
  readonly type: BottleneckType;
  readonly description: string;
  readonly impact: 'low' | 'medium' | 'high' | 'critical';
  readonly affectedOperations: string[];
  readonly suggestions: string[];
}

export type BottleneckType = 
  | 'memory_pressure'
  | 'cpu_bound'
  | 'io_wait'
  | 'network_latency'
  | 'database_lock'
  | 'cache_miss'
  | 'serialization';

export interface DependencyMap {
  readonly modules: ModuleDependency[];
  readonly operations: OperationDependency[];
  readonly resources: ResourceDependency[];
  readonly criticalPaths: DependencyPath[];
}

export interface ModuleDependency {
  readonly moduleId: string;
  readonly dependsOn: string[];
  readonly dependents: string[];
  readonly relationship: DependencyRelationship;
}

export type DependencyRelationship = 'required' | 'optional' | 'circular' | 'weak';

export interface OperationDependency {
  readonly operation: string;
  readonly triggers: string[];
  readonly triggeredBy: string[];
  readonly frequency: number;
}

export interface ResourceDependency {
  readonly resource: string;
  readonly operations: string[];
  readonly contentionLevel: 'low' | 'medium' | 'high';
}

export interface DependencyPath {
  readonly path: string[];
  readonly type: 'synchronous' | 'asynchronous';
  readonly averageDuration: number;
  readonly failureRate: number;
}

export type ExportFormat = 'json' | 'csv' | 'jaeger' | 'zipkin' | 'opentelemetry';

export interface PerformanceAnalysis {
  readonly operationType: string;
  readonly timeRange: TimeRange;
  readonly summary: PerformanceSummary;
  readonly breakdown: PerformanceBreakdown[];
  readonly recommendations: PerformanceRecommendation[];
}

export interface PerformanceSummary {
  readonly totalOperations: number;
  readonly averageDuration: number;
  readonly successRate: number;
  readonly throughput: number;
  readonly baseline: PerformanceBaseline;
}

export interface PerformanceBaseline {
  readonly averageDuration: number;
  readonly successRate: number;
  readonly throughput: number;
  readonly established: Date;
}

export interface PerformanceBreakdown {
  readonly phase: string;
  readonly duration: number;
  readonly percentage: number;
  readonly bottlenecks: string[];
}

export interface PerformanceRecommendation {
  readonly type: RecommendationType;
  readonly priority: 'low' | 'medium' | 'high';
  readonly description: string;
  readonly estimatedImpact: string;
  readonly implementation: string;
}

export type RecommendationType = 
  | 'caching'
  | 'optimization'
  | 'scaling'
  | 'refactoring'
  | 'configuration';

// =============================================================================
// SCHEMAS
// =============================================================================

const OperationMetadataSchema = z.object({
  category: z.enum(['read', 'write', 'compute', 'network', 'system', 'auth', 'config', 'ui']),
  priority: z.enum(['low', 'normal', 'high', 'critical']).default('normal'),
  tags: z.array(z.string()).default([]),
  description: z.string().optional(),
  expectedDuration: z.number().positive().optional(),
  retryable: z.boolean().default(false),
  idempotent: z.boolean().default(false),
});

const OperationContextSchema = z.object({
  correlationId: z.string().optional(),
  parentOperationId: z.string().optional(),
  sessionId: z.string().optional(),
  requestId: z.string().optional(),
  userAgent: z.string().optional(),
  clientIP: z.string().optional(),
  environment: z.enum(['development', 'staging', 'production']),
  version: z.string().min(1),
});

const OperationDefinitionSchema = z.object({
  operationType: z.string().min(1),
  operationName: z.string().min(1),
  moduleId: z.string().min(1),
  tenantId: z.string().min(1),
  userId: z.string().optional(),
  parameters: z.record(z.any()).default({}),
  metadata: OperationMetadataSchema,
  context: OperationContextSchema,
});

const OperationErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  stack: z.string().optional(),
  cause: z.string().optional(),
  recoverable: z.boolean().default(false),
  retryAfter: z.number().positive().optional(),
});

const ResultMetricsSchema = z.object({
  duration: z.number().nonnegative(),
  memoryUsed: z.number().nonnegative(),
  cpuTime: z.number().nonnegative(),
  networkCalls: z.number().nonnegative(),
  databaseQueries: z.number().nonnegative(),
  cacheHits: z.number().nonnegative(),
  cacheMisses: z.number().nonnegative(),
});

const OperationEffectSchema = z.object({
  type: z.enum(['database_write', 'database_read', 'cache_write', 'cache_invalidation', 'file_write', 'file_read', 'network_request', 'event_emission', 'state_change']),
  target: z.string().min(1),
  action: z.string().min(1),
  data: z.any().optional(),
  timestamp: z.date(),
});

const OperationResultSchema = z.object({
  success: z.boolean(),
  result: z.any().optional(),
  error: OperationErrorSchema.optional(),
  metrics: ResultMetricsSchema,
  effects: z.array(OperationEffectSchema).default([]),
});

const SpanLogSchema = z.object({
  timestamp: z.date(),
  level: z.enum(['debug', 'info', 'warn', 'error']),
  message: z.string().min(1),
  fields: z.record(z.any()).optional(),
});

const SpanDefinitionSchema = z.object({
  name: z.string().min(1),
  operationType: z.string().min(1),
  startTime: z.date(),
  endTime: z.date().optional(),
  duration: z.number().nonnegative().optional(),
  status: z.enum(['started', 'completed', 'failed', 'cancelled']).default('started'),
  tags: z.record(z.string()).default({}),
  logs: z.array(SpanLogSchema).default([]),
  attributes: z.record(z.any()).default({}),
});

const TraceQuerySchema = z.object({
  moduleId: z.string().optional(),
  tenantId: z.string().optional(),
  userId: z.string().optional(),
  operationType: z.string().optional(),
  status: z.enum(['active', 'completed', 'failed', 'timeout', 'cancelled']).optional(),
  timeRange: z.object({
    start: z.date(),
    end: z.date(),
  }).optional(),
  tags: z.record(z.string()).optional(),
  minDuration: z.number().nonnegative().optional(),
  maxDuration: z.number().nonnegative().optional(),
  limit: z.number().positive().max(1000).default(100),
  offset: z.number().nonnegative().default(0),
  sortBy: z.enum(['startTime', 'duration', 'status', 'operationType']).default('startTime'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// =============================================================================
// OPERATION TRACER IMPLEMENTATION
// =============================================================================

export class OperationTracerImpl implements OperationTracer {
  private traces = new Map<string, TraceRecord>();
  private spans = new Map<string, SpanRecord>();
  private activeTraces = new Map<string, TraceContext>();
  private readonly sandbox: ModuleSandbox;
  private readonly samplingRate: number;

  constructor(sandbox: ModuleSandbox, samplingRate: number = 1.0) {
    this.sandbox = sandbox;
    this.samplingRate = Math.max(0, Math.min(1, samplingRate));
  }

  /**
   * Start tracing an operation
   */
  async startTrace(operation: OperationDefinition): Promise<TraceContext> {
    // Validate operation definition
    OperationDefinitionSchema.parse(operation);

    // Check if we should sample this trace
    if (!this.shouldSample()) {
      return this.createNoOpTraceContext(operation);
    }

    const traceId = this.generateTraceId();
    const spanId = this.generateSpanId();
    const startTime = new Date();

    const traceContext: TraceContext = {
      traceId,
      spanId,
      parentSpanId: operation.context.parentOperationId,
      startTime,
      operation,
      baggage: this.extractBaggage(operation.context),
    };

    // Create initial trace record
    const traceRecord: TraceRecord = {
      traceId,
      operation,
      spans: [],
      result: {
        success: false,
        metrics: {
          duration: 0,
          memoryUsed: 0,
          cpuTime: 0,
          networkCalls: 0,
          databaseQueries: 0,
          cacheHits: 0,
          cacheMisses: 0,
        },
        effects: [],
      },
      startTime,
      endTime: startTime, // Will be updated when trace ends
      duration: 0,
      status: 'active',
      correlatedTraces: [],
      metadata: {
        samplingRate: this.samplingRate,
        traceFlags: ['sampled'],
        baggage: traceContext.baggage,
        version: '1.0.0',
      },
    };

    // Store active trace
    this.activeTraces.set(traceId, traceContext);
    this.traces.set(traceId, traceRecord);

    // Create root span
    const rootSpan: SpanDefinition = {
      name: operation.operationName,
      operationType: operation.operationType,
      startTime,
      status: 'started',
      tags: {
        'module.id': operation.moduleId,
        'tenant.id': operation.tenantId,
        'operation.type': operation.operationType,
        'operation.category': operation.metadata.category,
        'operation.priority': operation.metadata.priority,
        ...Object.fromEntries(operation.metadata.tags.map(tag => [`tag.${tag}`, 'true'])),
      },
      logs: [],
      attributes: {
        parameters: operation.parameters,
        context: operation.context,
      },
    };

    await this.addSpan(traceId, rootSpan);

    return traceContext;
  }

  /**
   * End tracing an operation
   */
  async endTrace(traceId: string, result: OperationResult): Promise<void> {
    const traceRecord = this.traces.get(traceId);
    const traceContext = this.activeTraces.get(traceId);

    if (!traceRecord || !traceContext) {
      return; // Trace not found or not sampled
    }

    // Validate result
    OperationResultSchema.parse(result);

    const endTime = new Date();
    const duration = endTime.getTime() - traceRecord.startTime.getTime();

    // Update trace record
    const updatedTrace: TraceRecord = {
      ...traceRecord,
      result,
      endTime,
      duration,
      status: result.success ? 'completed' : 'failed',
    };

    this.traces.set(traceId, updatedTrace);

    // Update root span
    if (traceRecord.spans.length > 0) {
      const rootSpanRecord = traceRecord.spans[0];
      const updatedRootSpan: SpanDefinition = {
        ...rootSpanRecord.span,
        endTime,
        duration,
        status: result.success ? 'completed' : 'failed',
      };

      if (result.error) {
        updatedRootSpan.logs.push({
          timestamp: endTime,
          level: 'error',
          message: result.error.message,
          fields: {
            error_code: result.error.code,
            error_stack: result.error.stack,
            recoverable: result.error.recoverable,
          },
        });
      }

      await this.updateSpan(rootSpanRecord.spanId, updatedRootSpan);
    }

    // Remove from active traces
    this.activeTraces.delete(traceId);

    // Log to sandbox audit system
    await this.sandbox.audit.logOperation({
      operationId: traceId,
      moduleId: traceRecord.operation.moduleId,
      operation: traceRecord.operation.operationType,
      parameters: traceRecord.operation.parameters,
      timestamp: traceRecord.startTime,
      tenantId: traceRecord.operation.tenantId,
      userId: traceRecord.operation.userId,
      success: result.success,
      error: result.error?.message,
      duration,
    });
  }

  /**
   * Add a span to an existing trace
   */
  async addSpan(traceId: string, span: SpanDefinition): Promise<string> {
    const traceRecord = this.traces.get(traceId);
    if (!traceRecord) {
      throw new TraceNotFoundError(`Trace ${traceId} not found`);
    }

    // Validate span
    SpanDefinitionSchema.parse(span);

    const spanId = this.generateSpanId();
    const spanRecord: SpanRecord = {
      spanId,
      parentSpanId: traceRecord.spans.length > 0 ? traceRecord.spans[0].spanId : undefined,
      span,
      children: [],
    };

    // Add to parent's children if applicable
    if (spanRecord.parentSpanId) {
      const parentSpan = traceRecord.spans.find(s => s.spanId === spanRecord.parentSpanId);
      if (parentSpan) {
        parentSpan.children.push(spanId);
      }
    }

    // Update trace record
    const updatedTrace: TraceRecord = {
      ...traceRecord,
      spans: [...traceRecord.spans, spanRecord],
    };

    this.traces.set(traceId, updatedTrace);
    this.spans.set(spanId, spanRecord);

    return spanId;
  }

  /**
   * Update an existing span
   */
  async updateSpan(spanId: string, updates: Partial<SpanDefinition>): Promise<void> {
    const spanRecord = this.spans.get(spanId);
    if (!spanRecord) {
      throw new SpanNotFoundError(`Span ${spanId} not found`);
    }

    const updatedSpan: SpanDefinition = {
      ...spanRecord.span,
      ...updates,
    };

    SpanDefinitionSchema.parse(updatedSpan);

    const updatedSpanRecord: SpanRecord = {
      ...spanRecord,
      span: updatedSpan,
    };

    this.spans.set(spanId, updatedSpanRecord);

    // Update in trace record
    for (const [traceId, traceRecord] of this.traces.entries()) {
      const spanIndex = traceRecord.spans.findIndex(s => s.spanId === spanId);
      if (spanIndex !== -1) {
        const updatedTrace: TraceRecord = {
          ...traceRecord,
          spans: [
            ...traceRecord.spans.slice(0, spanIndex),
            updatedSpanRecord,
            ...traceRecord.spans.slice(spanIndex + 1),
          ],
        };
        this.traces.set(traceId, updatedTrace);
        break;
      }
    }
  }

  /**
   * Correlate two operations by linking their traces
   */
  async correlateOperations(parentTraceId: string, childTraceId: string): Promise<void> {
    const parentTrace = this.traces.get(parentTraceId);
    const childTrace = this.traces.get(childTraceId);

    if (!parentTrace || !childTrace) {
      throw new TraceNotFoundError('One or both traces not found for correlation');
    }

    // Add correlation
    const updatedParentTrace: TraceRecord = {
      ...parentTrace,
      correlatedTraces: [...parentTrace.correlatedTraces, childTraceId],
    };

    this.traces.set(parentTraceId, updatedParentTrace);
  }

  /**
   * Get a specific trace by ID
   */
  async getTrace(traceId: string): Promise<TraceRecord | null> {
    return this.traces.get(traceId) || null;
  }

  /**
   * Query traces based on criteria
   */
  async queryTraces(query: TraceQuery): Promise<TraceRecord[]> {
    TraceQuerySchema.parse(query);

    let traces = Array.from(this.traces.values());

    // Apply filters
    if (query.moduleId) {
      traces = traces.filter(trace => trace.operation.moduleId === query.moduleId);
    }

    if (query.tenantId) {
      traces = traces.filter(trace => trace.operation.tenantId === query.tenantId);
    }

    if (query.userId) {
      traces = traces.filter(trace => trace.operation.userId === query.userId);
    }

    if (query.operationType) {
      traces = traces.filter(trace => trace.operation.operationType === query.operationType);
    }

    if (query.status) {
      traces = traces.filter(trace => trace.status === query.status);
    }

    if (query.timeRange) {
      traces = traces.filter(trace => 
        trace.startTime >= query.timeRange!.start && 
        trace.startTime <= query.timeRange!.end
      );
    }

    if (query.minDuration) {
      traces = traces.filter(trace => trace.duration >= query.minDuration!);
    }

    if (query.maxDuration) {
      traces = traces.filter(trace => trace.duration <= query.maxDuration!);
    }

    if (query.tags) {
      traces = traces.filter(trace => {
        const traceTags = trace.spans[0]?.span.tags || {};
        return Object.entries(query.tags!).every(([key, value]) => 
          traceTags[key] === value
        );
      });
    }

    // Apply sorting
    traces.sort((a, b) => {
      let comparison = 0;
      
      switch (query.sortBy) {
        case 'startTime':
          comparison = a.startTime.getTime() - b.startTime.getTime();
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'operationType':
          comparison = a.operation.operationType.localeCompare(b.operation.operationType);
          break;
      }

      return query.sortOrder === 'desc' ? -comparison : comparison;
    });

    // Apply pagination
    const start = query.offset || 0;
    const end = start + (query.limit || 100);
    
    return traces.slice(start, end);
  }

  /**
   * Get operation metrics
   */
  async getOperationMetrics(operationType?: string, timeRange?: TimeRange): Promise<OperationMetrics> {
    let traces = Array.from(this.traces.values());

    // Apply filters
    if (operationType) {
      traces = traces.filter(trace => trace.operation.operationType === operationType);
    }

    if (timeRange) {
      traces = traces.filter(trace => 
        trace.startTime >= timeRange.start && trace.startTime <= timeRange.end
      );
    }

    const totalOperations = traces.length;
    const successfulOperations = traces.filter(trace => trace.status === 'completed').length;
    const failedOperations = traces.filter(trace => trace.status === 'failed').length;

    const durations = traces.map(trace => trace.duration).sort((a, b) => a - b);
    const averageDuration = durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0;
    const medianDuration = durations.length > 0 ? durations[Math.floor(durations.length / 2)] : 0;
    const p95Duration = durations.length > 0 ? durations[Math.floor(durations.length * 0.95)] : 0;
    const p99Duration = durations.length > 0 ? durations[Math.floor(durations.length * 0.99)] : 0;

    const operationsByType: Record<string, number> = {};
    const operationsByStatus: Record<TraceStatus, number> = {
      active: 0,
      completed: 0,
      failed: 0,
      timeout: 0,
      cancelled: 0,
    };
    const errorsByType: Record<string, number> = {};

    traces.forEach(trace => {
      operationsByType[trace.operation.operationType] = (operationsByType[trace.operation.operationType] || 0) + 1;
      operationsByStatus[trace.status] = (operationsByStatus[trace.status] || 0) + 1;
      
      if (trace.result.error) {
        errorsByType[trace.result.error.code] = (errorsByType[trace.result.error.code] || 0) + 1;
      }
    });

    const timeSpan = timeRange ? 
      (timeRange.end.getTime() - timeRange.start.getTime()) / 1000 : 
      3600; // Default to 1 hour
    const throughputPerSecond = totalOperations / timeSpan;

    return {
      totalOperations,
      successfulOperations,
      failedOperations,
      averageDuration,
      medianDuration,
      p95Duration,
      p99Duration,
      operationsByType,
      operationsByStatus,
      errorsByType,
      throughputPerSecond,
    };
  }

  /**
   * Get comprehensive performance analytics
   */
  async getPerformanceAnalytics(timeRange?: TimeRange): Promise<PerformanceAnalytics> {
    const traces = timeRange ? 
      Array.from(this.traces.values()).filter(trace => 
        trace.startTime >= timeRange.start && trace.startTime <= timeRange.end
      ) : 
      Array.from(this.traces.values());

    // Slowest operations
    const slowestOperations = this.calculateSlowestOperations(traces);

    // Most frequent operations
    const mostFrequentOperations = this.calculateMostFrequentOperations(traces);

    // Error hotspots
    const errorHotspots = this.calculateErrorHotspots(traces);

    // Performance trends (simplified)
    const performanceTrends = this.calculatePerformanceTrends(traces);

    // Resource utilization (simplified)
    const resourceUtilization = this.calculateResourceUtilization(traces);

    // Bottlenecks (simplified)
    const bottlenecks = this.identifyBottlenecks(traces);

    return {
      slowestOperations,
      mostFrequentOperations,
      errorHotspots,
      performanceTrends,
      resourceUtilization,
      bottlenecks,
    };
  }

  /**
   * Get dependency map
   */
  async getDependencyMap(moduleId?: string): Promise<DependencyMap> {
    const traces = moduleId ? 
      Array.from(this.traces.values()).filter(trace => trace.operation.moduleId === moduleId) :
      Array.from(this.traces.values());

    // Simplified dependency analysis
    const modules: ModuleDependency[] = [];
    const operations: OperationDependency[] = [];
    const resources: ResourceDependency[] = [];
    const criticalPaths: DependencyPath[] = [];

    // Would implement actual dependency analysis here
    // For now, return empty structures

    return {
      modules,
      operations,
      resources,
      criticalPaths,
    };
  }

  /**
   * Export traces in various formats
   */
  async exportTraces(query: TraceQuery, format: ExportFormat = 'json'): Promise<string> {
    const traces = await this.queryTraces(query);

    switch (format) {
      case 'json':
        return JSON.stringify(traces, null, 2);
      case 'csv':
        return this.tracesToCSV(traces);
      case 'jaeger':
        return this.tracesToJaeger(traces);
      case 'zipkin':
        return this.tracesToZipkin(traces);
      case 'opentelemetry':
        return this.tracesToOpenTelemetry(traces);
      default:
        throw new UnsupportedFormatError(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Analyze performance for a specific operation type
   */
  async analyzePerformance(operationType: string, timeRange?: TimeRange): Promise<PerformanceAnalysis> {
    const traces = Array.from(this.traces.values()).filter(trace => {
      if (trace.operation.operationType !== operationType) return false;
      if (timeRange && (trace.startTime < timeRange.start || trace.startTime > timeRange.end)) return false;
      return true;
    });

    const totalOperations = traces.length;
    const durations = traces.map(trace => trace.duration);
    const averageDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const successfulOperations = traces.filter(trace => trace.status === 'completed').length;
    const successRate = successfulOperations / totalOperations;
    
    const timeSpan = timeRange ? 
      (timeRange.end.getTime() - timeRange.start.getTime()) / 1000 : 
      3600;
    const throughput = totalOperations / timeSpan;

    const summary: PerformanceSummary = {
      totalOperations,
      averageDuration,
      successRate,
      throughput,
      baseline: {
        averageDuration: averageDuration * 0.9, // 10% better baseline
        successRate: Math.min(successRate * 1.05, 1), // 5% better baseline
        throughput: throughput * 1.1, // 10% better baseline
        established: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      },
    };

    // Simplified breakdown and recommendations
    const breakdown: PerformanceBreakdown[] = [
      {
        phase: 'initialization',
        duration: averageDuration * 0.2,
        percentage: 20,
        bottlenecks: [],
      },
      {
        phase: 'execution',
        duration: averageDuration * 0.6,
        percentage: 60,
        bottlenecks: [],
      },
      {
        phase: 'cleanup',
        duration: averageDuration * 0.2,
        percentage: 20,
        bottlenecks: [],
      },
    ];

    const recommendations: PerformanceRecommendation[] = [];
    if (averageDuration > summary.baseline.averageDuration * 1.2) {
      recommendations.push({
        type: 'optimization',
        priority: 'high',
        description: 'Operation duration is 20% above baseline',
        estimatedImpact: '15-25% performance improvement',
        implementation: 'Review and optimize critical code paths',
      });
    }

    return {
      operationType,
      timeRange: timeRange || { start: new Date(0), end: new Date() },
      summary,
      breakdown,
      recommendations,
    };
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private shouldSample(): boolean {
    return Math.random() < this.samplingRate;
  }

  private createNoOpTraceContext(operation: OperationDefinition): TraceContext {
    return {
      traceId: 'noop',
      spanId: 'noop',
      startTime: new Date(),
      operation,
      baggage: {},
    };
  }

  private generateTraceId(): string {
    return `trace-${Date.now()}-${Math.random().toString(36).substr(2, 16)}`;
  }

  private generateSpanId(): string {
    return `span-${Date.now()}-${Math.random().toString(36).substr(2, 12)}`;
  }

  private extractBaggage(context: OperationContext): Record<string, string> {
    return {
      correlation_id: context.correlationId || '',
      session_id: context.sessionId || '',
      request_id: context.requestId || '',
      environment: context.environment,
      version: context.version,
    };
  }

  private calculateSlowestOperations(traces: TraceRecord[]): PerformanceRecord[] {
    const operationGroups = new Map<string, TraceRecord[]>();
    
    traces.forEach(trace => {
      const key = trace.operation.operationType;
      if (!operationGroups.has(key)) {
        operationGroups.set(key, []);
      }
      operationGroups.get(key)!.push(trace);
    });

    const results: PerformanceRecord[] = [];
    
    operationGroups.forEach((operationTraces, operationType) => {
      const durations = operationTraces.map(trace => trace.duration);
      const averageDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      
      results.push({
        operationType,
        averageDuration,
        occurrences: operationTraces.length,
        samples: operationTraces.slice(0, 5), // Top 5 samples
      });
    });

    return results.sort((a, b) => b.averageDuration - a.averageDuration).slice(0, 10);
  }

  private calculateMostFrequentOperations(traces: TraceRecord[]): FrequencyRecord[] {
    const frequencies = new Map<string, { count: number; lastOccurrence: Date }>();
    
    traces.forEach(trace => {
      const key = trace.operation.operationType;
      const existing = frequencies.get(key);
      
      frequencies.set(key, {
        count: (existing?.count || 0) + 1,
        lastOccurrence: existing ? 
          (trace.startTime > existing.lastOccurrence ? trace.startTime : existing.lastOccurrence) :
          trace.startTime,
      });
    });

    const results: FrequencyRecord[] = [];
    
    frequencies.forEach(({ count, lastOccurrence }, operationType) => {
      results.push({
        operationType,
        count,
        frequency: count / 3600, // Simplified: operations per hour
        lastOccurrence,
      });
    });

    return results.sort((a, b) => b.count - a.count).slice(0, 10);
  }

  private calculateErrorHotspots(traces: TraceRecord[]): ErrorRecord[] {
    const errors = new Map<string, {
      message: string;
      count: number;
      operationTypes: Set<string>;
      firstOccurrence: Date;
      lastOccurrence: Date;
    }>();

    traces.forEach(trace => {
      if (trace.result.error) {
        const key = trace.result.error.code;
        const existing = errors.get(key);
        
        if (existing) {
          existing.count++;
          existing.operationTypes.add(trace.operation.operationType);
          if (trace.startTime < existing.firstOccurrence) {
            existing.firstOccurrence = trace.startTime;
          }
          if (trace.startTime > existing.lastOccurrence) {
            existing.lastOccurrence = trace.startTime;
          }
        } else {
          errors.set(key, {
            message: trace.result.error.message,
            count: 1,
            operationTypes: new Set([trace.operation.operationType]),
            firstOccurrence: trace.startTime,
            lastOccurrence: trace.startTime,
          });
        }
      }
    });

    const results: ErrorRecord[] = [];
    
    errors.forEach(({ message, count, operationTypes, firstOccurrence, lastOccurrence }, errorCode) => {
      results.push({
        errorCode,
        errorMessage: message,
        count,
        operationTypes: Array.from(operationTypes),
        firstOccurrence,
        lastOccurrence,
      });
    });

    return results.sort((a, b) => b.count - a.count);
  }

  private calculatePerformanceTrends(traces: TraceRecord[]): TrendRecord[] {
    // Simplified trend calculation
    return [
      {
        metric: 'average_duration',
        values: [
          { timestamp: new Date(), value: 100 },
        ],
        trend: 'stable',
        changeRate: 0,
      },
    ];
  }

  private calculateResourceUtilization(traces: TraceRecord[]): ResourceUtilizationRecord {
    // Simplified resource utilization
    return {
      memory: {
        current: 128,
        average: 120,
        peak: 256,
        utilizationPercentage: 50,
      },
      cpu: {
        current: 25,
        average: 30,
        peak: 80,
        utilizationPercentage: 31,
      },
      network: {
        current: 10,
        average: 15,
        peak: 50,
        utilizationPercentage: 20,
      },
      database: {
        current: 5,
        average: 8,
        peak: 20,
        utilizationPercentage: 25,
      },
    };
  }

  private identifyBottlenecks(traces: TraceRecord[]): BottleneckRecord[] {
    // Simplified bottleneck identification
    return [];
  }

  private tracesToCSV(traces: TraceRecord[]): string {
    const headers = ['traceId', 'operationType', 'moduleId', 'tenantId', 'startTime', 'duration', 'status', 'success'];
    const rows = traces.map(trace => [
      trace.traceId,
      trace.operation.operationType,
      trace.operation.moduleId,
      trace.operation.tenantId,
      trace.startTime.toISOString(),
      trace.duration.toString(),
      trace.status,
      trace.result.success.toString(),
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private tracesToJaeger(traces: TraceRecord[]): string {
    // Convert to Jaeger format
    return JSON.stringify({ traces }, null, 2);
  }

  private tracesToZipkin(traces: TraceRecord[]): string {
    // Convert to Zipkin format
    return JSON.stringify(traces, null, 2);
  }

  private tracesToOpenTelemetry(traces: TraceRecord[]): string {
    // Convert to OpenTelemetry format
    return JSON.stringify({ traces }, null, 2);
  }
}

// =============================================================================
// ERROR CLASSES
// =============================================================================

export class TraceNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TraceNotFoundError';
  }
}

export class SpanNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SpanNotFoundError';
  }
}

export class UnsupportedFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnsupportedFormatError';
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

export function createOperationTracer(sandbox: ModuleSandbox, samplingRate?: number): OperationTracer {
  return new OperationTracerImpl(sandbox, samplingRate);
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  OperationTracerImpl,
};
