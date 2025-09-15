/**
 * @fileoverview HT-006 Sandbox Layout
 * @module app/_sandbox/layout
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: HT-006 Phase 1 - Design Tokens & Theme Provider
 * Purpose: Isolated development environment for token-driven design system
 * Safety: Complete isolation from production with visual distinction
 * Status: Phase 1 implementation - DTCG tokens + brand switching
 */

import { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { TokensProvider } from '@/components-sandbox/providers/TokensProvider'
import UniversalSandboxHeader from '@/components/sandbox/UniversalSandboxHeader'
import '@/styles/tokens.css'
import '@/styles/mono-theme.css'

export const metadata: Metadata = {
  title: 'HT-006 Design System Sandbox',
  description: 'Token-driven design system development environment',
  robots: 'noindex, nofollow' // Prevent search engine indexing
}

interface SandboxLayoutProps {
  children: React.ReactNode
}

/**
 * Sandbox Layout Component
 * 
 * Provides isolated development environment for HT-006 with:
 * - Visual distinction from production (TEST AREA banner)
 * - Sandbox-specific navigation
 * - Development warnings and safety notices
 * - Import isolation boundaries
 */
export default function SandboxLayout({ children }: SandboxLayoutProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <TokensProvider defaultBrand="default">
        <div className="min-h-screen bg-background transition-colors duration-300">
          {/* Universal Sandbox Header */}
          <UniversalSandboxHeader />

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>

          {/* Sandbox Footer */}
          <footer className="border-t border-border bg-muted/50 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground gap-4">
                <div className="text-center sm:text-left">
                  <p><strong className="text-foreground">HT-007 Phase:</strong> {getCurrentPhase()}</p>
                  <p><strong className="text-foreground">Last Updated:</strong> {new Date().toISOString().split('T')[0]}</p>
                </div>
                <div className="text-center sm:text-right">
                  <p><strong className="text-foreground">Safety Level:</strong> <span className="text-green-600 dark:text-green-400">Sandbox Isolated</span></p>
                  <p><strong className="text-foreground">Production Impact:</strong> <span className="text-green-600 dark:text-green-400">None</span></p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </TokensProvider>
    </ThemeProvider>
  )
}

/**
 * Get current HT-006 phase for display
 */
function getCurrentPhase(): string {
  // Updated to reflect current HT-006 progress
  return "Phase 5 - Visual Regression Safety (✅ COMPLETED)"
}
