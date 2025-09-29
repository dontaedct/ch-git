"use client";

import { useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useNavigationContext, NavigationBreadcrumb } from '@/lib/integration/navigation-context';

interface UseUnifiedNavigationOptions {
  breadcrumbs?: NavigationBreadcrumb[];
  moduleId?: string;
}

export function useUnifiedNavigation(options: UseUnifiedNavigationOptions = {}) {
  const { breadcrumbs, moduleId } = options;
  const pathname = usePathname();
  const router = useRouter();
  const { state, updateBreadcrumbs, setCurrentModule, navigateBack, getModuleByPath } = useNavigationContext();

  useEffect(() => {
    if (breadcrumbs) {
      updateBreadcrumbs(breadcrumbs);
    }
  }, [breadcrumbs, updateBreadcrumbs]);

  useEffect(() => {
    if (moduleId) {
      const module = getModuleByPath(pathname);
      if (module && module.id === moduleId) {
        setCurrentModule(module);
      }
    }
  }, [moduleId, pathname, getModuleByPath, setCurrentModule]);

  const navigateTo = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  const navigateToModule = useCallback((moduleId: string) => {
    const module = state.currentModule;
    if (module && module.id === moduleId) {
      router.push(module.basePath);
    }
  }, [state.currentModule, router]);

  const setBreadcrumbs = useCallback((breadcrumbs: NavigationBreadcrumb[]) => {
    updateBreadcrumbs(breadcrumbs);
  }, [updateBreadcrumbs]);

  const addBreadcrumb = useCallback((breadcrumb: NavigationBreadcrumb) => {
    updateBreadcrumbs([...state.breadcrumbs, breadcrumb]);
  }, [state.breadcrumbs, updateBreadcrumbs]);

  const removeBreadcrumb = useCallback((index: number) => {
    const newBreadcrumbs = state.breadcrumbs.filter((_, i) => i !== index);
    updateBreadcrumbs(newBreadcrumbs);
  }, [state.breadcrumbs, updateBreadcrumbs]);

  const goBack = useCallback(() => {
    navigateBack();
  }, [navigateBack]);

  return {
    currentModule: state.currentModule,
    breadcrumbs: state.breadcrumbs,
    navigationHistory: state.navigationHistory,
    previousPath: state.previousPath,
    navigateTo,
    navigateToModule,
    setBreadcrumbs,
    addBreadcrumb,
    removeBreadcrumb,
    goBack,
    canGoBack: !!state.previousPath
  };
}