/**
 * @fileoverview Type-Safe Utilities
 * @module lib/types/type-safe-utils
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Type-Safe Utilities
 * Purpose: Replace dangerous type assertions with safe type utilities
 * Safety: Comprehensive type safety with proper error handling
 */

/**
 * Safe type assertion with runtime validation
 */
export function safeAssert<T>(value: unknown, validator: (val: unknown) => val is T): T {
  if (!validator(value)) {
    throw new Error(`Type assertion failed: expected ${typeof value} to match validator`);
  }
  return value;
}

/**
 * Safe type assertion for objects with schema validation
 */
export function safeAssertObject<T extends Record<string, unknown>>(
  value: unknown,
  schema: Record<keyof T, (val: unknown) => boolean>
): T {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Expected object, got ' + typeof value);
  }

  const obj = value as Record<string, unknown>;
  const result = {} as T;

  for (const [key, validator] of Object.entries(schema)) {
    if (!(key in obj)) {
      throw new Error(`Missing required property: ${key}`);
    }
    if (!validator(obj[key])) {
      throw new Error(`Invalid type for property ${key}: expected validator to pass`);
    }
    result[key as keyof T] = obj[key] as T[keyof T];
  }

  return result;
}

/**
 * Safe array type assertion
 */
export function safeAssertArray<T>(
  value: unknown,
  itemValidator: (val: unknown) => val is T
): T[] {
  if (!Array.isArray(value)) {
    throw new Error('Expected array, got ' + typeof value);
  }

  return value.map((item, index) => {
    if (!itemValidator(item)) {
      throw new Error(`Invalid array item at index ${index}`);
    }
    return item;
  });
}

/**
 * Safe property access with type checking
 */
export function safeGetProperty<T, K extends keyof T>(
  obj: T,
  key: K,
  validator?: (val: unknown) => val is T[K]
): T[K] | undefined {
  const value = obj[key];
  if (validator && !validator(value)) {
    return undefined;
  }
  return value;
}

/**
 * Safe JSON parsing with type validation
 */
export function safeParseJSON<T>(
  jsonString: string,
  validator: (val: unknown) => val is T
): T {
  try {
    const parsed = JSON.parse(jsonString);
    if (!validator(parsed)) {
      throw new Error('Parsed JSON does not match expected type');
    }
    return parsed;
  } catch (error) {
    throw new Error(`JSON parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Type-safe object sanitization
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: unknown,
  schema: Record<keyof T, (val: unknown) => T[keyof T]>
): T {
  if (typeof obj !== 'object' || obj === null) {
    throw new Error('Expected object for sanitization');
  }

  const input = obj as Record<string, unknown>;
  const result = {} as T;

  for (const [key, sanitizer] of Object.entries(schema)) {
    if (key in input) {
      try {
        result[key as keyof T] = sanitizer(input[key]);
      } catch (error) {
        throw new Error(`Sanitization failed for property ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  return result;
}

/**
 * Type-safe form data validation
 */
export function validateFormData<T extends Record<string, unknown>>(
  data: unknown,
  schema: Record<keyof T, (val: unknown) => T[keyof T]>
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  try {
    const validated = sanitizeObject<T>(data, schema);
    return { success: true, data: validated };
  } catch (error) {
    return {
      success: false,
      errors: {
        validation: error instanceof Error ? error.message : 'Unknown validation error'
      }
    };
  }
}

/**
 * Type-safe API response wrapper
 */
export function createApiResponse<T>(
  success: boolean,
  data?: T,
  error?: string,
  message?: string
): {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
} {
  return {
    success,
    data,
    error,
    message,
    timestamp: new Date().toISOString()
  };
}

/**
 * Type-safe error handling
 */
export function handleError(error: unknown): {
  message: string;
  code?: string;
  details?: unknown;
} {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'name' in error ? String(error.name) : undefined,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  }

  if (typeof error === 'string') {
    return { message: error };
  }

  if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, unknown>;
    return {
      message: typeof obj.message === 'string' ? obj.message : 'Unknown error',
      code: typeof obj.code === 'string' ? obj.code : undefined,
      details: obj.details
    };
  }

  return { message: 'Unknown error occurred' };
}

/**
 * Type-safe callback wrapper
 */
export function safeCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  errorHandler?: (error: unknown) => void
): T {
  return ((...args: Parameters<T>) => {
    try {
      return callback(...args);
    } catch (error) {
      if (errorHandler) {
        errorHandler(error);
      } else {
        console.error('Callback error:', error);
      }
      return undefined;
    }
  }) as T;
}

/**
 * Type-safe async callback wrapper
 */
export function safeAsyncCallback<T extends (...args: unknown[]) => Promise<unknown>>(
  callback: T,
  errorHandler?: (error: unknown) => void
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await callback(...args);
    } catch (error) {
      if (errorHandler) {
        errorHandler(error);
      } else {
        console.error('Async callback error:', error);
      }
      return undefined;
    }
  }) as T;
}

/**
 * Type-safe memory access (for performance monitoring)
 */
export function safeGetMemoryInfo(): {
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
} {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const memory = (performance as unknown as { memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    }}).memory;

    if (memory) {
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      };
    }
  } catch (error) {
    console.warn('Failed to access memory info:', error);
  }

  return {};
}

/**
 * Type-safe garbage collection trigger
 */
export function safeTriggerGC(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const gc = (window as unknown as { gc?: () => void }).gc;
    if (gc) {
      gc();
      return true;
    }
  } catch (error) {
    console.warn('Failed to trigger garbage collection:', error);
  }

  return false;
}
