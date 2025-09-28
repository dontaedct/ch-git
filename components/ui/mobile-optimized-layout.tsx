/**
 * @fileoverview Mobile-Optimized Layout Component for Admin Interfaces
 * @module components/ui/mobile-optimized-layout
 * @version 1.0.0
 *
 * HT-034.7.4: Mobile-first responsive design optimization for admin interfaces
 */

"use client";

import { useState, useEffect, useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Menu,
  X,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Filter,
  SortAsc,
  Grid3X3,
  List,
  Settings,
  User,
  Home,
  ArrowUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  showFilter?: boolean;
  actions?: ReactNode;
  className?: string;
}

interface MobileNavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  badge?: number;
  onClick?: () => void;
}

interface ViewMode {
  grid: boolean;
  list: boolean;
}

export function MobileOptimizedLayout({
  children,
  title,
  subtitle,
  showSearch = true,
  showFilter = false,
  actions,
  className
}: MobileLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Scroll detection for floating action button
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        setShowScrollTop(scrollRef.current.scrollTop > 300);
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Auto-focus search when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const mobileNavItems: MobileNavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/admin' },
    { id: 'apps', label: 'Apps', icon: Grid3X3, href: '/agency-toolkit', badge: 5 },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' },
    { id: 'profile', label: 'Profile', icon: User, href: '/admin/profile' }
  ];

  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search logic here
    console.log('Search:', searchTerm);
    setIsSearchOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {!isSearchOpen ? (
          // Normal Header
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMenuOpen(true)}
                  className="p-2"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              )}

              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-semibold truncate">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-muted-foreground truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {showSearch && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2"
                >
                  <Search className="w-5 h-5" />
                </Button>
              )}

              {showFilter && (
                <Button variant="ghost" size="sm" className="p-2">
                  <Filter className="w-5 h-5" />
                </Button>
              )}

              <Button variant="ghost" size="sm" className="p-2 relative">
                <Bell className="w-5 h-5" />
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center"
                >
                  3
                </Badge>
              </Button>

              {actions}
            </div>
          </div>
        ) : (
          // Search Header
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 px-4 py-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchOpen(false)}
              className="p-2"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />

            {searchTerm && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm('')}
                className="p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </form>
        )}

        {/* View Mode Toggle (shown on certain pages) */}
        {!isSearchOpen && (title?.includes('Apps') || title?.includes('Templates')) && (
          <div className="flex items-center justify-center gap-1 pb-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="px-3 py-1 h-8"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-3 py-1 h-8"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        <ScrollArea ref={scrollRef} className="h-full">
          <main className={cn("p-4 pb-20", className)}>
            {children}
          </main>
        </ScrollArea>

        {/* Scroll to Top Button */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute bottom-20 right-4 z-30"
            >
              <Button
                onClick={scrollToTop}
                size="sm"
                className="w-12 h-12 rounded-full shadow-lg"
              >
                <ArrowUp className="w-5 h-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMenuOpen && isMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsMenuOpen(false)}
            />

            <motion.nav
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-background border-r z-50"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Menu</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-4">
                <div className="space-y-2">
                  {mobileNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant="ghost"
                        className="w-full justify-start h-12"
                        onClick={() => {
                          setIsMenuOpen(false);
                          item.onClick?.();
                        }}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-2">
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* User Profile Section */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Admin User</p>
                    <p className="text-xs text-muted-foreground truncate">
                      admin@example.com
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="p-2">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation (Mobile) */}
      {isMobile && (
        <nav className="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-around py-2">
            {mobileNavItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const isActive = false; // You would determine this based on current route

              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex flex-col gap-1 h-12 w-12 p-1 relative",
                    isActive && "text-primary"
                  )}
                  onClick={item.onClick}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs truncate">{item.label}</span>
                  {item.badge && (
                    <Badge
                      variant="destructive"
                      className="absolute top-0 right-0 w-4 h-4 text-xs p-0 flex items-center justify-center"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}

/**
 * Mobile-Optimized Card Grid Component
 */
interface MobileCardGridProps {
  children: ReactNode;
  viewMode?: 'grid' | 'list';
  className?: string;
}

export function MobileCardGrid({ children, viewMode = 'grid', className }: MobileCardGridProps) {
  return (
    <div
      className={cn(
        "gap-4",
        viewMode === 'grid'
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "space-y-4",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Mobile-Optimized Card Component
 */
interface MobileCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  image?: string;
  actions?: ReactNode;
  onClick?: () => void;
  viewMode?: 'grid' | 'list';
  className?: string;
}

export function MobileCard({
  title,
  subtitle,
  description,
  badge,
  image,
  actions,
  onClick,
  viewMode = 'grid',
  className
}: MobileCardProps) {
  const isListView = viewMode === 'list';

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-md active:scale-95",
        isListView && "flex items-center p-4",
        className
      )}
      onClick={onClick}
    >
      {isListView ? (
        <>
          {image && (
            <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 mr-4">
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-medium truncate text-sm">{title}</h3>
              {badge && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {badge}
                </Badge>
              )}
            </div>

            {subtitle && (
              <p className="text-xs text-muted-foreground truncate mb-1">
                {subtitle}
              </p>
            )}

            {description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}
          </div>

          {actions && (
            <div className="ml-4 flex-shrink-0">
              {actions}
            </div>
          )}
        </>
      ) : (
        <>
          {image && (
            <div className="aspect-video rounded-t-lg bg-muted overflow-hidden">
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-base line-clamp-2">{title}</CardTitle>
              {badge && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {badge}
                </Badge>
              )}
            </div>

            {subtitle && (
              <p className="text-sm text-muted-foreground truncate">
                {subtitle}
              </p>
            )}
          </CardHeader>

          {description && (
            <CardContent className="pt-0 pb-3">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {description}
              </p>
            </CardContent>
          )}

          {actions && (
            <CardContent className="pt-0">
              {actions}
            </CardContent>
          )}
        </>
      )}
    </Card>
  );
}

export default MobileOptimizedLayout;