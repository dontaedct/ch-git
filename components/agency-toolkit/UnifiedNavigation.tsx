"use client";

import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { BreadcrumbSystem } from './BreadcrumbSystem';
import { InterModuleNavigation } from './InterModuleNavigation';
import { useNavigationContext } from '@/lib/integration/navigation-context';

interface UnifiedNavigationProps {
  className?: string;
  showBreadcrumbs?: boolean;
  showInterModule?: boolean;
  showModuleInfo?: boolean;
}

export function UnifiedNavigation({
  className,
  showBreadcrumbs = true,
  showInterModule = true,
  showModuleInfo = true
}: UnifiedNavigationProps) {
  const { theme, systemTheme } = useTheme();
  const { state } = useNavigationContext();
  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  const currentModule = state.currentModule;

  if (!currentModule) {
    return null;
  }

  const getCategoryLabel = () => {
    switch (currentModule.category) {
      case 'core':
        return 'Core Toolkit';
      case 'ht035':
        return 'HT-035 Integration';
      case 'integration':
        return 'Integration Layer';
      default:
        return 'Agency Toolkit';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "border-b-2 transition-all duration-300",
        isDark ? "border-white/20 bg-black/40" : "border-black/20 bg-white/40",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {showModuleInfo && (
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">{currentModule.icon}</span>
                <div>
                  <h2 className="text-lg font-bold tracking-wide">
                    {currentModule.name}
                  </h2>
                  <p className={cn(
                    "text-xs font-medium uppercase tracking-wide",
                    isDark ? "text-white/60" : "text-black/60"
                  )}>
                    {getCategoryLabel()}
                  </p>
                </div>
              </div>
            )}

            {showBreadcrumbs && state.breadcrumbs.length > 0 && (
              <BreadcrumbSystem />
            )}
          </div>

          {showInterModule && (
            <InterModuleNavigation />
          )}
        </div>
      </div>
    </motion.div>
  );
}