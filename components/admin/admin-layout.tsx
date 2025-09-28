/**
 * @fileoverview Consistent Admin Layout System - HT-032.1.1
 * @module components/admin/admin-layout
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Consistent admin layout system that provides unified interface structure
 * for the modular admin interface. Supports responsive design, navigation,
 * and dynamic content areas.
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
  Rocket
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
import { 
  NavigationManager, 
  NavigationSection, 
  NavigationItem,
  getNavigationManager 
} from '@/lib/admin/navigation';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showBreadcrumbs?: boolean;
  showSearch?: boolean;
  showUserMenu?: boolean;
  className?: string;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  navigationManager: NavigationManager;
  currentPath: string;
}

interface HeaderProps {
  title?: string;
  description?: string;
  showSearch?: boolean;
  showUserMenu?: boolean;
  onMenuToggle: () => void;
  currentPath: string;
}

interface NavigationItemComponentProps {
  item: NavigationItem;
  isActive: boolean;
  onClick: () => void;
  collapsed: boolean;
}

/**
 * Navigation Item Component
 */
function NavigationItemComponent({ item, isActive, onClick, collapsed }: NavigationItemComponentProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
              "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              isActive 
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300" 
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
              collapsed && "justify-center px-2"
            )}
          >
            {item.icon && (
              <item.icon className={cn(
                "w-5 h-5 flex-shrink-0",
                isActive ? "text-blue-700 dark:text-blue-300" : "text-gray-500 dark:text-gray-400"
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
                    {item.description && !collapsed && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </div>
                  
                  {item.badge && (
                    <Badge variant={item.badge.variant} className="ml-2 text-xs">
                      {item.badge.text}
                    </Badge>
                  )}
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
  );
}

/**
 * Sidebar Component
 */
function Sidebar({ isOpen, onToggle, navigationManager, currentPath }: SidebarProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sections, setSections] = useState<NavigationSection[]>([]);

  useEffect(() => {
    const updateSections = () => {
      setSections(navigationManager.getSections());
    };

    updateSections();
    const unsubscribe = navigationManager.subscribe(updateSections);
    return unsubscribe;
  }, [navigationManager]);

  useEffect(() => {
    navigationManager.setSearchTerm(searchTerm);
  }, [searchTerm, navigationManager]);

  const handleItemClick = (item: NavigationItem) => {
    navigationManager.setActiveItem(item.id);
    
    if (item.href) {
      router.push(item.href);
    } else if (item.onClick) {
      item.onClick();
    }
    
    // Close mobile sidebar
    if (window.innerWidth < 768) {
      onToggle();
    }
  };

  const isItemActive = (item: NavigationItem) => {
    return item.href === currentPath || currentPath.startsWith(item.href + '/');
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : -320,
          width: collapsed ? 80 : 320
        }}
        className={cn(
          "fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50",
          "md:relative md:translate-x-0 md:z-auto",
          "flex flex-col"
        )}
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
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">Admin</h2>
                  <p className="text-xs text-gray-500">Modular Interface</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex items-center space-x-2">
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
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="md:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
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
            {sections.map((section) => (
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
                  {section.items
                    .filter(item => item.enabled)
                    .map((item) => (
                      <NavigationItemComponent
                        key={item.id}
                        item={item}
                        isActive={isItemActive(item)}
                        onClick={() => handleItemClick(item)}
                        collapsed={collapsed}
                      />
                    ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className={cn(
            "flex items-center space-x-3",
            collapsed && "justify-center"
          )}>
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium truncate">Admin User</p>
                  <p className="text-xs text-gray-500 truncate">admin@example.com</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

/**
 * Header Component
 */
function Header({ title, description, showSearch, showUserMenu, onMenuToggle, currentPath }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    ...(currentPath !== '/admin' ? [{ label: title || 'Page' }] : [])
  ];

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="md:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div>
            {/* Breadcrumbs */}
            <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {index > 0 && <span>/</span>}
                  {crumb.href ? (
                    <button
                      onClick={() => router.push(crumb.href!)}
                      className="hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span className="text-gray-900 dark:text-gray-100">{crumb.label}</span>
                  )}
                </div>
              ))}
            </nav>

            {/* Title and description */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {title || 'Admin Dashboard'}
              </h1>
              {description && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">{description}</p>
              )}
            </div>
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
          <Button variant="ghost" size="sm">
            <Bell className="w-5 h-5" />
          </Button>

          {/* Theme toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="mr-2 h-4 w-4" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          {showUserMenu && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/avatars/admin.jpg" alt="Admin" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Admin User</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      admin@example.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/admin/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
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
  );
}

/**
 * Main Admin Layout Component
 */
export function AdminLayout({ 
  children, 
  title, 
  description, 
  showBreadcrumbs = true, 
  showSearch = true, 
  showUserMenu = true, 
  className 
}: AdminLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navigationManager] = useState(() => getNavigationManager());

  useEffect(() => {
    // Close sidebar on route change (mobile)
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        navigationManager={navigationManager}
        currentPath={pathname}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={title}
          description={description}
          showSearch={showSearch}
          showUserMenu={showUserMenu}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          currentPath={pathname}
        />
        
        <main className={cn("flex-1 overflow-auto", className)}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

/**
 * Admin Page Wrapper Component
 * Provides consistent page structure within the admin layout
 */
interface AdminPageProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AdminPage({ title, description, actions, children, className }: AdminPageProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
          {description && (
            <p className="text-gray-600 dark:text-gray-400 mt-2">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center space-x-4">
            {actions}
          </div>
        )}
      </div>
      
      <div>{children}</div>
    </div>
  );
}

export default AdminLayout;
