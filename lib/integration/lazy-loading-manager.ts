import { useEffect, useState, useCallback, useRef } from 'react';
import type { ComponentType } from 'react';

interface LazyLoadConfig {
  moduleId: string;
  priority: 'high' | 'medium' | 'low';
  preload?: boolean;
  threshold?: number;
}

interface ModuleMetrics {
  loadTime: number;
  bundleSize: number;
  errorCount: number;
  lastLoaded: Date;
}

class LazyLoadingManager {
  private loadedModules = new Map<string, boolean>();
  private loadingModules = new Set<string>();
  private moduleMetrics = new Map<string, ModuleMetrics>();
  private moduleImports = new Map<string, () => Promise<{ default: ComponentType<any> }>>();
  private priorityQueue: LazyLoadConfig[] = [];
  private observers = new Map<string, IntersectionObserver>();

  constructor() {
    this.initializeModuleImports();
  }

  private initializeModuleImports() {
    this.moduleImports.set('orchestration', () =>
      import('@/app/agency-toolkit/orchestration/page').then(mod => ({ default: mod.default }))
    );
    this.moduleImports.set('modules', () =>
      import('@/app/agency-toolkit/modules/page').then(mod => ({ default: mod.default }))
    );
    this.moduleImports.set('marketplace', () =>
      import('@/app/agency-toolkit/marketplace/page').then(mod => ({ default: mod.default }))
    );
    this.moduleImports.set('handover', () =>
      import('@/app/agency-toolkit/handover/page').then(mod => ({ default: mod.default }))
    );
  }

  async loadModule(config: LazyLoadConfig): Promise<ComponentType<any> | null> {
    const { moduleId } = config;

    if (this.loadedModules.get(moduleId)) {
      return null;
    }

    if (this.loadingModules.has(moduleId)) {
      return this.waitForModule(moduleId);
    }

    this.loadingModules.add(moduleId);
    const startTime = performance.now();

    try {
      const moduleImport = this.moduleImports.get(moduleId);
      if (!moduleImport) {
        throw new Error(`Module ${moduleId} not found`);
      }

      const module = await moduleImport();
      const loadTime = performance.now() - startTime;

      this.loadedModules.set(moduleId, true);
      this.loadingModules.delete(moduleId);

      this.updateMetrics(moduleId, {
        loadTime,
        bundleSize: 0,
        errorCount: 0,
        lastLoaded: new Date()
      });

      return module.default;
    } catch (error) {
      this.loadingModules.delete(moduleId);
      this.updateErrorMetrics(moduleId);
      console.error(`Failed to load module ${moduleId}:`, error);
      return null;
    }
  }

  private async waitForModule(moduleId: string): Promise<ComponentType<any> | null> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.loadedModules.get(moduleId)) {
          clearInterval(checkInterval);
          const moduleImport = this.moduleImports.get(moduleId);
          if (moduleImport) {
            moduleImport().then(mod => resolve(mod.default));
          } else {
            resolve(null);
          }
        }
        if (!this.loadingModules.has(moduleId)) {
          clearInterval(checkInterval);
          resolve(null);
        }
      }, 100);
    });
  }

  preloadModule(moduleId: string) {
    if (!this.loadedModules.get(moduleId) && !this.loadingModules.has(moduleId)) {
      this.loadModule({ moduleId, priority: 'low', preload: true });
    }
  }

  preloadHighPriorityModules() {
    const highPriorityModules = ['orchestration', 'modules'];
    highPriorityModules.forEach(moduleId => this.preloadModule(moduleId));
  }

  createIntersectionObserver(
    moduleId: string,
    callback: () => void,
    options?: IntersectionObserverInit
  ): IntersectionObserver {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback();
            observer.disconnect();
            this.observers.delete(moduleId);
          }
        });
      },
      { threshold: options?.threshold || 0.1, ...options }
    );

    this.observers.set(moduleId, observer);
    return observer;
  }

  private updateMetrics(moduleId: string, metrics: ModuleMetrics) {
    this.moduleMetrics.set(moduleId, metrics);
  }

  private updateErrorMetrics(moduleId: string) {
    const existing = this.moduleMetrics.get(moduleId);
    if (existing) {
      this.updateMetrics(moduleId, {
        ...existing,
        errorCount: existing.errorCount + 1
      });
    } else {
      this.updateMetrics(moduleId, {
        loadTime: 0,
        bundleSize: 0,
        errorCount: 1,
        lastLoaded: new Date()
      });
    }
  }

  getMetrics(moduleId?: string): ModuleMetrics | Map<string, ModuleMetrics> {
    if (moduleId) {
      return this.moduleMetrics.get(moduleId) || {
        loadTime: 0,
        bundleSize: 0,
        errorCount: 0,
        lastLoaded: new Date()
      };
    }
    return this.moduleMetrics;
  }

  getLoadingStatus(moduleId: string): 'loaded' | 'loading' | 'not-loaded' {
    if (this.loadedModules.get(moduleId)) return 'loaded';
    if (this.loadingModules.has(moduleId)) return 'loading';
    return 'not-loaded';
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

export const lazyLoadingManager = new LazyLoadingManager();

export function useLazyModule(config: LazyLoadConfig) {
  const [Component, setComponent] = useState<ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const loadModule = useCallback(async () => {
    if (Component) return;

    setLoading(true);
    setError(null);

    try {
      const module = await lazyLoadingManager.loadModule(config);
      if (module) {
        setComponent(() => module);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [config, Component]);

  useEffect(() => {
    if (config.preload) {
      lazyLoadingManager.preloadModule(config.moduleId);
      return;
    }

    if (!elementRef.current) return;

    const observer = lazyLoadingManager.createIntersectionObserver(
      config.moduleId,
      loadModule,
      { threshold: config.threshold }
    );

    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
    };
  }, [config, loadModule]);

  return {
    Component,
    loading,
    error,
    elementRef,
    loadModule,
    status: lazyLoadingManager.getLoadingStatus(config.moduleId)
  };
}

export function useModulePreloading() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      lazyLoadingManager.preloadHighPriorityModules();
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);
}

export function useModuleMetrics(moduleId?: string) {
  const [metrics, setMetrics] = useState<ModuleMetrics | Map<string, ModuleMetrics>>(
    lazyLoadingManager.getMetrics(moduleId)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(lazyLoadingManager.getMetrics(moduleId));
    }, 5000);

    return () => clearInterval(interval);
  }, [moduleId]);

  return metrics;
}