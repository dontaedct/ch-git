/**
 * @fileoverview Brand-Aware Admin Navigation Component
 * @module components/admin/AdminNavigation
 * @author OSS Hero System
 * @version 1.0.0
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Home, 
  Settings, 
  Package, 
  FileText, 
  Palette,
  Shield,
  Activity,
  Flag,
  Brand,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BrandWithLogo } from '@/components/branding/DynamicBrandName';
import { logoManager } from '@/lib/branding/logo-manager';

interface AdminNavigationProps {
  client?: {
    email?: string;
    role?: string | null;
  } | null;
  isSafeMode?: boolean;
}

interface AdminRoute {
  href: string;
  label: string;
  icon: React.ComponentType<any>;
  description?: string;
  requiresPermission?: string;
  category?: string;
}

const adminRoutes: AdminRoute[] = [
  {
    href: '/admin/brand-management',
    label: 'Brand Management',
    icon: Brand,
    description: 'Manage logos, colors, and brand identity',
    requiresPermission: 'canManageSettings',
    category: 'Branding'
  },
  {
    href: '/operability/flags',
    label: 'Feature Flags',
    icon: Flag,
    description: 'Manage feature flags and toggles',
    requiresPermission: 'canManageSettings',
    category: 'Configuration'
  },
  {
    href: '/operability/diagnostics',
    label: 'System Diagnostics',
    icon: Activity,
    description: 'Monitor system health and performance',
    requiresPermission: 'canManageSettings',
    category: 'Monitoring'
  },
  {
    href: '/operability/health-monitoring',
    label: 'Health Monitoring',
    icon: Shield,
    description: 'System health and security monitoring',
    requiresPermission: 'canManageSettings',
    category: 'Monitoring'
  },
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: Home,
    description: 'Main application dashboard',
    category: 'General'
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: Settings,
    description: 'Application settings and configuration',
    category: 'General'
  }
];

const routeCategories = [
  { name: 'Branding', icon: Palette },
  { name: 'Configuration', icon: Settings },
  { name: 'Monitoring', icon: Activity },
  { name: 'General', icon: Home }
];

export function AdminNavigation({ client, isSafeMode }: AdminNavigationProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Branding']);
  const [brandConfig, setBrandConfig] = useState(logoManager.getCurrentConfig());

  const isAuthenticated = Boolean(client ?? isSafeMode);
  const isAdmin = client?.role === 'admin' || isSafeMode;

  // Subscribe to brand configuration changes
  useEffect(() => {
    const unsubscribe = logoManager.subscribe(setBrandConfig);
    return unsubscribe;
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(cat => cat !== categoryName)
        : [...prev, categoryName]
    );
  };

  const getRoutesByCategory = () => {
    const routesByCategory: Record<string, AdminRoute[]> = {};
    
    adminRoutes.forEach(route => {
      const category = route.category || 'General';
      if (!routesByCategory[category]) {
        routesByCategory[category] = [];
      }
      routesByCategory[category].push(route);
    });
    
    return routesByCategory;
  };

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  if (!isAdmin) {
    return null;
  }

  const routesByCategory = getRoutesByCategory();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
        aria-label="Open admin menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Admin Navigation Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-80 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0 lg:static lg:z-auto"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <BrandWithLogo
                logoSize="sm"
                brandVariant="short"
                brandClassName="text-sm font-medium text-gray-800"
                className="gap-2"
              />
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Admin
              </span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1 rounded hover:bg-gray-100"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {routeCategories.map(category => {
              const routes = routesByCategory[category.name] || [];
              if (routes.length === 0) return null;

              const isExpanded = expandedCategories.includes(category.name);
              const Icon = category.icon;

              return (
                <div key={category.name} className="space-y-1">
                  <button
                    onClick={() => toggleCategory(category.name)}
                    className="flex items-center justify-between w-full p-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {category.name}
                    </div>
                    <ChevronDown 
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isExpanded ? "rotate-180" : ""
                      )} 
                    />
                  </button>
                  
                  {isExpanded && (
                    <div className="ml-6 space-y-1">
                      {routes.map(route => {
                        const Icon = route.icon;
                        const isActive = isActiveRoute(route.href);
                        
                        return (
                          <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                              "flex items-center gap-3 p-2 text-sm rounded-lg transition-colors",
                              isActive 
                                ? "bg-primary/10 text-primary border border-primary/20" 
                                : "text-gray-600 hover:bg-gray-100"
                            )}
                          >
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium">{route.label}</div>
                              {route.description && (
                                <div className="text-xs text-gray-500 truncate">
                                  {route.description}
                                </div>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 space-y-1">
              <div>Brand: {brandConfig.brandName.appName}</div>
              <div>Config: {brandConfig.isCustom ? 'Custom' : brandConfig.presetName || 'Default'}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
