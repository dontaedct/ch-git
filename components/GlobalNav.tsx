'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Home, Settings, Package, FileText, X, ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface GlobalNavProps {
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

export function GlobalNav({ client, isSafeMode }: GlobalNavProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isAuthenticated = Boolean(client ?? isSafeMode)

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

  return (
    <>
      {/* Ultra-thin translucent topbar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-12 bg-white/80 backdrop-blur-md border-b border-gray-200/60 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          {/* Left side - Logo and breadcrumbs */}
          <div className="flex items-center gap-4">
            <Link 
              href={isAuthenticated ? "/dashboard" : "/"} 
              className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-2 py-1"
              tabIndex={0}
            >
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">CH</span>
              </div>
              <span className="hidden sm:inline text-sm font-medium text-gray-900">Micro App</span>
            </Link>
            
            {/* Micro-breadcrumbs for dashboard sections */}
            {breadcrumbs.length > 1 && (
              <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.href} className="flex items-center gap-2">
                    {index > 0 && <ChevronDown className="w-3 h-3 rotate-[-90deg] text-gray-400" />}
                    <Link
                      href={crumb.href}
                      className={cn(
                        "hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-1 py-0.5",
                        isActiveRoute(crumb.href) ? "text-gray-900 font-medium" : "text-gray-500"
                      )}
                    >
                      {crumb.label}
                    </Link>
                  </div>
                ))}
              </nav>
            )}
          </div>

          {/* Right side - Navigation and user info */}
          <div className="flex items-center gap-4">
            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {visibleRoutes.filter(route => !route.parent).map((route) => {
                const Icon = route.icon
                const isActive = isActiveRoute(route.href)
                
                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                      isActive 
                        ? "text-blue-600 bg-blue-50/80" 
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100/60"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden lg:inline">{route.label}</span>
                    {isActive && (
                      <div className="w-1 h-1 bg-blue-600 rounded-full hidden lg:block" />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* User info */}
            {isAuthenticated && (
              <div className="hidden sm:flex items-center gap-3 text-sm">
                {isSafeMode && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-medium">
                    SAFE MODE
                  </span>
                )}
                <span className="text-gray-600">
                  {client?.email ?? 'demo@example.com'}
                </span>
                {client?.role && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                    {client.role.toUpperCase()}
                  </span>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100/60 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              aria-label="Open navigation menu"
            >
              <Menu className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer menu */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Drawer */}
          <div className="fixed top-0 right-0 z-50 w-80 h-full bg-white shadow-2xl md:hidden transform transition-transform duration-300 ease-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">CH</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Micro App</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Close navigation menu"
                >
                  <X className="w-4 h-4 text-gray-700" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-2">
                {visibleRoutes.map((route) => {
                  const Icon = route.icon
                  const isActive = isActiveRoute(route.href)
                  
                  return (
                    <Link
                      key={route.href}
                      href={route.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                        isActive 
                          ? "text-blue-600 bg-blue-50" 
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{route.label}</span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
                      )}
                    </Link>
                  )
                })}
              </nav>

              {/* User info */}
              {isAuthenticated && (
                <div className="p-4 border-t border-gray-200 space-y-3">
                  {isSafeMode && (
                    <div className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <span className="text-xs font-medium text-yellow-800">SAFE MODE ACTIVE</span>
                    </div>
                  )}
                  <div className="text-sm text-gray-600">
                    Signed in as <span className="font-medium">{client?.email ?? 'demo@example.com'}</span>
                  </div>
                  {client?.role && (
                    <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded inline-block font-medium">
                      {client.role.toUpperCase()}
                    </div>
                  )}
                  <Link 
                    href="/login"
                    className="block text-sm text-red-600 hover:text-red-800 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded px-1 py-1"
                  >
                    Sign out
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Spacer to push content below fixed header */}
      <div className="h-12" />
    </>
  )
}