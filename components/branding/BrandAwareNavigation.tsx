/**
 * @fileoverview Brand-Aware Navigation Component
 * @module components/branding/BrandAwareNavigation
 * @author OSS Hero System
 * @version 1.0.0
 */

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { BrandWithLogo } from './DynamicBrandName';
import { useBrandNames } from '@/lib/branding/hooks';
import { getBrandNavigationClasses, getBrandNavigationConfig } from '@/lib/branding/navigation-styling';
import { cn } from '@/lib/utils';

export interface BrandAwareNavigationProps {
  /** Navigation routes */
  routes?: Array<{
    href: string;
    label: string;
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    protected?: boolean;
    public?: boolean;
    parent?: string;
  }>;
  /** Whether user is authenticated */
  isAuthenticated?: boolean;
  /** Current pathname */
  pathname?: string;
  /** Additional CSS classes */
  className?: string;
  /** Navigation variant */
  variant?: 'header' | 'sidebar' | 'mobile';
}

/**
 * Brand-aware navigation component with dynamic styling
 */
export function BrandAwareNavigation({
  routes = [],
  isAuthenticated = false,
  pathname = '/',
  className,
  variant = 'header',
}: BrandAwareNavigationProps) {
  const { brandNames } = useBrandNames();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const brandConfig = getBrandNavigationConfig();
  
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
  
  const getVisibleRoutes = () => {
    return routes.filter(route => {
      if (route.public && route.protected) return true;
      if (route.public && !isAuthenticated) return true;
      if (route.protected && isAuthenticated) return true;
      return false;
    });
  };
  
  const getBreadcrumbs = () => {
    const visibleRoutes = getVisibleRoutes();
    const currentRoute = visibleRoutes.find(route => route.href === pathname);
    
    if (!currentRoute) return [];
    
    const breadcrumbs = [];
    
    // Add parent if exists
    if (currentRoute.parent) {
      const parentRoute = visibleRoutes.find(route => route.href === currentRoute.parent);
      if (parentRoute) {
        breadcrumbs.push(parentRoute);
      }
    }
    
    // Add current route if not already the parent
    if (!currentRoute.parent || currentRoute.href !== currentRoute.parent) {
      breadcrumbs.push(currentRoute);
    }
    
    return breadcrumbs;
  };
  
  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };
  
  const visibleRoutes = getVisibleRoutes();
  const breadcrumbs = getBreadcrumbs();
  
  if (variant === 'mobile') {
    return (
      <>
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className={cn(
            'md:hidden flex items-center justify-center w-8 h-8 rounded-lg transition-colors focus:outline-none',
            getBrandNavigationClasses('nav-link', false, 'hover:bg-gray-100/60')
          )}
          aria-label="Open navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>
        
        {/* Mobile Drawer */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Drawer */}
            <div className={cn(
              'fixed top-0 right-0 z-50 w-80 h-full shadow-2xl md:hidden transform transition-transform duration-300 ease-out',
              getBrandNavigationClasses('mobile-menu')
            )}>
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className={cn(
                  'flex items-center justify-between p-4 border-b',
                  getBrandNavigationClasses('mobile-menu', false, 'border-gray-200')
                )}>
                  <BrandWithLogo
                    logoSize="sm"
                    brandVariant="short"
                    brandClassName={cn(
                      'text-sm font-medium',
                      getBrandNavigationClasses('brand-text')
                    )}
                    className="gap-2"
                  />
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-lg transition-colors focus:outline-none',
                      getBrandNavigationClasses('nav-link', false, 'hover:bg-gray-100')
                    )}
                    aria-label="Close navigation menu"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2">
                  {visibleRoutes.map((route) => {
                    const Icon = route.icon;
                    const isActive = isActiveRoute(route.href);
                    
                    return (
                      <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 focus:outline-none',
                          getBrandNavigationClasses('nav-link', isActive),
                          isActive 
                            ? 'bg-blue-50 dark:bg-blue-900/20' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        )}
                      >
                        {Icon && <Icon className="w-5 h-5" />}
                        <span>{route.label}</span>
                        {isActive && (
                          <div className="ml-auto w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full" />
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </>
        )}
      </>
    );
  }
  
  if (variant === 'sidebar') {
    return (
      <aside className={cn(
        'w-64 h-full border-r',
        getBrandNavigationClasses('header', false, 'border-gray-200')
      )}>
        <div className="p-4 border-b border-gray-200">
          <BrandWithLogo
            logoSize="md"
            brandVariant="full"
            brandClassName={cn(
              'text-lg font-semibold',
              getBrandNavigationClasses('brand-text')
            )}
            className="gap-3"
          />
        </div>
        
        <nav className="p-4 space-y-2">
          {visibleRoutes.map((route) => {
            const Icon = route.icon;
            const isActive = isActiveRoute(route.href);
            
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none',
                  getBrandNavigationClasses('nav-link', isActive),
                  isActive 
                    ? 'bg-blue-50 dark:bg-blue-900/20' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{route.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    );
  }
  
  // Default header variant
  return (
    <header className={cn(
      'w-full border-b',
      getBrandNavigationClasses('header', false, 'border-gray-200'),
      className
    )}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 h-16">
        {/* Left side - Logo and breadcrumbs */}
        <div className="flex items-center gap-4">
          <Link 
            href={isAuthenticated ? "/dashboard" : "/"} 
            className={cn(
              'flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none rounded-lg px-2 py-1',
              getBrandNavigationClasses('nav-link', false, 'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2')
            )}
            tabIndex={0}
          >
            <BrandWithLogo
              logoSize="sm"
              brandVariant="nav"
              brandClassName={cn(
                'text-sm font-medium',
                getBrandNavigationClasses('brand-text')
              )}
              className="gap-2"
            />
          </Link>
          
          {/* Breadcrumbs */}
          {breadcrumbs.length > 1 && (
            <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-2 text-sm text-gray-400">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center gap-2">
                  {index > 0 && <ChevronDown className="w-3 h-3 rotate-[-90deg] text-gray-500" />}
                  <Link
                    href={crumb.href}
                    className={cn(
                      'hover:text-gray-200 transition-colors focus:outline-none rounded px-1 py-0.5',
                      getBrandNavigationClasses('nav-link', isActiveRoute(crumb.href)),
                      isActiveRoute(crumb.href) ? 'font-medium' : ''
                    )}
                  >
                    {crumb.label}
                  </Link>
                </div>
              ))}
            </nav>
          )}
        </div>
        
        {/* Right side - Navigation */}
        <div className="flex items-center gap-4">
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {visibleRoutes.filter(route => !route.parent).map((route) => {
              const Icon = route.icon;
              const isActive = isActiveRoute(route.href);
              
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none',
                    getBrandNavigationClasses('nav-link', isActive),
                    isActive 
                      ? 'bg-blue-900/80 dark:bg-blue-900/80' 
                      : 'hover:bg-gray-800/60 dark:hover:bg-gray-800/60'
                  )}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span className="hidden lg:inline">{route.label}</span>
                  {isActive && (
                    <div className="w-1 h-1 bg-blue-400 rounded-full hidden lg:block" />
                  )}
                </Link>
              );
            })}
          </nav>
          
          {/* Mobile menu */}
          <BrandAwareNavigation
            routes={routes}
            isAuthenticated={isAuthenticated}
            pathname={pathname}
            variant="mobile"
          />
        </div>
      </div>
    </header>
  );
}
