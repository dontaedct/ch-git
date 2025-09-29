"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useNavigationContext, NavigationBreadcrumb } from '@/lib/integration/navigation-context';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbSystemProps {
  className?: string;
  customBreadcrumbs?: NavigationBreadcrumb[];
  showHomeIcon?: boolean;
}

export function BreadcrumbSystem({
  className,
  customBreadcrumbs,
  showHomeIcon = true
}: BreadcrumbSystemProps) {
  const { theme, systemTheme } = useTheme();
  const { state } = useNavigationContext();
  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  const breadcrumbs = customBreadcrumbs || state.breadcrumbs;

  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null;
  }

  const homeBreadcrumb: NavigationBreadcrumb = {
    label: 'Dashboard',
    href: '/agency-toolkit',
    icon: '🏠'
  };

  const allBreadcrumbs = showHomeIcon ? [homeBreadcrumb, ...breadcrumbs] : breadcrumbs;

  return (
    <nav
      className={cn(
        "flex items-center space-x-2 text-sm",
        className
      )}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2">
        {allBreadcrumbs.map((breadcrumb, index) => {
          const isLast = index === allBreadcrumbs.length - 1;
          const isHome = index === 0 && showHomeIcon;

          return (
            <li key={breadcrumb.href} className="flex items-center space-x-2">
              {index > 0 && (
                <ChevronRight
                  className={cn(
                    "w-4 h-4",
                    isDark ? "text-white/40" : "text-black/40"
                  )}
                />
              )}

              {isLast ? (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex items-center space-x-1.5 font-medium",
                    isDark ? "text-white" : "text-black"
                  )}
                >
                  {breadcrumb.icon && <span>{breadcrumb.icon}</span>}
                  <span>{breadcrumb.label}</span>
                </motion.span>
              ) : (
                <Link
                  href={breadcrumb.href}
                  className={cn(
                    "flex items-center space-x-1.5 transition-colors duration-200",
                    isDark
                      ? "text-white/60 hover:text-white"
                      : "text-black/60 hover:text-black"
                  )}
                >
                  {isHome ? (
                    <Home className="w-4 h-4" />
                  ) : breadcrumb.icon ? (
                    <span>{breadcrumb.icon}</span>
                  ) : null}
                  <span>{breadcrumb.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}