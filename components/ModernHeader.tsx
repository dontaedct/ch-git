/**
 * Modern Header Component - High-Tech UI/UX Design
 * 
 * A unified header component inspired by Linear.app, Vercel, and Stripe
 * featuring glass morphism, smooth animations, and modern interaction patterns.
 * 
 * Universal Header: @components/ModernHeader.tsx
 */

'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Home, Settings, Package, FileText, X, ChevronDown, ChevronRight, User, LogOut, Bell, Search } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useReducedMotion } from "@/hooks/use-motion-preference"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"

interface ModernHeaderProps {
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

export function ModernHeader({ client, isSafeMode }: ModernHeaderProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const isAuthenticated = Boolean(client ?? isSafeMode)
  const reducedMotion = useReducedMotion()

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
        duration: reducedMotion ? 0.01 : 0.6,
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
        duration: reducedMotion ? 0.01 : 0.4,
        delay: reducedMotion ? 0 : i * 0.1,
        ease: "easeOut" as const
      }
    })
  }

  const mobileMenuVariants = {
    hidden: { 
      x: "100%",
      transition: {
        duration: reducedMotion ? 0.01 : 0.4,
        ease: "easeInOut" as const
      }
    },
    visible: { 
      x: 0,
      transition: {
        duration: reducedMotion ? 0.01 : 0.4,
        ease: "easeInOut" as const
      }
    }
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: reducedMotion ? 0.01 : 0.3
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
      {/* Modern glass morphism header */}
      <motion.header 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-500 safe-area-inset",
          "backdrop-blur-xl border-b",
          isScrolled 
            ? "bg-white/90 dark:bg-gray-900/90 border-gray-200/60 dark:border-gray-700/60 shadow-lg shadow-gray-900/5" 
            : "bg-white/80 dark:bg-gray-900/80 border-gray-200/40 dark:border-gray-700/40"
        )}
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Left side - Logo and breadcrumbs */}
          <div className="flex items-center gap-6">
            <motion.div
              whileHover="hover"
              whileTap="tap"
              variants={hoverVariants}
            >
              <Link 
                href={isAuthenticated ? "/dashboard" : "/"} 
                className="flex items-center gap-3 hover:opacity-80 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl px-3 py-2 group"
                tabIndex={0}
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg bg-gray-700 group-hover:bg-gray-600 group-hover:shadow-xl transition-all duration-300">
                    <span className="text-white font-bold text-sm">MA</span>
                  </div>
                </div>
                <span className="hidden sm:inline text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  Micro App
                </span>
              </Link>
            </motion.div>
            
            {/* Enhanced breadcrumbs with smooth animations */}
            <AnimatePresence>
              {breadcrumbs.length > 1 && (
                <motion.nav 
                  aria-label="Breadcrumb" 
                  className="hidden lg:flex items-center gap-2 text-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: reducedMotion ? 0.01 : 0.4 }}
                >
                  {breadcrumbs.map((crumb, index) => (
                    <motion.div 
                      key={crumb.href} 
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: reducedMotion ? 0.01 : 0.3,
                        delay: reducedMotion ? 0 : index * 0.1 
                      }}
                    >
                      {index > 0 && (
                        <motion.div
                          initial={{ opacity: 0, rotate: -90 }}
                          animate={{ opacity: 1, rotate: -90 }}
                          transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
                        >
                          <ChevronRight className="w-3 h-3 text-gray-400" />
                        </motion.div>
                      )}
                      <Link
                        href={crumb.href}
                        className={cn(
                          "hover:text-gray-700 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-lg px-2 py-1",
                          isActiveRoute(crumb.href) ? "text-gray-900 dark:text-gray-100 font-medium" : "text-gray-500 dark:text-gray-400"
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
            {/* Search button */}
            <motion.button
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              aria-label="Search"
              whileHover="hover"
              whileTap="tap"
              variants={hoverVariants}
            >
              <Search className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </motion.button>

            {/* Theme Toggle */}
            <ThemeToggle 
              size="icon-sm" 
              variant="ghost" 
              className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-xl"
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
                        "relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all duration-300",
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
                            className="w-1.5 h-1.5 rounded-full hidden lg:block bg-gradient-to-r from-gray-600 to-gray-700"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
                          />
                        )}
                      </AnimatePresence>

                      {/* Hover indicator */}
                      <AnimatePresence>
                        {hoveredItem === route.href && !isActive && (
                          <motion.div
                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 shadow-sm"
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
                transition={{ duration: reducedMotion ? 0.01 : 0.4, delay: reducedMotion ? 0 : 0.2 }}
              >
                {/* Notifications */}
                <motion.button
                  className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  whileHover="hover"
                  whileTap="tap"
                  variants={hoverVariants}
                >
                  <Bell className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                </motion.button>

                {/* User menu */}
                <motion.div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  whileHover="hover"
                  whileTap="tap"
                  variants={hoverVariants}
                >
                  <div className="w-6 h-6 rounded-lg bg-gray-600 flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-600 dark:text-gray-400 hidden lg:inline">
                    {client?.email?.split('@')[0] ?? 'demo'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </motion.div>

                {isSafeMode && (
                  <motion.span 
                    className="text-xs bg-yellow-100 dark:bg-yellow-900/20 text-white px-2 py-1 rounded-lg font-medium glow-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
                  >
                    SAFE MODE
                  </motion.span>
                )}
              </motion.div>
            )}

            {/* CTA Button for non-authenticated users */}
            {!isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: reducedMotion ? 0.01 : 0.4 }}
              >
                <Button asChild className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <Link href="/intake">Get Started</Link>
                </Button>
              </motion.div>
            )}

            {/* Enhanced mobile menu button */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              aria-label="Open navigation menu"
              whileHover="hover"
              whileTap="tap"
              variants={hoverVariants}
            >
              <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
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
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            />
            
            {/* Enhanced drawer with slide animation */}
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
                  className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reducedMotion ? 0.01 : 0.4 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gray-700 flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm">MA</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">Micro App</span>
                  </div>
                  <motion.button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Close navigation menu"
                    whileHover="hover"
                    whileTap="tap"
                    variants={hoverVariants}
                  >
                    <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </motion.button>
                </motion.div>

                {/* Enhanced navigation with staggered animations */}
                <nav className="flex-1 px-6 py-6 space-y-2">
                  {visibleRoutes.map((route, index) => {
                    const Icon = route.icon
                    const isActive = isActiveRoute(route.href)
                    
                    return (
                      <motion.div
                        key={route.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          duration: reducedMotion ? 0.01 : 0.4,
                          delay: reducedMotion ? 0 : index * 0.1 
                        }}
                        whileHover="hover"
                        whileTap="tap"
                        variants={hoverVariants}
                      >
                        <Link
                          href={route.href}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                            isActive 
                              ? "text-gray-600 bg-gray-50 dark:bg-gray-900/20 shadow-sm" 
                              : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{route.label}</span>
                          <AnimatePresence>
                            {isActive && (
                              <motion.div 
                                className="ml-auto w-2 h-2 bg-gray-600 rounded-full"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
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
                    className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: reducedMotion ? 0.01 : 0.4 }}
                  >
                    {isSafeMode && (
                      <motion.div 
                        className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
                      >
                        <span className="text-sm font-medium text-white glow-white">SAFE MODE ACTIVE</span>
                      </motion.div>
                    )}
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Signed in as <span className="font-medium text-gray-900 dark:text-gray-100">{client?.email ?? 'demo@example.com'}</span>
                    </div>
                    {client?.role && (
                      <motion.div 
                        className="text-xs bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300 px-3 py-2 rounded-lg inline-block font-medium"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
                      >
                        {client.role.toUpperCase()}
                      </motion.div>
                    )}
                    <motion.div
                      whileHover="hover"
                      whileTap="tap"
                      variants={hoverVariants}
                    >
                      <Link 
                        href="/login"
                        className="block text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded-lg px-2 py-2"
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
      <div className="h-16" />
    </>
  )
}
