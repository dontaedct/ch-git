/**
 * @fileoverview HT-011.1.8: Brand Preview and Testing React Hooks
 * @module lib/branding/preview-testing-hooks
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-011.1.8 - Implement Brand Preview and Testing System
 * Focus: React hooks for brand preview and testing functionality
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: LOW (branding system enhancement)
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  BrandPreviewTestingManager,
  BrandPreviewState,
  BrandPreviewConfig,
  BrandTestScenario,
  BrandTestResult
} from './preview-testing-manager';
import { DynamicBrandConfig } from './logo-manager';
import { BrandPreset } from './preset-manager';

/**
 * Hook for brand preview functionality
 */
export function useBrandPreview() {
  const [previewState, setPreviewState] = useState<BrandPreviewState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const managerRef = useRef<BrandPreviewTestingManager | null>(null);

  // Initialize manager
  useEffect(() => {
    managerRef.current = new BrandPreviewTestingManager();
    setPreviewState(managerRef.current.getPreviewState());
    
    return () => {
      managerRef.current?.cleanup();
    };
  }, []);

  /**
   * Update brand configuration
   */
  const updateBrandConfig = useCallback(async (brandConfig: DynamicBrandConfig) => {
    if (!managerRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await managerRef.current.updateBrandConfig(brandConfig);
      setPreviewState(managerRef.current.getPreviewState());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update brand configuration';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update preview configuration
   */
  const updatePreviewConfig = useCallback(async (previewConfig: Partial<BrandPreviewConfig>) => {
    if (!managerRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await managerRef.current.updatePreviewConfig(previewConfig);
      setPreviewState(managerRef.current.getPreviewState());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update preview configuration';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh preview
   */
  const refreshPreview = useCallback(async () => {
    if (!managerRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await managerRef.current.refreshPreview();
      setPreviewState(managerRef.current.getPreviewState());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh preview';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Set preview container
   */
  const setPreviewContainer = useCallback((container: HTMLElement | null) => {
    if (!managerRef.current || !container) return;
    
    managerRef.current.setPreviewContainer(container);
  }, []);

  /**
   * Start auto-refresh
   */
  const startAutoRefresh = useCallback((interval: number = 5000) => {
    if (!managerRef.current) return;
    
    managerRef.current.startAutoRefresh(interval);
  }, []);

  /**
   * Stop auto-refresh
   */
  const stopAutoRefresh = useCallback(() => {
    if (!managerRef.current) return;
    
    managerRef.current.stopAutoRefresh();
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    previewState,
    isLoading,
    error,
    updateBrandConfig,
    updatePreviewConfig,
    refreshPreview,
    setPreviewContainer,
    startAutoRefresh,
    stopAutoRefresh,
    clearError
  };
}

/**
 * Hook for brand testing functionality
 */
export function useBrandTesting() {
  const [testScenarios, setTestScenarios] = useState<BrandTestScenario[]>([]);
  const [testResults, setTestResults] = useState<BrandTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const managerRef = useRef<BrandPreviewTestingManager | null>(null);

  // Initialize manager
  useEffect(() => {
    managerRef.current = new BrandPreviewTestingManager();
    setTestScenarios(managerRef.current.getTestScenarios());
    setTestResults(managerRef.current.getTestResults());
    
    return () => {
      managerRef.current?.cleanup();
    };
  }, []);

  /**
   * Run single test scenario
   */
  const runTestScenario = useCallback(async (scenarioId: string) => {
    if (!managerRef.current) return;
    
    setIsRunning(true);
    setCurrentTest(scenarioId);
    setError(null);
    
    try {
      const result = await managerRef.current.runTestScenario(scenarioId);
      setTestResults(prev => [...prev, result]);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to run test scenario';
      setError(errorMessage);
      throw err;
    } finally {
      setIsRunning(false);
      setCurrentTest(null);
    }
  }, []);

  /**
   * Run all test scenarios
   */
  const runAllTests = useCallback(async () => {
    if (!managerRef.current) return;
    
    setIsRunning(true);
    setError(null);
    
    try {
      const results = await managerRef.current.runAllTests();
      setTestResults(prev => [...prev, ...results]);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to run all tests';
      setError(errorMessage);
      throw err;
    } finally {
      setIsRunning(false);
    }
  }, []);

  /**
   * Get test results for specific scenario
   */
  const getTestResultsForScenario = useCallback((scenarioId: string) => {
    return testResults.filter(result => result.scenarioId === scenarioId);
  }, [testResults]);

  /**
   * Get latest test result for scenario
   */
  const getLatestTestResult = useCallback((scenarioId: string) => {
    const results = getTestResultsForScenario(scenarioId);
    return results.length > 0 ? results[results.length - 1] : null;
  }, [getTestResultsForScenario]);

  /**
   * Clear test results
   */
  const clearTestResults = useCallback(() => {
    setTestResults([]);
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    testScenarios,
    testResults,
    isRunning,
    currentTest,
    error,
    runTestScenario,
    runAllTests,
    getTestResultsForScenario,
    getLatestTestResult,
    clearTestResults,
    clearError
  };
}

/**
 * Hook for brand preview metrics
 */
export function useBrandPreviewMetrics() {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    loadTime: 0,
    interactionTime: 0,
    accessibilityScore: 0,
    performanceScore: 0
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Start metrics monitoring
   */
  const startMonitoring = useCallback((interval: number = 1000) => {
    if (isMonitoring) return;
    
    setIsMonitoring(true);
    
    intervalRef.current = setInterval(() => {
      // Simulate metrics collection
      setMetrics(prev => ({
        renderTime: prev.renderTime + Math.random() * 10,
        loadTime: prev.loadTime + Math.random() * 5,
        interactionTime: prev.interactionTime + Math.random() * 2,
        accessibilityScore: Math.min(100, prev.accessibilityScore + Math.random() * 2),
        performanceScore: Math.min(100, prev.performanceScore + Math.random() * 1)
      }));
    }, interval);
  }, [isMonitoring]);

  /**
   * Stop metrics monitoring
   */
  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsMonitoring(false);
  }, []);

  /**
   * Reset metrics
   */
  const resetMetrics = useCallback(() => {
    setMetrics({
      renderTime: 0,
      loadTime: 0,
      interactionTime: 0,
      accessibilityScore: 0,
      performanceScore: 0
    });
  }, []);

  /**
   * Update metrics
   */
  const updateMetrics = useCallback((newMetrics: Partial<typeof metrics>) => {
    setMetrics(prev => ({ ...prev, ...newMetrics }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    resetMetrics,
    updateMetrics
  };
}

/**
 * Hook for brand preview configuration
 */
export function useBrandPreviewConfig() {
  const [config, setConfig] = useState<BrandPreviewConfig>({
    mode: 'live',
    dimensions: {
      width: 1200,
      height: 800,
      device: 'desktop'
    },
    content: {
      showLogo: true,
      showBrandName: true,
      showNavigation: true,
      showButtons: true,
      showCards: true,
      showForms: true
    },
    settings: {
      autoRefresh: true,
      showValidation: true,
      showMetrics: true,
      enableInteraction: true
    }
  });

  /**
   * Update configuration
   */
  const updateConfig = useCallback((updates: Partial<BrandPreviewConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Update dimensions
   */
  const updateDimensions = useCallback((dimensions: Partial<BrandPreviewConfig['dimensions']>) => {
    setConfig(prev => ({
      ...prev,
      dimensions: { ...prev.dimensions, ...dimensions }
    }));
  }, []);

  /**
   * Update content settings
   */
  const updateContent = useCallback((content: Partial<BrandPreviewConfig['content']>) => {
    setConfig(prev => ({
      ...prev,
      content: { ...prev.content, ...content }
    }));
  }, []);

  /**
   * Update settings
   */
  const updateSettings = useCallback((settings: Partial<BrandPreviewConfig['settings']>) => {
    setConfig(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settings }
    }));
  }, []);

  /**
   * Reset to default configuration
   */
  const resetConfig = useCallback(() => {
    setConfig({
      mode: 'live',
      dimensions: {
        width: 1200,
        height: 800,
        device: 'desktop'
      },
      content: {
        showLogo: true,
        showBrandName: true,
        showNavigation: true,
        showButtons: true,
        showCards: true,
        showForms: true
      },
      settings: {
        autoRefresh: true,
        showValidation: true,
        showMetrics: true,
        enableInteraction: true
      }
    });
  }, []);

  return {
    config,
    updateConfig,
    updateDimensions,
    updateContent,
    updateSettings,
    resetConfig
  };
}

/**
 * Comprehensive hook combining all preview and testing functionality
 */
export function useBrandPreviewTesting() {
  const previewHook = useBrandPreview();
  const testingHook = useBrandTesting();
  const metricsHook = useBrandPreviewMetrics();
  const configHook = useBrandPreviewConfig();

  /**
   * Run preview with current configuration
   */
  const runPreview = useCallback(async (brandConfig: DynamicBrandConfig) => {
    await previewHook.updateBrandConfig(brandConfig);
    await previewHook.updatePreviewConfig(configHook.config);
  }, [previewHook, configHook.config]);

  /**
   * Run tests with current brand configuration
   */
  const runTests = useCallback(async () => {
    if (previewHook.previewState?.brandConfig) {
      await testingHook.runAllTests();
    }
  }, [previewHook.previewState?.brandConfig, testingHook]);

  /**
   * Start comprehensive monitoring
   */
  const startMonitoring = useCallback(() => {
    previewHook.startAutoRefresh();
    metricsHook.startMonitoring();
  }, [previewHook, metricsHook]);

  /**
   * Stop comprehensive monitoring
   */
  const stopMonitoring = useCallback(() => {
    previewHook.stopAutoRefresh();
    metricsHook.stopMonitoring();
  }, [previewHook, metricsHook]);

  return {
    // Preview functionality
    ...previewHook,
    
    // Testing functionality
    ...testingHook,
    
    // Metrics functionality
    ...metricsHook,
    
    // Configuration functionality
    ...configHook,
    
    // Combined functionality
    runPreview,
    runTests,
    startMonitoring,
    stopMonitoring
  };
}
