"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export interface NavigationBreadcrumb {
  label: string;
  href: string;
  icon?: string;
}

export interface NavigationModule {
  id: string;
  name: string;
  icon: string;
  basePath: string;
  category: 'core' | 'ht035' | 'integration';
}

export interface NavigationState {
  currentModule: NavigationModule | null;
  breadcrumbs: NavigationBreadcrumb[];
  previousPath: string | null;
  navigationHistory: string[];
}

interface NavigationContextType {
  state: NavigationState;
  updateBreadcrumbs: (breadcrumbs: NavigationBreadcrumb[]) => void;
  setCurrentModule: (module: NavigationModule | null) => void;
  navigateBack: () => void;
  clearHistory: () => void;
  getModuleByPath: (path: string) => NavigationModule | null;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

const NAVIGATION_MODULES: NavigationModule[] = [
  {
    id: 'dashboard',
    name: 'Agency Toolkit',
    icon: '🏠',
    basePath: '/agency-toolkit',
    category: 'core'
  },
  {
    id: 'components',
    name: 'Components',
    icon: '🧩',
    basePath: '/agency-toolkit/components',
    category: 'core'
  },
  {
    id: 'templates',
    name: 'Templates',
    icon: '📋',
    basePath: '/agency-toolkit/templates',
    category: 'core'
  },
  {
    id: 'forms',
    name: 'Forms',
    icon: '📝',
    basePath: '/agency-toolkit/forms',
    category: 'core'
  },
  {
    id: 'documents',
    name: 'Documents',
    icon: '📄',
    basePath: '/agency-toolkit/documents',
    category: 'core'
  },
  {
    id: 'theming',
    name: 'Theming',
    icon: '🎨',
    basePath: '/agency-toolkit/theming',
    category: 'core'
  },
  {
    id: 'orchestration',
    name: 'Orchestration',
    icon: '🎯',
    basePath: '/agency-toolkit/orchestration',
    category: 'ht035'
  },
  {
    id: 'modules',
    name: 'Modules',
    icon: '📦',
    basePath: '/agency-toolkit/modules',
    category: 'ht035'
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    icon: '🏪',
    basePath: '/agency-toolkit/marketplace',
    category: 'ht035'
  },
  {
    id: 'handover',
    name: 'Handover',
    icon: '🚀',
    basePath: '/agency-toolkit/handover',
    category: 'ht035'
  }
];

export function NavigationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [state, setState] = useState<NavigationState>({
    currentModule: null,
    breadcrumbs: [],
    previousPath: null,
    navigationHistory: []
  });

  useEffect(() => {
    const currentModule = getModuleByPath(pathname);

    setState(prev => ({
      ...prev,
      currentModule,
      previousPath: prev.navigationHistory[prev.navigationHistory.length - 1] || null,
      navigationHistory: [...prev.navigationHistory.slice(-10), pathname]
    }));
  }, [pathname]);

  const getModuleByPath = (path: string): NavigationModule | null => {
    return NAVIGATION_MODULES.find(module =>
      path.startsWith(module.basePath)
    ) || null;
  };

  const updateBreadcrumbs = (breadcrumbs: NavigationBreadcrumb[]) => {
    setState(prev => ({ ...prev, breadcrumbs }));
  };

  const setCurrentModule = (module: NavigationModule | null) => {
    setState(prev => ({ ...prev, currentModule: module }));
  };

  const navigateBack = () => {
    if (state.previousPath) {
      window.history.back();
    }
  };

  const clearHistory = () => {
    setState(prev => ({
      ...prev,
      navigationHistory: [],
      previousPath: null
    }));
  };

  const value: NavigationContextType = {
    state,
    updateBreadcrumbs,
    setCurrentModule,
    navigateBack,
    clearHistory,
    getModuleByPath
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigationContext() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigationContext must be used within a NavigationProvider');
  }
  return context;
}

export { NAVIGATION_MODULES };