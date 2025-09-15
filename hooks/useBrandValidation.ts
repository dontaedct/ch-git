/**
 * @fileoverview HT-011.2.7: Brand Configuration Validation React Hooks
 * @module hooks/useBrandValidation
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-011.2.7 - Implement Brand Configuration Validation
 * Focus: React hooks for brand configuration validation integration
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: MEDIUM (branding system enhancement)
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BrandValidationResult, 
  BrandValidationError, 
  BrandValidationWarning,
  ValidationContext 
} from '@/lib/branding/brand-config-validation';
import { TenantBrandConfig } from '@/lib/branding/types';

/**
 * Brand validation state
 */
interface BrandValidationState {
  /** Current validation result */
  result: BrandValidationResult | null;
  /** Whether validation is in progress */
  isValidating: boolean;
  /** Last validation error */
  error: string | null;
  /** Validation timestamp */
  lastValidated: Date | null;
  /** Validation duration */
  duration: number;
}

/**
 * Brand validation options
 */
interface BrandValidationOptions {
  /** Auto-validate on configuration changes */
  autoValidate?: boolean;
  /** Validation debounce delay in milliseconds */
  debounceMs?: number;
  /** Validation context */
  context?: ValidationContext;
  /** Enable caching */
  enableCache?: boolean;
}

/**
 * Hook for brand configuration validation
 */
export function useBrandValidation(
  config: TenantBrandConfig | null,
  options: BrandValidationOptions = {}
) {
  const {
    autoValidate = true,
    debounceMs = 500,
    context = { strictness: 'standard' },
    enableCache = true
  } = options;

  const [state, setState] = useState<BrandValidationState>({
    result: null,
    isValidating: false,
    error: null,
    lastValidated: null,
    duration: 0
  });

  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  /**
   * Validate brand configuration
   */
  const validate = useCallback(async (configToValidate: TenantBrandConfig) => {
    setState(prev => ({ ...prev, isValidating: true, error: null }));

    try {
      const startTime = Date.now();
      
      // Import validation service dynamically to avoid SSR issues
      const { brandConfigValidator } = await import('@/lib/branding/brand-config-validation');
      
      const result = await brandConfigValidator.validateBrandConfig(configToValidate, context);
      const duration = Date.now() - startTime;

      setState(prev => ({
        ...prev,
        result,
        isValidating: false,
        lastValidated: new Date(),
        duration
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Validation failed';
      
      setState(prev => ({
        ...prev,
        isValidating: false,
        error: errorMessage
      }));

      throw error;
    }
  }, [context]);

  /**
   * Debounced validation
   */
  const debouncedValidate = useCallback((configToValidate: TenantBrandConfig) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      validate(configToValidate);
    }, debounceMs);

    setDebounceTimer(timer);
  }, [validate, debounceMs]);

  /**
   * Auto-validate when config changes
   */
  useEffect(() => {
    if (!config || !autoValidate) return;

    debouncedValidate(config);

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [config, autoValidate, debouncedValidate, debounceTimer]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  /**
   * Manual validation trigger
   */
  const triggerValidation = useCallback(() => {
    if (!config) return Promise.resolve(null);
    return validate(config);
  }, [config, validate]);

  /**
   * Clear validation result
   */
  const clearValidation = useCallback(() => {
    setState(prev => ({
      ...prev,
      result: null,
      error: null,
      lastValidated: null,
      duration: 0
    }));
  }, []);

  /**
   * Computed validation summary
   */
  const summary = useMemo(() => {
    if (!state.result) return null;

    const { errors, warnings, overallScore, valid } = state.result;
    
    return {
      status: valid ? 'valid' : 'invalid',
      score: overallScore,
      errorCount: errors.length,
      warningCount: warnings.length,
      criticalErrors: errors.filter(e => e.severity === 'error').length,
      message: valid 
        ? `✅ Brand configuration is valid (${overallScore}/100)`
        : `❌ Brand configuration has ${errors.length} errors and ${warnings.length} warnings (${overallScore}/100)`
    };
  }, [state.result]);

  /**
   * Validation statistics
   */
  const statistics = useMemo(() => {
    if (!state.result) return null;

    const { errors, warnings } = state.result;
    
    return {
      accessibility: {
        score: state.result.accessibilityScore,
        issues: errors.filter(e => e.category === 'accessibility').length
      },
      usability: {
        score: state.result.usabilityScore,
        issues: errors.filter(e => e.category === 'usability').length
      },
      design: {
        score: state.result.designScore,
        issues: errors.filter(e => e.category === 'design').length
      },
      branding: {
        score: state.result.brandScore,
        issues: errors.filter(e => e.category === 'branding').length
      },
      wcag: state.result.wcagCompliance
    };
  }, [state.result]);

  return {
    ...state,
    summary,
    statistics,
    validate: triggerValidation,
    clearValidation,
    isValid: state.result?.valid ?? false,
    hasErrors: (state.result?.errors.length ?? 0) > 0,
    hasWarnings: (state.result?.warnings.length ?? 0) > 0
  };
}

/**
 * Hook for brand preset validation
 */
export function useBrandPresetValidation(
  presetId: string | null,
  context: ValidationContext = { strictness: 'standard' }
) {
  const [state, setState] = useState<BrandValidationState>({
    result: null,
    isValidating: false,
    error: null,
    lastValidated: null,
    duration: 0
  });

  const validatePreset = useCallback(async (presetIdToValidate: string) => {
    setState(prev => ({ ...prev, isValidating: true, error: null }));

    try {
      const startTime = Date.now();
      
      // Import validation service and preset manager dynamically
      const { brandConfigValidator } = await import('@/lib/branding/brand-config-validation');
      const { brandPresetManager } = await import('@/lib/branding/preset-manager');

      const preset = await brandPresetManager.getPreset(presetIdToValidate);
      if (!preset) {
        throw new Error('Preset not found');
      }

      const result = await brandConfigValidator.validateBrandPreset(preset, context);
      const duration = Date.now() - startTime;

      setState(prev => ({
        ...prev,
        result,
        isValidating: false,
        lastValidated: new Date(),
        duration
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Preset validation failed';
      
      setState(prev => ({
        ...prev,
        isValidating: false,
        error: errorMessage
      }));

      throw error;
    }
  }, [context]);

  useEffect(() => {
    if (presetId) {
      validatePreset(presetId);
    }
  }, [presetId, validatePreset]);

  return {
    ...state,
    validatePreset,
    isValid: state.result?.valid ?? false,
    hasErrors: (state.result?.errors.length ?? 0) > 0,
    hasWarnings: (state.result?.warnings.length ?? 0) > 0
  };
}

/**
 * Hook for validation statistics
 */
export function useValidationStatistics() {
  const [statistics, setStatistics] = useState<{
    totalValidations: number;
    averageScore: number;
    errorRate: number;
    warningRate: number;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { brandConfigValidator } = await import('@/lib/branding/brand-config-validation');
      const stats = brandConfigValidator.getValidationStats();
      
      setStatistics(stats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch statistics';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    statistics,
    isLoading,
    error,
    refetch: fetchStatistics
  };
}

/**
 * Hook for validation history
 */
export function useValidationHistory(tenantId?: string) {
  const [history, setHistory] = useState<BrandValidationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!tenantId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/brand/validation-history?tenantId=${tenantId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch validation history');
      }

      const data = await response.json();
      setHistory(data.history || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch history';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    history,
    isLoading,
    error,
    refetch: fetchHistory,
    clearHistory
  };
}

/**
 * Hook for real-time validation monitoring
 */
export function useValidationMonitoring(tenantId?: string) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const startMonitoring = useCallback(() => {
    if (!tenantId) return;

    setIsMonitoring(true);
    
    // Set up WebSocket connection for real-time updates
    const ws = new WebSocket(`ws://localhost:3000/api/validation-monitor?tenantId=${tenantId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'validation_update') {
        setLastUpdate(new Date());
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsMonitoring(false);
    };

    ws.onclose = () => {
      setIsMonitoring(false);
    };

    return () => {
      ws.close();
    };
  }, [tenantId]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  useEffect(() => {
    const cleanup = startMonitoring();
    return cleanup;
  }, [startMonitoring]);

  return {
    isMonitoring,
    lastUpdate,
    startMonitoring,
    stopMonitoring
  };
}
