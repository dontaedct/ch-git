/**
 * Navigation Helper Utilities
 * Helper functions for unified navigation across HT-035 integrated modules
 */

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  badge?: string | number;
  children?: NavigationItem[];
}

export interface ModuleRoute {
  module: string;
  path: string;
  label: string;
  description: string;
}

/**
 * HT-035 Module Routes
 */
export const HT035_ROUTES: ModuleRoute[] = [
  {
    module: 'orchestration',
    path: '/agency-toolkit/orchestration',
    label: 'Orchestration',
    description: 'Workflow automation and n8n integration'
  },
  {
    module: 'modules',
    path: '/agency-toolkit/modules',
    label: 'Modules',
    description: 'Hot-pluggable module management'
  },
  {
    module: 'marketplace',
    path: '/agency-toolkit/marketplace',
    label: 'Marketplace',
    description: 'Template and module marketplace'
  },
  {
    module: 'handover',
    path: '/agency-toolkit/handover',
    label: 'Handover',
    description: 'Automated client package delivery'
  }
];

/**
 * Navigate to HT-035 module
 */
export function navigateToModule(module: string, openInNewTab: boolean = true): void {
  const route = HT035_ROUTES.find(r => r.module === module);

  if (!route) {
    console.error(`Module route not found: ${module}`);
    return;
  }

  if (openInNewTab) {
    window.open(route.path, '_blank');
  } else {
    window.location.href = route.path;
  }
}

/**
 * Get module route information
 */
export function getModuleRoute(module: string): ModuleRoute | undefined {
  return HT035_ROUTES.find(r => r.module === module);
}

/**
 * Get all module routes
 */
export function getAllModuleRoutes(): ModuleRoute[] {
  return HT035_ROUTES;
}

/**
 * Check if current path is a module route
 */
export function isModuleRoute(path: string): boolean {
  return HT035_ROUTES.some(route => path.startsWith(route.path));
}

/**
 * Get current module from path
 */
export function getCurrentModule(path: string): string | null {
  const route = HT035_ROUTES.find(r => path.startsWith(r.path));
  return route ? route.module : null;
}

/**
 * Build breadcrumb trail for current path
 */
export function buildBreadcrumbs(path: string): { label: string; path: string }[] {
  const breadcrumbs: { label: string; path: string }[] = [
    { label: 'Agency Toolkit', path: '/agency-toolkit' }
  ];

  const route = HT035_ROUTES.find(r => path.startsWith(r.path));

  if (route) {
    breadcrumbs.push({
      label: route.label,
      path: route.path
    });

    // Add sub-paths if they exist
    const subPath = path.replace(route.path, '');
    if (subPath && subPath !== '/') {
      const segments = subPath.split('/').filter(Boolean);
      let currentPath = route.path;

      segments.forEach(segment => {
        currentPath += `/${segment}`;
        breadcrumbs.push({
          label: segment.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' '),
          path: currentPath
        });
      });
    }
  }

  return breadcrumbs;
}

/**
 * Generate navigation items for HT-035 modules
 */
export function getModuleNavigationItems(): NavigationItem[] {
  return HT035_ROUTES.map(route => ({
    id: route.module,
    label: route.label,
    path: route.path,
    icon: route.module
  }));
}

/**
 * Get related modules for cross-module navigation
 */
export function getRelatedModules(currentModule: string): ModuleRoute[] {
  return HT035_ROUTES.filter(route => route.module !== currentModule);
}

/**
 * Create deep link to specific module feature
 */
export function createDeepLink(
  module: string,
  feature?: string,
  params?: Record<string, string>
): string {
  const route = getModuleRoute(module);

  if (!route) {
    console.error(`Module not found: ${module}`);
    return '/agency-toolkit';
  }

  let url = route.path;

  if (feature) {
    url += `/${feature}`;
  }

  if (params && Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  }

  return url;
}

/**
 * Parse deep link to extract module, feature, and params
 */
export function parseDeepLink(url: string): {
  module: string | null;
  feature: string | null;
  params: Record<string, string>;
} {
  const [path, queryString] = url.split('?');
  const module = getCurrentModule(path);

  if (!module) {
    return { module: null, feature: null, params: {} };
  }

  const route = getModuleRoute(module);
  const feature = route ? path.replace(route.path, '').split('/').filter(Boolean)[0] || null : null;

  const params: Record<string, string> = {};
  if (queryString) {
    const urlParams = new URLSearchParams(queryString);
    urlParams.forEach((value, key) => {
      params[key] = value;
    });
  }

  return { module, feature, params };
}