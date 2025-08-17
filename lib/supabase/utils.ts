/**
 * 🚀 MIT HERO SYSTEM - SUPABASE UTILITIES
 * 
 * Common utility functions for Supabase operations with proper error handling,
 * retry logic, and performance monitoring.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Database, TableName, Row, Insert, Update } from './types';
import { logger } from '@/lib/logger';

// Retry configuration
const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
};

// Exponential backoff delay calculation
function calculateDelay(attempt: number): number {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt - 1);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
}

// Generic retry wrapper for Supabase operations
async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  context?: string
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= RETRY_CONFIG.maxAttempts; attempt++) {
    try {
      const startTime = Date.now();
      const result = await operation();
      const duration = Date.now() - startTime;
      
      logger.debug(`${operationName} succeeded on attempt ${attempt}`, {
        operationName,
        attempt,
        duration,
        context
      });
      
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      logger.warn(`${operationName} failed on attempt ${attempt}`, {
        operationName,
        attempt,
        error: lastError.message,
        context
      });
      
      if (attempt === RETRY_CONFIG.maxAttempts) {
        break;
      }
      
      // Wait before retrying
      const delay = calculateDelay(attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  logger.error(`${operationName} failed after ${RETRY_CONFIG.maxAttempts} attempts`, {
    operationName,
    maxAttempts: RETRY_CONFIG.maxAttempts,
    finalError: lastError!.message,
    context
  });
  
  throw lastError!;
}

// Generic select operation with retry
export async function safeSelect<T extends TableName>(
  client: SupabaseClient<Database>,
  table: T,
  query: string = '*',
  options?: {
    filters?: Record<string, any>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    offset?: number;
  }
): Promise<Row<T>[]> {
  return withRetry(async () => {
    let queryBuilder = client.from(table).select(query);
    
    // Apply filters
    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryBuilder = queryBuilder.eq(key, value);
        }
      });
    }
    
    // Apply ordering
    if (options?.orderBy) {
      queryBuilder = queryBuilder.order(options.orderBy.column, {
        ascending: options.orderBy.ascending ?? true
      });
    }
    
    // Apply pagination
    if (options?.limit) {
      queryBuilder = queryBuilder.limit(options.limit);
    }
    
    if (options?.offset) {
      queryBuilder = queryBuilder.range(options.offset, (options.offset + (options.limit || 10)) - 1);
    }
    
    const { data, error } = await queryBuilder;
    
    if (error) {
      throw new Error(`Select operation failed: ${error.message}`);
    }
    
    return (data as unknown as Row<T>[]) || [];
  }, `select_${table}`);
}

// Generic insert operation with retry
export async function safeInsert<T extends TableName>(
  client: SupabaseClient<Database>,
  table: T,
  data: Insert<T> | Insert<T>[]
): Promise<Row<T>[]> {
  return withRetry(async () => {
    const { data: result, error } = await client
      .from(table)
      .insert(data)
      .select();
    
    if (error) {
      throw new Error(`Insert operation failed: ${error.message}`);
    }
    
    return result || [];
  }, `insert_${table}`);
}

// Generic update operation with retry
export async function safeUpdate<T extends TableName>(
  client: SupabaseClient<Database>,
  table: T,
  data: Update<T>,
  filters: Record<string, any>
): Promise<Row<T>[]> {
  return withRetry(async () => {
    let queryBuilder = client.from(table).update(data);
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryBuilder = queryBuilder.eq(key, value);
      }
    });
    
    const { data: result, error } = await queryBuilder.select();
    
    if (error) {
      throw new Error(`Update operation failed: ${error.message}`);
    }
    
    return result || [];
  }, `update_${table}`);
}

// Generic delete operation with retry
export async function safeDelete<T extends TableName>(
  client: SupabaseClient<Database>,
  table: T,
  filters: Record<string, any>
): Promise<Row<T>[]> {
  return withRetry(async () => {
    let queryBuilder = client.from(table).delete();
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryBuilder = queryBuilder.eq(key, value);
      }
    });
    
    const { data: result, error } = await queryBuilder.select();
    
    if (error) {
      throw new Error(`Delete operation failed: ${error.message}`);
    }
    
    return result || [];
  }, `delete_${table}`);
}

// Batch operations with transaction-like behavior
export async function safeBatchOperation<T extends TableName>(
  client: SupabaseClient<Database>,
  operations: Array<{
    type: 'insert' | 'update' | 'delete';
    table: T;
    data?: Insert<T> | Update<T>;
    filters?: Record<string, any>;
  }>
): Promise<{ success: boolean; results: any[]; errors: string[] }> {
  const results: any[] = [];
  const errors: string[] = [];
  
  for (const operation of operations) {
    try {
      let result: any;
      
      switch (operation.type) {
        case 'insert':
          if (!operation.data) {
            throw new Error('Data required for insert operation');
          }
          result = await safeInsert(client, operation.table, operation.data as Insert<T>);
          break;
          
        case 'update':
          if (!operation.data || !operation.filters) {
            throw new Error('Data and filters required for update operation');
          }
          result = await safeUpdate(client, operation.table, operation.data, operation.filters);
          break;
          
        case 'delete':
          if (!operation.filters) {
            throw new Error('Filters required for delete operation');
          }
          result = await safeDelete(client, operation.table, operation.filters);
          break;
          
        default:
          throw new Error(`Unknown operation type: ${(operation as any).type}`);
      }
      
      results.push({ operation: operation.type, table: operation.table, result });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(`${operation.type} on ${operation.table}: ${errorMessage}`);
      
      // Log the error but continue with other operations
      logger.warn(`Batch operation failed`, {
        operation: operation.type,
        table: operation.table,
        error: errorMessage
      });
    }
  }
  
  return {
    success: errors.length === 0,
    results,
    errors
  };
}

// Connection health check utility
export async function checkConnectionHealth(
  client: SupabaseClient<Database>
): Promise<{ healthy: boolean; responseTime: number; error?: string }> {
  const startTime = Date.now();
  
  try {
    // Simple query to test connection
    const { error } = await client.from('clients').select('count').limit(1);
    const responseTime = Date.now() - startTime;
    
    if (error) {
      return {
        healthy: false,
        responseTime,
        error: error.message
      };
    }
    
    return {
      healthy: true,
      responseTime
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      healthy: false,
      responseTime,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Performance monitoring utility
export function createPerformanceMonitor(operationName: string) {
  const startTime = Date.now();
  
  return {
    end: () => {
      const duration = Date.now() - startTime;
      logger.debug(`${operationName} completed`, { duration, operationName });
      return duration;
    },
    log: (message: string, metadata?: Record<string, any>) => {
      const duration = Date.now() - startTime;
      logger.info(message, { duration, operationName, ...metadata });
    }
  };
}
