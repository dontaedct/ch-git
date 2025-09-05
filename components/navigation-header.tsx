/**
 * @fileoverview Navigation Header Component for HT-002.2.5 - Linear/Vercel-inspired sticky navigation
 * @module components/navigation-header
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-002.2.5 - Add navigation header with translucent effect
 * 
 * Features:
 * - Sticky navigation with translucent background effect on scroll
 * - Theme toggle integration with proper accessibility
 * - Linear/Vercel-inspired design with subtle micro-interactions
 * - Responsive design with mobile-friendly navigation
 * - Proper CTAs and navigation links
 * - Focus states and keyboard navigation
 * - Reduced motion support
 * 
 * @example
 * ```tsx
 * // Basic navigation header
 * <NavigationHeader />
 * 
 * // With custom logo
 * <NavigationHeader logo={<CustomLogo />} />
 * ```
 */

"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { cn } from "@/lib/utils"

export interface NavigationHeaderProps {
  /**
   * Custom logo component
   */
  logo?: React.ReactNode
  /**
   * Whether to show the navigation links
   * @default true
   */
  showNavLinks?: boolean
  /**
   * Whether to show the CTA buttons
   * @default true
   */
  showCTAs?: boolean
  /**
   * Custom navigation links
   */
  navLinks?: Array<{
    href: string
    label: string
    external?: boolean
  }>
  /**
   * Custom CTA buttons
   */
  ctaButtons?: Array<{
    href: string
    label: string
    variant?: "default" | "outline" | "ghost"
    external?: boolean
  }>
  /**
   * Additional CSS classes
   */
  className?: string
}

const defaultNavLinks = [
  { href: "/docs", label: "Documentation" },
  { href: "/examples", label: "Examples" },
  { href: "/pricing", label: "Pricing" },
]

const defaultCTAButtons = [
  { href: "/login", label: "Sign In", variant: "ghost" as const },
  { href: "/signup", label: "Get Started", variant: "default" as const },
]

export function NavigationHeader({
  logo,
  showNavLinks = true,
  showCTAs = true,
  navLinks = defaultNavLinks,
  ctaButtons = defaultCTAButtons,
  className,
}: NavigationHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Handle scroll effect for translucent background
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 20)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [isMobileMenuOpen])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMobileMenuOpen])

  const defaultLogo = (
    <Link 
      href="/" 
      className="flex items-center gap-2 text-lg font-semibold text-foreground hover:text-primary transition-colors duration-200"
      aria-label="Go to homepage"
    >
      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
        <svg 
          className="w-5 h-5 text-primary-foreground" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M13 10V3L4 14h7v7l9-11h-7z" 
          />
        </svg>
      </div>
      <span className="hidden sm:block">Micro App</span>
    </Link>
  )

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/40 transition-all duration-300 ease-out",
        isScrolled 
          ? "bg-background/80 backdrop-blur-md shadow-sm" 
          : "bg-background/95 backdrop-blur-sm",
        className
      )}
      role="banner"
      aria-label="Main navigation"
    >
      <Container variant="page" className="py-4">
        <nav className="flex items-center justify-between" role="navigation" aria-label="Main navigation">
          {/* Logo */}
          <div className="flex items-center">
            {logo || defaultLogo}
          </div>

          {/* Desktop Navigation Links */}
          {showNavLinks && (
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm px-2 py-1"
                  {...(link.external && { target: "_blank", rel: "noopener noreferrer" })}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Desktop CTA Buttons & Theme Toggle */}
          <div className="hidden md:flex items-center gap-3">
            {showCTAs && ctaButtons.map((button) => (
              <Button
                key={button.href}
                variant={button.variant}
                size="sm"
                asChild
                className="transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]"
              >
                <Link
                  href={button.href}
                  {...(button.external && { target: "_blank", rel: "noopener noreferrer" })}
                >
                  {button.label}
                </Link>
              </Button>
            ))}
            
            {/* Theme Toggle */}
            <ThemeToggle 
              size="icon-sm" 
              variant="ghost"
              className="transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]"
            />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle 
              size="icon-sm" 
              variant="ghost"
              className="transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]"
            />
            <button
              type="button"
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle mobile menu"
            >
              <svg
                className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  isMobileMenuOpen && "rotate-90"
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden mt-4 pb-4 border-t border-border/40 pt-4"
            role="region"
            aria-label="Mobile navigation menu"
          >
            <div className="flex flex-col gap-4">
              {/* Mobile Navigation Links */}
              {showNavLinks && (
                <div className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm px-2 py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                      {...(link.external && { target: "_blank", rel: "noopener noreferrer" })}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}

              {/* Mobile CTA Buttons */}
              {showCTAs && (
                <div className="flex flex-col gap-2 pt-2">
                  {ctaButtons.map((button) => (
                    <Button
                      key={button.href}
                      variant={button.variant}
                      size="sm"
                      asChild
                      className="justify-start transition-all duration-200 ease-out"
                    >
                      <Link
                        href={button.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        {...(button.external && { target: "_blank", rel: "noopener noreferrer" })}
                      >
                        {button.label}
                      </Link>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Container>
    </header>
  )
}

export default NavigationHeader
