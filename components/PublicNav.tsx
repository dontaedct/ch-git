'use client'

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { BrandWithLogo } from "@/components/branding/DynamicBrandName"

export function PublicNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [])

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

  return (
    <>
      <header className="w-full border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <BrandWithLogo
              logoSize="sm"
              brandVariant="short"
              brandClassName="text-lg sm:text-xl font-semibold text-gray-900"
              className="gap-2 sm:gap-3"
            />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/intake"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
            >
              Get Started
            </Link>
            <Link
              href="/client-portal"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
            >
              Client Portal
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-gray-700" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white">
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <Link 
                href="/" 
                className="flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BrandWithLogo
                  logoSize="sm"
                  brandVariant="short"
                  brandClassName="text-lg font-semibold text-gray-900"
                  className="gap-2"
                />
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                aria-label="Close mobile menu"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Mobile Navigation Links */}
            <nav className="flex-1 px-4 py-6">
              <div className="space-y-4">
                <Link
                  href="/intake"
                  className="block text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
                <Link
                  href="/client-portal"
                  className="block text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Client Portal
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
