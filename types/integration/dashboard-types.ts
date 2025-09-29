export type NavigationSection =
  | 'dashboard'
  | 'client-apps'
  | 'orchestration'
  | 'modules'
  | 'marketplace'
  | 'handover'
  | 'system';

export interface HT035ModuleStatus {
  orchestration: {
    totalWorkflows: number;
    activeExecutions: number;
    successRate: number;
    systemHealth: 'healthy' | 'warning' | 'error';
  };
  modules: {
    totalModules: number;
    activeModules: number;
    clientConfigurations: number;
    syncStatus: 'synced' | 'syncing' | 'error';
  };
  marketplace: {
    availableTemplates: number;
    installedTemplates: number;
    monthlyDownloads: number;
    revenue: number;
  };
  handover: {
    packagesInProgress: number;
    packagesReady: number;
    completedThisMonth: number;
    avgCompletionTime: string;
  };
}

export interface DashboardIntegration {
  moduleStatuses: HT035ModuleStatus;
  lastUpdated: Date;
  refreshInterval: number;
}

export interface BreadcrumbItem {
  label: string;
  route: string;
  icon?: React.ComponentType;
  section?: NavigationSection;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType;
  route: string;
  section: NavigationSection;
  badge?: {
    count?: number;
    status?: 'info' | 'warning' | 'error' | 'success';
  };
  children?: NavigationItem[];
}

export interface NavigationContext {
  module: NavigationSection;
  page: string;
  entityId?: string;
  entityType?: string;
}

export interface RelatedModule {
  section: NavigationSection;
  relevance: number;
  reason: string;
  route: string;
  quickAction?: {
    label: string;
    icon: React.ComponentType;
  };
}

export interface NavigationHistory {
  route: string;
  timestamp: Date;
  section: NavigationSection;
  page: string;
  context?: Record<string, any>;
}

export interface FavoriteItem {
  id: string;
  label: string;
  route: string;
  icon?: React.ComponentType;
  section?: NavigationSection;
  addedAt: Date;
}

export interface NavigationOptions {
  replace?: boolean;
  scroll?: boolean;
  preserveState?: boolean;
  context?: Record<string, any>;
}

export interface NavigationContextValue {
  currentSection: NavigationSection;
  currentPage: string;
  breadcrumbs: BreadcrumbItem[];
  history: NavigationHistory[];
  favorites: FavoriteItem[];

  navigateTo: (route: string, options?: NavigationOptions) => void;
  goBack: () => void;
  addFavorite: (item: Omit<FavoriteItem, 'id' | 'addedAt'>) => void;
  removeFavorite: (id: string) => void;
  updateBreadcrumbs: (items: BreadcrumbItem[]) => void;

  isCurrentSection: (section: NavigationSection) => boolean;
  isCurrentPage: (page: string) => boolean;
  getRelatedModules: () => RelatedModule[];
}

export interface NavigationState {
  history: NavigationHistory[];
  favorites: FavoriteItem[];
  recentSections: {
    section: NavigationSection;
    lastVisited: Date;
    pageInSection: string;
  }[];
  userPreferences: {
    defaultSection?: NavigationSection;
    showBreadcrumbs: boolean;
    showRelatedModules: boolean;
    navigationStyle: 'sidebar' | 'topbar' | 'both';
  };
}

export interface UnifiedNavigationProps {
  currentSection: NavigationSection;
  currentPage: string;
  breadcrumbs: BreadcrumbItem[];
  onSectionChange: (section: NavigationSection) => void;
}

export interface BreadcrumbSystemProps {
  items: BreadcrumbItem[];
  maxItems?: number;
  separator?: React.ComponentType;
  onNavigate?: (route: string) => void;
}

export interface InterModuleNavigationProps {
  currentContext: NavigationContext;
  relatedModules: RelatedModule[];
  recentPages: NavigationHistory[];
  favorites: FavoriteItem[];
}

export interface HT035ModuleCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType;
  route: string;
  statusIndicators: {
    primary: { label: string; value: number | string };
    secondary: { label: string; value: number | string };
    health: 'healthy' | 'warning' | 'error';
  };
  quickActions: Array<{
    label: string;
    route: string;
    icon?: React.ComponentType;
  }>;
  metrics: {
    count?: number;
    percentage?: number;
    trend?: 'up' | 'down' | 'stable';
  };
}

export interface ModuleStatusAPI {
  orchestration: {
    endpoint: '/api/orchestration/status';
    response: HT035ModuleStatus['orchestration'];
  };
  modules: {
    endpoint: '/api/modules/registry/status';
    response: HT035ModuleStatus['modules'];
  };
  marketplace: {
    endpoint: '/api/marketplace/stats';
    response: HT035ModuleStatus['marketplace'];
  };
  handover: {
    endpoint: '/api/handover/queue';
    response: HT035ModuleStatus['handover'];
  };
}

export interface DashboardMetrics {
  totalApps: number;
  activeApps: number;
  todaySubmissions: number;
  monthlyRevenue: number;
  avgResponseTime: number;
  uptime: number;
}

export interface IntegrationError {
  module: NavigationSection;
  error: Error;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
}

export interface DashboardLayoutProps {
  children: React.ReactNode;
  showModuleGrid?: boolean;
  moduleStatuses?: HT035ModuleStatus;
  isLoadingStatuses?: boolean;
  className?: string;
}