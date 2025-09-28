/**
 * @fileoverview Unified Navigation System - HT-034.7.3
 * @module components/navigation/unified-navigation
 * @author OSS Hero System
 * @version 1.0.0
 *
 * Unified navigation system that provides consistent navigation patterns
 * between /admin and /agency-toolkit interfaces. Ensures seamless user
 * flow transitions and consistent user experience across all interfaces.
 */

"use client";

import { useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import {
  Settings,
  Users,
  Globe,
  Shield,
  Bell,
  Database,
  Server,
  Palette,
  Package,
  BarChart3,
  Activity,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Home,
  Search,
  HelpCircle,
  LogOut,
  User,
  Moon,
  Sun,
  Monitor,
  Zap,
  Layers,
  Target,
  Rocket,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: any;
  description?: string;
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  enabled: boolean;
  external?: boolean;
  onClick?: () => void;
}

interface NavigationSection {
  id: string;
  label: string;
  items: NavigationItem[];
}

interface UnifiedNavigationProps {
  variant: 'admin' | 'agency-toolkit' | 'public';
  showSidebar?: boolean;
  showBreadcrumbs?: boolean;
  showSearch?: boolean;
  showUserMenu?: boolean;
  children?: ReactNode;
  className?: string;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  external?: boolean;
}

/**
 * Navigation Configuration for different interface types
 */
const getNavigationConfig = (variant: 'admin' | 'agency-toolkit' | 'public'): NavigationSection[] => {
  const baseConfig = {
    admin: [
      {
        id: 'core',
        label: 'Core Administration',
        items: [
          {
            id: 'admin-dashboard',
            label: 'Dashboard',
            href: '/admin',
            icon: Home,
            description: 'Main admin dashboard',
            enabled: true
          },
          {
            id: 'users',
            label: 'Users',
            href: '/admin/users',
            icon: Users,
            description: 'User management',
            enabled: true
          },
          {
            id: 'settings',
            label: 'Settings',
            href: '/admin/settings',
            icon: Settings,
            description: 'System settings',
            enabled: true
          }
        ]
      },
      {
        id: 'platform',
        label: 'Platform Management',
        items: [
          {
            id: 'templates',
            label: 'Templates',
            href: '/admin/templates',
            icon: Layers,
            description: 'Template management',
            enabled: true
          },
          {
            id: 'deployments',
            label: 'Deployments',
            href: '/admin/deployments',
            icon: Rocket,
            description: 'Deployment management',
            enabled: true
          },
          {
            id: 'monitoring',
            label: 'Monitoring',
            href: '/admin/monitoring',
            icon: Activity,
            description: 'System monitoring',
            enabled: true
          }
        ]
      },
      {
        id: 'interface-navigation',
        label: 'Interface Navigation',
        items: [
          {
            id: 'agency-toolkit-link',
            label: 'Agency Toolkit',
            href: '/agency-toolkit',
            icon: Target,
            description: 'Switch to Agency Toolkit',
            badge: {
              text: 'Switch',
              variant: 'outline' as const
            },
            enabled: true,
            external: true
          }
        ]
      }
    ],
    'agency-toolkit': [
      {
        id: 'main',
        label: 'Agency Tools',
        items: [
          {
            id: 'toolkit-dashboard',
            label: 'Dashboard',
            href: '/agency-toolkit',
            icon: Home,
            description: 'Agency toolkit dashboard',
            enabled: true
          },
          {
            id: 'apps',
            label: 'My Apps',
            href: '/agency-toolkit/apps',
            icon: Package,
            description: 'Manage your apps',
            enabled: true
          },
          {
            id: 'templates',
            label: 'Templates',
            href: '/agency-toolkit/templates',
            icon: Layers,
            description: 'Template library',
            enabled: true
          },
          {
            id: 'forms',
            label: 'Forms',
            href: '/agency-toolkit/forms',
            icon: Database,
            description: 'Form builder',
            enabled: true
          }
        ]
      },
      {
        id: 'tools',
        label: 'Development Tools',
        items: [
          {
            id: 'analytics',
            label: 'Analytics',
            href: '/agency-toolkit/analytics',
            icon: BarChart3,
            description: 'Analytics dashboard',
            enabled: true
          },
          {
            id: 'monitoring',
            label: 'Monitoring',
            href: '/agency-toolkit/monitoring',
            icon: Activity,
            description: 'Performance monitoring',
            enabled: true
          }
        ]
      },
      {
        id: 'interface-navigation',
        label: 'Interface Navigation',
        items: [
          {
            id: 'admin-link',
            label: 'Admin Panel',
            href: '/admin',
            icon: Shield,
            description: 'Switch to Admin Panel',
            badge: {
              text: 'Switch',
              variant: 'outline' as const
            },
            enabled: true,
            external: true
          }
        ]
      }
    ],
    public: [
      {
        id: 'main',
        label: 'Navigation',
        items: [
          {
            id: 'home',
            label: 'Home',
            href: '/',
            icon: Home,
            description: 'Homepage',
            enabled: true
          },
          {
            id: 'admin-login',
            label: 'Admin',
            href: '/admin',
            icon: Shield,
            description: 'Admin interface',
            enabled: true
          },
          {
            id: 'agency-login',
            label: 'Agency Toolkit',
            href: '/agency-toolkit',
            icon: Target,
            description: 'Agency toolkit',
            enabled: true
          }
        ]
      }
    ]
  };

  return baseConfig[variant];
};

/**
 * Generate breadcrumbs based on current path and navigation config
 */
const generateBreadcrumbs = (pathname: string, variant: 'admin' | 'agency-toolkit' | 'public'): BreadcrumbItem[] => {
  const breadcrumbs: BreadcrumbItem[] = [];

  // Base breadcrumb
  if (variant === 'admin') {
    breadcrumbs.push({ label: 'Admin', href: '/admin' });
  } else if (variant === 'agency-toolkit') {
    breadcrumbs.push({ label: 'Agency Toolkit', href: '/agency-toolkit' });
  } else {
    breadcrumbs.push({ label: 'Home', href: '/' });
  }

  // Add path-specific breadcrumbs
  const pathSegments = pathname.split('/').filter(Boolean);

  if (pathSegments.length > 1) {
    const sections = getNavigationConfig(variant);
    for (const section of sections) {
      for (const item of section.items) {
        if (item.href === pathname) {
          if (pathname !== (variant === 'admin' ? '/admin' : variant === 'agency-toolkit' ? '/agency-toolkit' : '/')) {
            breadcrumbs.push({ label: item.label });
          }
          break;
        }
      }
    }
  }

  return breadcrumbs;
};

/**
 * Sidebar Component for Admin and Agency Toolkit interfaces
 */
function NavigationSidebar({ variant, currentPath, onItemClick }: {
  variant: 'admin' | 'agency-toolkit';
  currentPath: string;
  onItemClick: (item: NavigationItem) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const sections = getNavigationConfig(variant);

  const filteredSections = sections.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.enabled &&
      item.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(section => section.items.length > 0);

  const isItemActive = (item: NavigationItem) => {
    return item.href === currentPath || currentPath.startsWith(item.href + '/');
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 320 }}
      className="fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 flex flex-col"
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                {variant === 'admin' ? (
                  <Shield className="w-5 h-5 text-white" />
                ) : (
                  <Target className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h2 className="font-semibold text-lg">
                  {variant === 'admin' ? 'Admin' : 'Agency Toolkit'}
                </h2>
                <p className="text-xs text-gray-500">
                  {variant === 'admin' ? 'System Administration' : 'Development Platform'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Search */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 border-b border-gray-200 dark:border-gray-800"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search navigation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-6">
          {filteredSections.map((section) => (
            <div key={section.id}>
              <AnimatePresence>
                {!collapsed && (
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3"
                  >
                    {section.label}
                  </motion.h3>
                )}
              </AnimatePresence>

              <div className="space-y-1">
                {section.items.map((item) => (
                  <TooltipProvider key={item.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onItemClick(item)}
                          className={cn(
                            "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                            isItemActive(item)
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                            collapsed && "justify-center px-2"
                          )}
                        >
                          {item.icon && (
                            <item.icon className={cn(
                              "w-5 h-5 flex-shrink-0",
                              isItemActive(item) ? "text-blue-700 dark:text-blue-300" : "text-gray-500 dark:text-gray-400"
                            )} />
                          )}

                          <AnimatePresence>
                            {!collapsed && (
                              <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="flex items-center justify-between flex-1 min-w-0"
                              >
                                <div className="flex-1 min-w-0">
                                  <span className="truncate">{item.label}</span>
                                  {item.description && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                      {item.description}
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center space-x-2">
                                  {item.badge && (
                                    <Badge variant={item.badge.variant} className="text-xs">
                                      {item.badge.text}
                                    </Badge>
                                  )}
                                  {item.external && (
                                    <ExternalLink className="w-3 h-3 text-gray-400" />
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </button>
                      </TooltipTrigger>
                      {collapsed && (
                        <TooltipContent side="right">
                          <div>
                            <p className="font-medium">{item.label}</p>
                            {item.description && (
                              <p className="text-xs text-gray-500">{item.description}</p>
                            )}
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </motion.aside>
  );
}

/**
 * Unified Breadcrumb Component
 */
function UnifiedBreadcrumbs({ breadcrumbs }: { breadcrumbs: BreadcrumbItem[] }) {
  const router = useRouter();

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
      {breadcrumbs.map((crumb, index) => (
        <div key={index} className="flex items-center space-x-2">
          {index > 0 && <ArrowRight className="w-3 h-3" />}
          {crumb.href ? (
            <button
              onClick={() => router.push(crumb.href!)}
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              {crumb.label}
            </button>
          ) : (
            <span className="text-gray-900 dark:text-gray-100 font-medium">{crumb.label}</span>
          )}
          {crumb.external && <ExternalLink className="w-3 h-3 ml-1" />}
        </div>
      ))}
    </nav>
  );
}

/**
 * Main Unified Navigation Component
 */
export function UnifiedNavigation({
  variant,
  showSidebar = variant !== 'public',
  showBreadcrumbs = true,
  showSearch = variant !== 'public',
  showUserMenu = variant !== 'public',
  children,
  className
}: UnifiedNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const breadcrumbs = generateBreadcrumbs(pathname, variant);

  const handleItemClick = (item: NavigationItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      router.push(item.href);
    }

    // Close mobile sidebar
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className={cn("flex h-screen bg-gray-50 dark:bg-gray-900", className)}>
      {/* Sidebar for admin and agency-toolkit */}
      {showSidebar && variant !== 'public' && (
        <>
          {/* Mobile overlay */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
          </AnimatePresence>

          <NavigationSidebar
            variant={variant as 'admin' | 'agency-toolkit'}
            currentPath={pathname}
            onItemClick={handleItemClick}
          />
        </>
      )}

      <div className={cn(
        "flex-1 flex flex-col min-w-0",
        showSidebar && variant !== 'public' && "md:ml-80"
      )}>
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              {showSidebar && variant !== 'public' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              )}

              <div>
                {/* Breadcrumbs */}
                {showBreadcrumbs && (
                  <UnifiedBreadcrumbs breadcrumbs={breadcrumbs} />
                )}

                {/* Page title */}
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {breadcrumbs[breadcrumbs.length - 1]?.label || 'Dashboard'}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              {showSearch && (
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 w-64"
                  />
                </div>
              )}

              {/* Notifications */}
              {showUserMenu && (
                <Button variant="ghost" size="sm">
                  <Bell className="w-5 h-5" />
                </Button>
              )}

              {/* Theme toggle */}
              <ThemeToggle />

              {/* User menu */}
              {showUserMenu && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/avatars/user.jpg" alt="User" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">User</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          user@example.com
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/help')}>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Help & Support
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/logout')}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default UnifiedNavigation;