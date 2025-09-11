/**
 * HT-005.2: Enhanced Navigation System — Smooth Animations & Modern Layout
 * 
 * This file implements the advanced navigation system with Swift App inspired
 * smooth animations, better mobile experience, and modern interaction patterns.
 * 
 * Universal Header: @components/EnhancedNavigation.tsx
 */

'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Home, Settings, Package, FileText, X, ChevronDown, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useReducedMotion } from "@/hooks/use-motion-preference"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/ui/theme-toggle"

interface EnhancedNavigationProps {
  client?: {
    email?: string
    role?: string | null
  } | null
  isSafeMode?: boolean
}

const routes = [
  {
    href: "/",
    label: "Home",
    icon: Home,
    public: true
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: Home,
    protected: true
  },
  {
    href: "/dashboard/modules",
    label: "Modules",
    icon: Package,
    protected: true,
    parent: "/dashboard"
  },
  {
    href: "/dashboard/catalog",
    label: "Catalog",
    icon: FileText,
    protected: true,
    parent: "/dashboard"
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
    protected: true,
    parent: "/dashboard"
  }
]

export function EnhancedNavigation({ client, isSafeMode }: EnhancedNavigationProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const isAuthenticated = Boolean(client ?? isSafeMode)
  const reducedMotion = useReducedMotion()

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  const getVisibleRoutes = () => {
    return routes.filter(route => {
      if (route.public && route.protected) return true
      if (route.public && !isAuthenticated) return true
      if (route.protected && isAuthenticated) return true
      return false
    })
  }

  const getBreadcrumbs = () => {
    const visibleRoutes = getVisibleRoutes()
    const currentRoute = visibleRoutes.find(route => route.href === pathname)
    
    if (!currentRoute) return []
    
    const breadcrumbs = []
    
    // Add parent if exists
    if (currentRoute.parent) {
      const parentRoute = visibleRoutes.find(route => route.href === currentRoute.parent)
      if (parentRoute) {
        breadcrumbs.push(parentRoute)
      }
    }
    
    // Add current route if not already the parent
    if (!currentRoute.parent || currentRoute.href !== currentRoute.parent) {
      breadcrumbs.push(currentRoute)
    }
    
    return breadcrumbs
  }

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const visibleRoutes = getVisibleRoutes()
  const breadcrumbs = getBreadcrumbs()

  // Animation variants
  const headerVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: reducedMotion ? 0.01 : 0.4,
        ease: [0.25, 0.1, 0.25, 1] as const
      }
    }
  }

  const navItemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: reducedMotion ? 0.01 : 0.3,
        delay: reducedMotion ? 0 : i * 0.1,
        ease: "easeOut" as const
      }
    })
  }

  const mobileMenuVariants = {
    hidden: { 
      x: "100%",
      transition: {
        duration: reducedMotion ? 0.01 : 0.3,
        ease: "easeInOut" as const
      }
    },
    visible: { 
      x: 0,
      transition: {
        duration: reducedMotion ? 0.01 : 0.3,
        ease: "easeInOut" as const
      }
    }
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: reducedMotion ? 0.01 : 0.2
      }
    }
  }

  const hoverVariants = {
    hover: {
      scale: reducedMotion ? 1 : 1.02,
      y: reducedMotion ? 0 : -2,
      transition: {
        duration: 0.2,
        ease: "easeOut" as const
      }
    },
    tap: {
      scale: reducedMotion ? 1 : 0.98,
      transition: {
        duration: 0.1
      }
    }
  }

  return (
    <>
      {/* Enhanced translucent topbar with smooth animations */}
      {/* HT-005.5 - Mobile-First Responsive Design */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 h-14 backdrop-blur-xl border-b safe-area-inset transition-all duration-500 bg-white/80 dark:bg-gray-900/80 border-gray-200 dark:border-gray-700"
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-3 xs:px-4 h-full flex items-center justify-between">
          {/* Left side - Logo and breadcrumbs */}
          <div className="flex items-center gap-4">
            <motion.div
              whileHover="hover"
              whileTap="tap"
              variants={hoverVariants}
            >
              <Link 
                href={isAuthenticated ? "/dashboard" : "/"} 
                className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-2 py-1"
                tabIndex={0}
              >
                <div 
                  className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm bg-gray-900 dark:bg-gray-100"
                >
                  <span className="text-white font-bold text-sm">CH</span>
                </div>
                <span 
                  className="hidden sm:inline text-sm font-semibold transition-colors duration-300 text-gray-900 dark:text-gray-100"
                >
                  Micro App
                </span>
              </Link>
            </motion.div>
            
            {/* Enhanced breadcrumbs with smooth animations */}
            <AnimatePresence>
              {breadcrumbs.length > 1 && (
                <motion.nav 
                  aria-label="Breadcrumb" 
                  className="hidden md:flex items-center gap-2 text-sm text-gray-500"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
                >
                  {breadcrumbs.map((crumb, index) => (
                    <motion.div 
                      key={crumb.href} 
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: reducedMotion ? 0.01 : 0.2,
                        delay: reducedMotion ? 0 : index * 0.1 
                      }}
                    >
                      {index > 0 && (
                        <motion.div
                          initial={{ opacity: 0, rotate: -90 }}
                          animate={{ opacity: 1, rotate: -90 }}
                          transition={{ duration: reducedMotion ? 0.01 : 0.2 }}
                        >
                          <ChevronRight className="w-3 h-3 text-gray-400" />
                        </motion.div>
                      )}
                      <Link
                        href={crumb.href}
                        className={cn(
                          "hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-1 py-0.5",
                          isActiveRoute(crumb.href) ? "text-gray-900 font-medium" : "text-gray-500"
                        )}
                      >
                        {crumb.label}
                      </Link>
                    </motion.div>
                  ))}
                </motion.nav>
              )}
            </AnimatePresence>
          </div>

          {/* Right side - Navigation and user info */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <ThemeToggle 
              size="icon-sm" 
              variant="ghost" 
              className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            />
            
            {/* Enhanced desktop navigation with hover animations */}
            <nav className="hidden md:flex items-center gap-1">
              {visibleRoutes.filter(route => !route.parent).map((route, index) => {
                const Icon = route.icon
                const isActive = isActiveRoute(route.href)
                
                return (
                  <motion.div
                    key={route.href}
                    custom={index}
                    variants={navItemVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    whileTap="tap"
                    onHoverStart={() => setHoveredItem(route.href)}
                    onHoverEnd={() => setHoveredItem(null)}
                  >
                    <Link
                      href={route.href}
                      className={cn(
                        "high-tech-nav-item relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1",
                        isActive 
                          ? "text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm" 
                          : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden lg:inline">{route.label}</span>
                      
                      {/* Active indicator with smooth animation */}
                      <AnimatePresence>
                        {isActive && (
                          <motion.div 
                            className="w-1 h-1 rounded-full hidden lg:block bg-gray-900 dark:bg-gray-100"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ duration: reducedMotion ? 0.01 : 0.2 }}
                          />
                        )}
                      </AnimatePresence>

                      {/* Hover indicator */}
                      <AnimatePresence>
                        {hoveredItem === route.href && !isActive && (
                          <motion.div
                            className="absolute inset-0 rounded-lg bg-gray-100 dark:bg-gray-800 shadow-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: reducedMotion ? 0.01 : 0.2 }}
                          />
                        )}
                      </AnimatePresence>
                    </Link>
                  </motion.div>
                )
              })}
            </nav>

            {/* Enhanced user info with animations */}
            {isAuthenticated && (
              <motion.div 
                className="hidden sm:flex items-center gap-3 text-sm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: reducedMotion ? 0.01 : 0.3, delay: reducedMotion ? 0 : 0.2 }}
              >
                {isSafeMode && (
                  <motion.span 
                    className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-medium"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: reducedMotion ? 0.01 : 0.2 }}
                  >
                    SAFE MODE
                  </motion.span>
                )}
                <span className="text-gray-600">
                  {client?.email ?? 'demo@example.com'}
                </span>
                {client?.role && (
                  <motion.span 
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: reducedMotion ? 0.01 : 0.2, delay: reducedMotion ? 0 : 0.1 }}
                  >
                    {client.role.toUpperCase()}
                  </motion.span>
                )}
                {(client?.role === 'admin' || client?.role === 'owner') && (
                  <motion.div
                    whileHover="hover"
                    whileTap="tap"
                    variants={hoverVariants}
                  >
                    <Link
                      href="/operability/diagnostics"
                      className="text-xs text-blue-700 hover:text-blue-900 underline underline-offset-2"
                      aria-label="Open admin diagnostics"
                    >
                      Admin
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Enhanced mobile menu button */}
            {/* HT-005.5 - Enhanced mobile menu button with touch optimization */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden flex items-center justify-center touch-target-comfortable rounded-lg hover:bg-gray-100/60 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              aria-label="Open navigation menu"
              whileHover="hover"
              whileTap="tap"
              variants={hoverVariants}
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Enhanced mobile drawer menu with smooth animations */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Enhanced backdrop with blur */}
            <motion.div 
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            />
            
            {/* Enhanced drawer with slide animation */}
            {/* HT-005.5 - Mobile-First Responsive Design */}
            <motion.div 
              className="fixed top-0 right-0 z-50 w-80 h-full shadow-2xl md:hidden safe-area-inset backdrop-blur-xl bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="flex flex-col h-full">
                {/* Enhanced header */}
                <motion.div 
                  className="flex items-center justify-between p-4 border-b border-gray-200"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xs">CH</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">Micro App</span>
                  </div>
                  <motion.button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center touch-target-comfortable rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Close navigation menu"
                    whileHover="hover"
                    whileTap="tap"
                    variants={hoverVariants}
                  >
                    <X className="w-4 h-4 text-gray-700" />
                  </motion.button>
                </motion.div>

                {/* Enhanced navigation with staggered animations */}
                <nav className="flex-1 px-4 py-6 space-y-2">
                  {visibleRoutes.map((route, index) => {
                    const Icon = route.icon
                    const isActive = isActiveRoute(route.href)
                    
                    return (
                      <motion.div
                        key={route.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          duration: reducedMotion ? 0.01 : 0.3,
                          delay: reducedMotion ? 0 : index * 0.1 
                        }}
                        whileHover="hover"
                        whileTap="tap"
                        variants={hoverVariants}
                      >
                        <Link
                          href={route.href}
                          className={cn(
                            "mobile-nav-item flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                            isActive 
                              ? "text-blue-600 bg-blue-50 shadow-sm" 
                              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{route.label}</span>
                          <AnimatePresence>
                            {isActive && (
                              <motion.div 
                                className="ml-auto w-2 h-2 bg-blue-600 rounded-full"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                transition={{ duration: reducedMotion ? 0.01 : 0.2 }}
                              />
                            )}
                          </AnimatePresence>
                        </Link>
                      </motion.div>
                    )
                  })}
                </nav>

                {/* Enhanced user info */}
                {isAuthenticated && (
                  <motion.div 
                    className="p-4 border-t border-gray-200 space-y-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
                  >
                    {isSafeMode && (
                      <motion.div 
                        className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: reducedMotion ? 0.01 : 0.2 }}
                      >
                        <span className="text-xs font-medium text-yellow-800">SAFE MODE ACTIVE</span>
                      </motion.div>
                    )}
                    <div className="text-sm text-gray-600">
                      Signed in as <span className="font-medium">{client?.email ?? 'demo@example.com'}</span>
                    </div>
                    {client?.role && (
                      <motion.div 
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded inline-block font-medium"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: reducedMotion ? 0.01 : 0.2 }}
                      >
                        {client.role.toUpperCase()}
                      </motion.div>
                    )}
                    {(client?.role === 'admin' || client?.role === 'owner') && (
                      <motion.div
                        whileHover="hover"
                        whileTap="tap"
                        variants={hoverVariants}
                      >
                        <Link 
                          href="/operability/diagnostics"
                          className="block text-sm text-blue-700 hover:text-blue-900 transition-colors font-medium"
                        >
                          Admin Diagnostics
                        </Link>
                      </motion.div>
                    )}
                    <motion.div
                      whileHover="hover"
                      whileTap="tap"
                      variants={hoverVariants}
                    >
                      <Link 
                        href="/login"
                        className="block text-sm text-red-600 hover:text-red-800 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded px-1 py-1"
                      >
                        Sign out
                      </Link>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer to push content below fixed header */}
      <div className="h-14" />
    </>
  )
}
