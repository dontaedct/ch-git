/**
 * @fileoverview Standardized Menu Structure - HT-034.7.3
 * @module components/navigation/standardized-menu
 * @author OSS Hero System
 * @version 1.0.0
 *
 * Standardized menu structure that provides consistent navigation hierarchy
 * and menu organization across all interfaces with user guidance integration.
 */

"use client";

import { useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronDown,
  ChevronRight,
  Home,
  Search,
  HelpCircle,
  LogOut,
  User,
  Target,
  Rocket,
  Layers,
  FileText,
  Zap,
  Plus,
  Eye,
  Edit3,
  Trash2,
  MoreVertical,
  ArrowRight,
  ExternalLink,
  Info,
  BookOpen,
  MessageCircle,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface MenuAction {
  id: string;
  label: string;
  icon?: any;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
}

interface MenuSection {
  id: string;
  label: string;
  items: MenuAction[];
}

interface ContextualHelp {
  title: string;
  description: string;
  steps?: string[];
  links?: {
    text: string;
    href: string;
    external?: boolean;
  }[];
}

interface StandardizedMenuProps {
  variant: 'admin' | 'agency-toolkit' | 'public';
  context?: string;
  showHelp?: boolean;
  className?: string;
}

/**
 * Menu configurations for different interfaces
 */
const getMenuSections = (variant: 'admin' | 'agency-toolkit' | 'public', context?: string): MenuSection[] => {
  const baseMenus = {
    admin: [
      {
        id: 'main-actions',
        label: 'Main Actions',
        items: [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: Home,
            shortcut: '⌘+D',
            onClick: () => window.location.href = '/admin'
          },
          {
            id: 'create-user',
            label: 'Create User',
            icon: Plus,
            shortcut: '⌘+N',
            onClick: () => console.log('Create user')
          },
          {
            id: 'system-settings',
            label: 'System Settings',
            icon: Settings,
            shortcut: '⌘+,',
            onClick: () => window.location.href = '/admin/settings'
          }
        ]
      },
      {
        id: 'management',
        label: 'Management',
        items: [
          {
            id: 'users',
            label: 'User Management',
            icon: Users,
            onClick: () => window.location.href = '/admin/users'
          },
          {
            id: 'templates',
            label: 'Template Management',
            icon: Layers,
            onClick: () => window.location.href = '/admin/templates'
          },
          {
            id: 'monitoring',
            label: 'System Monitoring',
            icon: Activity,
            onClick: () => window.location.href = '/admin/monitoring'
          }
        ]
      },
      {
        id: 'interface-navigation',
        label: 'Interface Navigation',
        items: [
          {
            id: 'switch-to-agency',
            label: 'Switch to Agency Toolkit',
            icon: Target,
            onClick: () => window.location.href = '/agency-toolkit'
          }
        ]
      }
    ],
    'agency-toolkit': [
      {
        id: 'main-actions',
        label: 'Main Actions',
        items: [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: Home,
            shortcut: '⌘+D',
            onClick: () => window.location.href = '/agency-toolkit'
          },
          {
            id: 'create-app',
            label: 'Create App',
            icon: Plus,
            shortcut: '⌘+N',
            onClick: () => console.log('Create app')
          },
          {
            id: 'toolkit-settings',
            label: 'Toolkit Settings',
            icon: Settings,
            shortcut: '⌘+,',
            onClick: () => window.location.href = '/agency-toolkit/settings'
          }
        ]
      },
      {
        id: 'development',
        label: 'Development Tools',
        items: [
          {
            id: 'apps',
            label: 'My Apps',
            icon: Package,
            onClick: () => window.location.href = '/agency-toolkit/apps'
          },
          {
            id: 'templates',
            label: 'Template Library',
            icon: Layers,
            onClick: () => window.location.href = '/agency-toolkit/templates'
          },
          {
            id: 'forms',
            label: 'Form Builder',
            icon: Database,
            onClick: () => window.location.href = '/agency-toolkit/forms'
          },
          {
            id: 'analytics',
            label: 'Analytics',
            icon: BarChart3,
            onClick: () => window.location.href = '/agency-toolkit/analytics'
          }
        ]
      },
      {
        id: 'interface-navigation',
        label: 'Interface Navigation',
        items: [
          {
            id: 'switch-to-admin',
            label: 'Switch to Admin Panel',
            icon: Shield,
            onClick: () => window.location.href = '/admin'
          }
        ]
      }
    ],
    public: [
      {
        id: 'navigation',
        label: 'Navigation',
        items: [
          {
            id: 'home',
            label: 'Home',
            icon: Home,
            onClick: () => window.location.href = '/'
          },
          {
            id: 'admin-login',
            label: 'Admin Login',
            icon: Shield,
            onClick: () => window.location.href = '/admin'
          },
          {
            id: 'agency-login',
            label: 'Agency Toolkit',
            icon: Target,
            onClick: () => window.location.href = '/agency-toolkit'
          }
        ]
      }
    ]
  };

  return baseMenus[variant] || [];
};

/**
 * Contextual help configuration
 */
const getContextualHelp = (variant: 'admin' | 'agency-toolkit' | 'public', context?: string): ContextualHelp => {
  const helpContent = {
    admin: {
      default: {
        title: 'Admin Panel Help',
        description: 'The admin panel provides comprehensive system administration tools.',
        steps: [
          'Use the sidebar navigation to access different sections',
          'Dashboard provides system overview and key metrics',
          'User management allows you to create and manage users',
          'System settings control global configuration'
        ],
        links: [
          { text: 'Admin Documentation', href: '/docs/admin', external: false },
          { text: 'User Guide', href: '/docs/user-guide', external: false }
        ]
      }
    },
    'agency-toolkit': {
      default: {
        title: 'Agency Toolkit Help',
        description: 'The agency toolkit is your development platform for creating client applications.',
        steps: [
          'Create new apps using templates or start from scratch',
          'Use the form builder to create data collection interfaces',
          'Monitor app performance with built-in analytics',
          'Deploy apps directly to clients with one click'
        ],
        links: [
          { text: 'Toolkit Documentation', href: '/docs/agency-toolkit', external: false },
          { text: 'Template Guide', href: '/docs/templates', external: false }
        ]
      }
    },
    public: {
      default: {
        title: 'Platform Help',
        description: 'Welcome to the micro-app development platform.',
        steps: [
          'Choose the interface that matches your role',
          'Admin panel for system administration',
          'Agency toolkit for app development'
        ],
        links: [
          { text: 'Getting Started', href: '/docs/getting-started', external: false }
        ]
      }
    }
  };

  const variantHelp = helpContent[variant] || helpContent.public;
  return variantHelp[context as keyof typeof variantHelp] || variantHelp.default;
};

/**
 * Contextual Help Dialog Component
 */
function ContextualHelpDialog({ variant, context }: { variant: 'admin' | 'agency-toolkit' | 'public'; context?: string }) {
  const [open, setOpen] = useState(false);
  const help = getContextualHelp(variant, context);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <span>{help.title}</span>
          </DialogTitle>
          <DialogDescription>
            {help.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {help.steps && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center space-x-2">
                <Lightbulb className="w-4 h-4" />
                <span>Getting Started</span>
              </h4>
              <div className="space-y-3">
                {help.steps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {help.links && help.links.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span>Additional Resources</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {help.links.map((link, index) => (
                  <Card key={index} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{link.text}</span>
                      {link.external ? (
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      ) : (
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Info className="w-4 h-4" />
              <span>Need more help? Contact support or check our documentation.</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Standardized Menu Component
 */
function StandardizedMenuDropdown({ variant, context }: { variant: 'admin' | 'agency-toolkit' | 'public'; context?: string }) {
  const sections = getMenuSections(variant, context);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <Menu className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Quick Actions</span>
          <Badge variant="outline" className="text-xs">
            {variant === 'admin' ? 'Admin' : variant === 'agency-toolkit' ? 'Toolkit' : 'Public'}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {sections.map((section, sectionIndex) => (
          <div key={section.id}>
            {sectionIndex > 0 && <DropdownMenuSeparator />}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 py-1">
                {section.label}
              </DropdownMenuLabel>
              {section.items.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  onClick={item.onClick}
                  disabled={item.disabled}
                  className={cn(
                    "flex items-center space-x-3",
                    item.destructive && "text-red-600 dark:text-red-400"
                  )}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span className="flex-1">{item.label}</span>
                  {item.shortcut && (
                    <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </div>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <HelpCircle className="h-4 w-4" />
            <span>Help & Support</span>
          </span>
          <ArrowRight className="h-3 w-3" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Main Standardized Menu Component
 */
export function StandardizedMenu({
  variant,
  context,
  showHelp = true,
  className
}: StandardizedMenuProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <StandardizedMenuDropdown variant={variant} context={context} />

      {showHelp && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ContextualHelpDialog variant={variant} context={context} />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Help & Guidance</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

/**
 * User Guidance Component
 */
export function UserGuidance({ variant, context, compact = false }: {
  variant: 'admin' | 'agency-toolkit' | 'public';
  context?: string;
  compact?: boolean;
}) {
  const [dismissed, setDismissed] = useState(false);
  const help = getContextualHelp(variant, context);

  if (dismissed || compact) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Welcome to {variant === 'admin' ? 'Admin Panel' : variant === 'agency-toolkit' ? 'Agency Toolkit' : 'Platform'}
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              {help.description}
            </p>
            {help.steps && help.steps.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Quick Start
                </p>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  {help.steps.slice(0, 2).map((step, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3 h-3 text-blue-500" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="h-6 w-6 p-0 text-blue-600 dark:text-blue-400"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </motion.div>
  );
}

export default StandardizedMenu;