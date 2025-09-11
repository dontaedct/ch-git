/**
 * @fileoverview HT-011.1.6: Brand Validation Framework React Hooks
 * @module lib/branding/validation-hooks
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-011.1.6 - Create Brand Validation Framework
 * Focus: Create React hooks for brand validation with real-time feedback
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: MEDIUM (branding system enhancement)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BrandValidationFramework, 
  ValidationReport, 
  ValidationResult, 
  ValidationConfig,
  ValidationRule,
  BrandValidationUtils 
} from './validation-framework';
import { DynamicBrandConfig } from './logo-manager';
import { BrandPreset } from './preset-manager';

/**
 * Hook for brand validation with real-time feedback
 */
export function useBrandValidation(config?: DynamicBrandConfig) {
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationConfig, setValidationConfig] = useState<ValidationConfig>({
    accessibility: true,
    usability: true,
    design: true,
    branding: true,
    minWcagLevel: 'AA'
  });

  const validator = useMemo(() => new BrandValidationFramework(validationConfig), [validationConfig]);

  const validateBrand = useCallback(async (brandConfig: DynamicBrandConfig) => {
    setLoading(true);
    setError(null);

    try {
      const report = validator.validateBrand(brandConfig);
      setValidationReport(report);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setLoading(false);
    }
  }, [validator]);

  const validatePreset = useCallback(async (preset: BrandPreset) => {
    const config: DynamicBrandConfig = {
      logo: preset.logo,
      brandName: preset.brandName,
      isCustom: false,
      presetName: preset.id
    };
    
    await validateBrand(config);
  }, [validateBrand]);

  const quickValidate = useCallback((brandConfig: DynamicBrandConfig) => {
    try {
      const results = BrandValidationUtils.quickValidate(brandConfig);
      return results;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Quick validation failed');
      return [];
    }
  }, []);

  // Auto-validate when config changes
  useEffect(() => {
    if (config) {
      validateBrand(config);
    }
  }, [config, validateBrand]);

  const criticalIssues = useMemo(() => {
    return validationReport ? BrandValidationUtils.getCriticalIssues(validationReport) : [];
  }, [validationReport]);

  const warnings = useMemo(() => {
    return validationReport ? BrandValidationUtils.getWarnings(validationReport) : [];
  }, [validationReport]);

  const isWcagCompliant = useCallback((level: 'A' | 'AA' | 'AAA' = 'AA') => {
    return validationReport ? BrandValidationUtils.isWcagCompliant(validationReport, level) : false;
  }, [validationReport]);

  const validationSummary = useMemo(() => {
    return validationReport ? BrandValidationUtils.getValidationSummary(validationReport) : '';
  }, [validationReport]);

  return {
    validationReport,
    loading,
    error,
    criticalIssues,
    warnings,
    isWcagCompliant,
    validationSummary,
    validateBrand,
    validatePreset,
    quickValidate,
    validationConfig,
    setValidationConfig
  };
}

/**
 * Hook for real-time validation as user types
 */
export function useRealtimeValidation() {
  const [debouncedConfig, setDebouncedConfig] = useState<DynamicBrandConfig | null>(null);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  const { validationReport, loading, criticalIssues, warnings, validateBrand } = useBrandValidation();

  const updateConfig = useCallback((config: DynamicBrandConfig) => {
    // Clear existing timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Set new timeout for debounced validation
    const timeout = setTimeout(() => {
      setDebouncedConfig(config);
    }, 500); // 500ms debounce

    setDebounceTimeout(timeout);
  }, [debounceTimeout]);

  // Validate when debounced config changes
  useEffect(() => {
    if (debouncedConfig) {
      validateBrand(debouncedConfig);
    }
  }, [debouncedConfig, validateBrand]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  return {
    validationReport,
    loading,
    criticalIssues,
    warnings,
    updateConfig
  };
}

/**
 * Hook for validation configuration management
 */
export function useValidationConfig() {
  const [config, setConfig] = useState<ValidationConfig>({
    accessibility: true,
    usability: true,
    design: true,
    branding: true,
    minWcagLevel: 'AA'
  });

  const updateConfig = useCallback((updates: Partial<ValidationConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig({
      accessibility: true,
      usability: true,
      design: true,
      branding: true,
      minWcagLevel: 'AA'
    });
  }, []);

  const toggleCategory = useCallback((category: keyof ValidationConfig) => {
    if (category === 'minWcagLevel') return;
    
    setConfig(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  }, []);

  const setWcagLevel = useCallback((level: 'A' | 'AA' | 'AAA') => {
    setConfig(prev => ({
      ...prev,
      minWcagLevel: level
    }));
  }, []);

  return {
    config,
    updateConfig,
    resetConfig,
    toggleCategory,
    setWcagLevel
  };
}

/**
 * Hook for custom validation rules management
 */
export function useCustomValidationRules() {
  const [rules, setRules] = useState<ValidationRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addRule = useCallback((rule: ValidationRule) => {
    setRules(prev => [...prev, rule]);
  }, []);

  const removeRule = useCallback((ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
  }, []);

  const updateRule = useCallback((ruleId: string, updates: Partial<ValidationRule>) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
  }, []);

  const clearRules = useCallback(() => {
    setRules([]);
  }, []);

  const createRule = useCallback((
    id: string,
    name: string,
    category: 'accessibility' | 'usability' | 'design' | 'branding',
    severity: 'error' | 'warning' | 'info',
    validator: (config: DynamicBrandConfig) => ValidationResult,
    wcagLevel?: 'A' | 'AA' | 'AAA'
  ) => {
    const rule: ValidationRule = {
      id,
      name,
      category,
      severity,
      wcagLevel,
      validator
    };
    
    addRule(rule);
    return rule;
  }, [addRule]);

  return {
    rules,
    loading,
    error,
    addRule,
    removeRule,
    updateRule,
    clearRules,
    createRule
  };
}

/**
 * Hook for validation reporting and analytics
 */
export function useValidationAnalytics() {
  const [validationHistory, setValidationHistory] = useState<ValidationReport[]>([]);
  const [analytics, setAnalytics] = useState<{
    totalValidations: number;
    averagePassRate: number;
    commonIssues: Array<{ id: string; name: string; count: number }>;
    wcagComplianceRate: Record<string, number>;
  }>({
    totalValidations: 0,
    averagePassRate: 0,
    commonIssues: [],
    wcagComplianceRate: {}
  });

  const addValidationReport = useCallback((report: ValidationReport) => {
    setValidationHistory(prev => [...prev.slice(-99), report]); // Keep last 100 reports
  }, []);

  const updateAnalytics = useCallback(() => {
    if (validationHistory.length === 0) return;

    const totalValidations = validationHistory.length;
    const averagePassRate = validationHistory.reduce((sum, report) => 
      sum + (report.passedChecks / report.totalChecks), 0
    ) / totalValidations;

    // Count common issues
    const issueCounts: Record<string, number> = {};
    validationHistory.forEach(report => {
      report.results.forEach(result => {
        if (!result.passed) {
          issueCounts[result.id] = (issueCounts[result.id] || 0) + 1;
        }
      });
    });

    const commonIssues = Object.entries(issueCounts)
      .map(([id, count]) => {
        const result = validationHistory[0]?.results.find(r => r.id === id);
        return {
          id,
          name: result?.name || id,
          count
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate WCAG compliance rates
    const wcagComplianceRate: Record<string, number> = {};
    ['A', 'AA', 'AAA'].forEach(level => {
      const compliantReports = validationHistory.filter(report => 
        BrandValidationUtils.isWcagCompliant(report, level as 'A' | 'AA' | 'AAA')
      );
      wcagComplianceRate[level] = (compliantReports.length / totalValidations) * 100;
    });

    setAnalytics({
      totalValidations,
      averagePassRate,
      commonIssues,
      wcagComplianceRate
    });
  }, [validationHistory]);

  useEffect(() => {
    updateAnalytics();
  }, [updateAnalytics]);

  const clearHistory = useCallback(() => {
    setValidationHistory([]);
  }, []);

  const exportAnalytics = useCallback(() => {
    return {
      validationHistory,
      analytics,
      exportDate: new Date().toISOString()
    };
  }, [validationHistory, analytics]);

  return {
    validationHistory,
    analytics,
    addValidationReport,
    clearHistory,
    exportAnalytics
  };
}

/**
 * Hook for validation status indicators
 */
export function useValidationStatus(validationReport: ValidationReport | null) {
  const status = useMemo(() => {
    if (!validationReport) return 'unknown';

    const { criticalIssues, warnings } = BrandValidationUtils;
    const critical = criticalIssues(validationReport);
    const warning = warnings(validationReport);

    if (critical.length > 0) return 'error';
    if (warning.length > 0) return 'warning';
    if (validationReport.isValid) return 'success';
    return 'info';
  }, [validationReport]);

  const statusColor = useMemo(() => {
    switch (status) {
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'success': return 'text-green-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  }, [status]);

  const statusIcon = useMemo(() => {
    switch (status) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      default: return '❓';
    }
  }, [status]);

  const statusMessage = useMemo(() => {
    if (!validationReport) return 'No validation performed';

    const { criticalIssues, warnings } = BrandValidationUtils;
    const critical = criticalIssues(validationReport);
    const warning = warnings(validationReport);

    if (critical.length > 0) {
      return `${critical.length} critical issue${critical.length > 1 ? 's' : ''} found`;
    }
    if (warning.length > 0) {
      return `${warning.length} warning${warning.length > 1 ? 's' : ''} found`;
    }
    if (validationReport.isValid) {
      return 'All validations passed';
    }
    return 'Validation completed with issues';
  }, [validationReport]);

  return {
    status,
    statusColor,
    statusIcon,
    statusMessage
  };
}

/**
 * Hook for comprehensive brand validation management
 */
export function useBrandValidationSystem() {
  const validation = useBrandValidation();
  const realtimeValidation = useRealtimeValidation();
  const config = useValidationConfig();
  const customRules = useCustomValidationRules();
  const analytics = useValidationAnalytics();
  const status = useValidationStatus(validation.validationReport);

  const validateWithAnalytics = useCallback(async (config: DynamicBrandConfig) => {
    await validation.validateBrand(config);
    
    if (validation.validationReport) {
      analytics.addValidationReport(validation.validationReport);
    }
  }, [validation, analytics]);

  const validatePresetWithAnalytics = useCallback(async (preset: BrandPreset) => {
    await validation.validatePreset(preset);
    
    if (validation.validationReport) {
      analytics.addValidationReport(validation.validationReport);
    }
  }, [validation, analytics]);

  return {
    // Validation state
    validationReport: validation.validationReport,
    loading: validation.loading,
    error: validation.error,
    
    // Validation results
    criticalIssues: validation.criticalIssues,
    warnings: validation.warnings,
    isWcagCompliant: validation.isWcagCompliant,
    validationSummary: validation.validationSummary,
    
    // Validation actions
    validateBrand: validateWithAnalytics,
    validatePreset: validatePresetWithAnalytics,
    quickValidate: validation.quickValidate,
    
    // Configuration
    validationConfig: config.config,
    updateValidationConfig: config.updateConfig,
    resetValidationConfig: config.resetConfig,
    toggleValidationCategory: config.toggleCategory,
    setWcagLevel: config.setWcagLevel,
    
    // Custom rules
    customRules: customRules.rules,
    addCustomRule: customRules.addRule,
    removeCustomRule: customRules.removeRule,
    updateCustomRule: customRules.updateRule,
    clearCustomRules: customRules.clearRules,
    createCustomRule: customRules.createRule,
    
    // Analytics
    validationHistory: analytics.validationHistory,
    validationAnalytics: analytics.analytics,
    clearValidationHistory: analytics.clearHistory,
    exportValidationAnalytics: analytics.exportAnalytics,
    
    // Status
    validationStatus: status.status,
    statusColor: status.statusColor,
    statusIcon: status.statusIcon,
    statusMessage: status.statusMessage,
    
    // Realtime validation
    updateRealtimeConfig: realtimeValidation.updateConfig,
    realtimeLoading: realtimeValidation.loading,
    realtimeCriticalIssues: realtimeValidation.criticalIssues,
    realtimeWarnings: realtimeValidation.warnings
  };
}
