"use client";

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useNavigationContext, NAVIGATION_MODULES, NavigationModule } from '@/lib/integration/navigation-context';
import { ArrowLeft, Grid3x3 } from 'lucide-react';
import { useState } from 'react';

interface InterModuleNavigationProps {
  className?: string;
  showQuickAccess?: boolean;
  compact?: boolean;
}

export function InterModuleNavigation({
  className,
  showQuickAccess = true,
  compact = false
}: InterModuleNavigationProps) {
  const { theme, systemTheme } = useTheme();
  const { state, navigateBack } = useNavigationContext();
  const [showModuleGrid, setShowModuleGrid] = useState(false);
  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  const currentModule = state.currentModule;
  const relatedModules = NAVIGATION_MODULES.filter(
    module => module.id !== currentModule?.id && module.category === currentModule?.category
  );

  const otherCategories = [
    { category: 'core', label: 'Core Toolkit', modules: NAVIGATION_MODULES.filter(m => m.category === 'core') },
    { category: 'ht035', label: 'HT-035 Integration', modules: NAVIGATION_MODULES.filter(m => m.category === 'ht035') }
  ].filter(cat => cat.category !== currentModule?.category);

  if (!currentModule) {
    return null;
  }

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center justify-between">
        {state.previousPath && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={navigateBack}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200",
              isDark
                ? "hover:bg-white/10 text-white/70 hover:text-white"
                : "hover:bg-black/10 text-black/70 hover:text-black"
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            {!compact && <span className="text-sm font-medium">Back</span>}
          </motion.button>
        )}

        {showQuickAccess && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setShowModuleGrid(!showModuleGrid)}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200",
              isDark
                ? "hover:bg-white/10 text-white/70 hover:text-white"
                : "hover:bg-black/10 text-black/70 hover:text-black"
            )}
          >
            <Grid3x3 className="w-4 h-4" />
            {!compact && <span className="text-sm font-medium">Quick Access</span>}
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {showModuleGrid && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={cn(
              "absolute right-0 top-full mt-2 w-80 rounded-lg border-2 shadow-xl z-50",
              isDark
                ? "bg-black border-white/30"
                : "bg-white border-black/30"
            )}
          >
            <div className="p-4">
              {relatedModules.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-2">
                    Related Modules
                  </h3>
                  <div className="space-y-1">
                    {relatedModules.map((module) => (
                      <ModuleLink
                        key={module.id}
                        module={module}
                        isDark={isDark}
                        onClick={() => setShowModuleGrid(false)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {otherCategories.map((category) => (
                <div key={category.category} className="mb-4 last:mb-0">
                  <h3 className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-2">
                    {category.label}
                  </h3>
                  <div className="space-y-1">
                    {category.modules.map((module) => (
                      <ModuleLink
                        key={module.id}
                        module={module}
                        isDark={isDark}
                        onClick={() => setShowModuleGrid(false)}
                      />
                    ))}
                  </div>
                </div>
              ))}

              <div className="mt-4 pt-4 border-t-2" style={{
                borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
              }}>
                <Link
                  href="/agency-toolkit"
                  onClick={() => setShowModuleGrid(false)}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium",
                    isDark
                      ? "hover:bg-white/10 text-white/70 hover:text-white"
                      : "hover:bg-black/10 text-black/70 hover:text-black"
                  )}
                >
                  <span>🏠</span>
                  <span>Back to Dashboard</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ModuleLink({
  module,
  isDark,
  onClick
}: {
  module: NavigationModule;
  isDark: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={module.basePath}
      onClick={onClick}
      className={cn(
        "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm",
        isDark
          ? "hover:bg-white/10 text-white/70 hover:text-white"
          : "hover:bg-black/10 text-black/70 hover:text-black"
      )}
    >
      <span>{module.icon}</span>
      <span>{module.name}</span>
    </Link>
  );
}