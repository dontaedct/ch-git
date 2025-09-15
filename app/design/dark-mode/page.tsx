/**
 * @fileoverview HT-008.5.6: Dark Mode Demonstration Page
 * @module app/design/dark-mode/page
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.5.6 - Implement complete dark mode support
 * Focus: Vercel/Apply-level dark mode demonstration
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (user experience and accessibility)
 */

import React from "react"
import {
  DisplayLG,
  HeadingXL,
  HeadingLG,
  HeadingMD,
  BodyMD,
  BodySM,
  LabelMD,
  CaptionMD,
  CodeMD,
  Lead,
  Muted,
  Blockquote,
  List,
  ListItem,
  InlineCode,
  TypographyContainer,
} from "@/components/ui/typography"
import {
  Padding,
  PaddingX,
  PaddingY,
  Margin,
  MarginY,
  Space,
  SpaceY,
} from "@/components/ui/spacing"
import { DarkModeToggle } from "@/lib/dark-mode/provider"

// HT-008.5.6: Enhanced Dark Mode Demonstration
// Comprehensive showcase of our complete dark mode system

export default function DarkModePage() {
  return (
    <div className="min-h-screen bg-theme theme-transition">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <DisplayLG className="text-theme">Dark Mode System</DisplayLG>
            <DarkModeToggle variant="button" size="lg" />
          </div>
          <Lead className="text-theme-secondary mb-6">
            Comprehensive demonstration of our complete dark mode support system,
            featuring theme-aware components, utilities, and seamless transitions.
          </Lead>
          <BodyMD className="text-theme-muted">
            This page showcases all dark mode features implemented as part of HT-008.5.6,
            including theme-aware utilities, components, and accessibility features.
          </BodyMD>
        </div>

        {/* Theme Toggle Variants */}
        <section className="mb-16">
          <HeadingXL className="text-theme mb-8">Theme Toggle Variants</HeadingXL>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-theme rounded-lg p-6">
              <HeadingMD className="text-theme mb-4">Button Style</HeadingMD>
              <DarkModeToggle variant="button" size="md" />
              <BodySM className="text-theme-secondary mt-2">
                Full button with icon and label
              </BodySM>
            </div>
            
            <div className="card-theme rounded-lg p-6">
              <HeadingMD className="text-theme mb-4">Switch Style</HeadingMD>
              <DarkModeToggle variant="switch" size="md" />
              <BodySM className="text-theme-secondary mt-2">
                Toggle switch for compact spaces
              </BodySM>
            </div>
            
            <div className="card-theme rounded-lg p-6">
              <HeadingMD className="text-theme mb-4">Icon Only</HeadingMD>
              <DarkModeToggle variant="icon" size="md" showLabel={false} />
              <BodySM className="text-theme-secondary mt-2">
                Icon-only for minimal interfaces
              </BodySM>
            </div>
          </div>
        </section>

        {/* Theme-Aware Components */}
        <section className="mb-16">
          <HeadingXL className="text-theme mb-8">Theme-Aware Components</HeadingXL>
          
          {/* Typography Examples */}
          <div className="mb-12">
            <HeadingLG className="text-theme mb-6">Typography</HeadingLG>
            <div className="card-theme rounded-lg p-6">
              <TypographyContainer spacing="normal">
                <DisplayLG className="text-theme">Display Large Heading</DisplayLG>
                <HeadingXL className="text-theme">Heading Extra Large</HeadingXL>
                <HeadingLG className="text-theme">Heading Large</HeadingLG>
                <BodyMD className="text-theme-secondary">
                  This is body text that adapts to the current theme. It provides excellent
                  readability in both light and dark modes with proper contrast ratios.
                </BodyMD>
                <BodySM className="text-theme-muted">
                  Secondary text that maintains accessibility standards across themes.
                </BodySM>
                <CaptionMD className="text-theme-muted">
                  Caption text for metadata and additional information.
                </CaptionMD>
                <div className="flex items-center gap-2">
                  <LabelMD className="text-theme">Label:</LabelMD>
                  <CodeMD className="bg-theme-elevated text-theme border-theme px-2 py-1 rounded">
                    theme-aware code
                  </CodeMD>
                </div>
              </TypographyContainer>
            </div>
          </div>

          {/* Interactive Elements */}
          <div className="mb-12">
            <HeadingLG className="text-theme mb-6">Interactive Elements</HeadingLG>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card-theme rounded-lg p-6">
                <HeadingMD className="text-theme mb-4">Buttons</HeadingMD>
                <SpaceY size="3">
                  <button className="btn-theme-primary px-4 py-2 rounded-lg font-medium theme-transition">
                    Primary Button
                  </button>
                  <button className="btn-theme-secondary px-4 py-2 rounded-lg font-medium theme-transition">
                    Secondary Button
                  </button>
                  <button className="px-4 py-2 rounded-lg font-medium text-theme-primary hover-bg-theme-primary hover:text-theme-inverse theme-transition">
                    Text Button
                  </button>
                </SpaceY>
              </div>
              
              <div className="card-theme rounded-lg p-6">
                <HeadingMD className="text-theme mb-4">Form Elements</HeadingMD>
                <SpaceY size="3">
                  <input
                    type="text"
                    placeholder="Theme-aware input"
                    className="input-theme w-full px-3 py-2 rounded-lg theme-transition"
                  />
                  <select className="input-theme w-full px-3 py-2 rounded-lg theme-transition">
                    <option>Select option</option>
                    <option>Theme-aware select</option>
                  </select>
                  <textarea
                    placeholder="Theme-aware textarea"
                    className="input-theme w-full px-3 py-2 rounded-lg theme-transition"
                    rows={3}
                  />
                </SpaceY>
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="mb-12">
            <HeadingLG className="text-theme mb-6">Status Indicators</HeadingLG>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="status-success rounded-lg p-4 border">
                <HeadingMD className="mb-2">Success</HeadingMD>
                <BodySM>Operation completed successfully</BodySM>
              </div>
              <div className="status-warning rounded-lg p-4 border">
                <HeadingMD className="mb-2">Warning</HeadingMD>
                <BodySM>Please review this information</BodySM>
              </div>
              <div className="status-error rounded-lg p-4 border">
                <HeadingMD className="mb-2">Error</HeadingMD>
                <BodySM>Something went wrong</BodySM>
              </div>
              <div className="status-info rounded-lg p-4 border">
                <HeadingMD className="mb-2">Info</HeadingMD>
                <BodySM>Additional information available</BodySM>
              </div>
            </div>
          </div>
        </section>

        {/* Theme-Aware Utilities */}
        <section className="mb-16">
          <HeadingXL className="text-theme mb-8">Theme-Aware Utilities</HeadingXL>
          
          {/* Background Utilities */}
          <div className="mb-12">
            <HeadingLG className="text-theme mb-6">Background Utilities</HeadingLG>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-theme rounded-lg p-4 border-theme border">
                <BodySM className="text-theme">bg-theme</BodySM>
              </div>
              <div className="bg-theme-surface rounded-lg p-4 border-theme border">
                <BodySM className="text-theme">bg-theme-surface</BodySM>
              </div>
              <div className="bg-theme-elevated rounded-lg p-4 border-theme border">
                <BodySM className="text-theme">bg-theme-elevated</BodySM>
              </div>
              <div className="bg-theme-overlay rounded-lg p-4 border-theme border">
                <BodySM className="text-theme">bg-theme-overlay</BodySM>
              </div>
            </div>
          </div>

          {/* Text Utilities */}
          <div className="mb-12">
            <HeadingLG className="text-theme mb-6">Text Utilities</HeadingLG>
            <div className="card-theme rounded-lg p-6">
              <SpaceY size="2">
                <div className="text-theme">text-theme - Primary text color</div>
                <div className="text-theme-secondary">text-theme-secondary - Secondary text color</div>
                <div className="text-theme-muted">text-theme-muted - Muted text color</div>
                <div className="text-theme-inverse bg-theme p-2 rounded">text-theme-inverse - Inverse text color</div>
              </SpaceY>
            </div>
          </div>

          {/* Border Utilities */}
          <div className="mb-12">
            <HeadingLG className="text-theme mb-6">Border Utilities</HeadingLG>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-theme-surface rounded-lg p-4 border-theme border-2">
                <BodySM className="text-theme">border-theme</BodySM>
              </div>
              <div className="bg-theme-surface rounded-lg p-4 border-theme-subtle border-2">
                <BodySM className="text-theme">border-theme-subtle</BodySM>
              </div>
              <div className="bg-theme-surface rounded-lg p-4 border-theme-strong border-2">
                <BodySM className="text-theme">border-theme-strong</BodySM>
              </div>
            </div>
          </div>

          {/* Shadow Utilities */}
          <div className="mb-12">
            <HeadingLG className="text-theme mb-6">Shadow Utilities</HeadingLG>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-theme-surface rounded-lg p-4 shadow-theme">
                <BodySM className="text-theme">shadow-theme</BodySM>
              </div>
              <div className="bg-theme-surface rounded-lg p-4 shadow-theme-elevated">
                <BodySM className="text-theme">shadow-theme-elevated</BodySM>
              </div>
              <div className="bg-theme-surface rounded-lg p-4 shadow-theme-strong">
                <BodySM className="text-theme">shadow-theme-strong</BodySM>
              </div>
            </div>
          </div>

          {/* Glass Effect */}
          <div className="mb-12">
            <HeadingLG className="text-theme mb-6">Glass Effect</HeadingLG>
            <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8">
              <div className="glass-theme rounded-lg p-6">
                <HeadingMD className="text-theme mb-2">Glass Card</HeadingMD>
                <BodySM className="text-theme-secondary">
                  This card uses the glass-theme utility for a modern glassmorphism effect
                  that adapts to both light and dark themes.
                </BodySM>
              </div>
            </div>
          </div>

          {/* Gradient Utilities */}
          <div className="mb-12">
            <HeadingLG className="text-theme mb-6">Gradient Utilities</HeadingLG>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="gradient-theme-primary rounded-lg p-6">
                <HeadingMD className="text-theme-inverse mb-2">Primary Gradient</HeadingMD>
                <BodySM className="text-theme-inverse">
                  gradient-theme-primary utility
                </BodySM>
              </div>
              <div className="gradient-theme-surface rounded-lg p-6 border-theme border">
                <HeadingMD className="text-theme mb-2">Surface Gradient</HeadingMD>
                <BodySM className="text-theme">
                  gradient-theme-surface utility
                </BodySM>
              </div>
            </div>
          </div>
        </section>

        {/* Theme Transitions */}
        <section className="mb-16">
          <HeadingXL className="text-theme mb-8">Theme Transitions</HeadingXL>
          
          <div className="card-theme rounded-lg p-6">
            <HeadingLG className="text-theme mb-4">Smooth Theme Transitions</HeadingLG>
            <BodyMD className="text-theme-secondary mb-6">
              All theme-aware elements include smooth transitions when switching between
              light and dark modes. This provides a polished user experience.
            </BodyMD>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-theme-surface rounded-lg p-4 theme-transition border-theme border">
                <BodySM className="text-theme">theme-transition</BodySM>
              </div>
              <div className="bg-theme-surface rounded-lg p-4 theme-transition-colors border-theme border">
                <BodySM className="text-theme">theme-transition-colors</BodySM>
              </div>
              <div className="bg-theme-surface rounded-lg p-4 theme-transition-shadow border-theme border">
                <BodySM className="text-theme">theme-transition-shadow</BodySM>
              </div>
            </div>
          </div>
        </section>

        {/* Accessibility Features */}
        <section className="mb-16">
          <HeadingXL className="text-theme mb-8">Accessibility Features</HeadingXL>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card-theme rounded-lg p-6">
              <HeadingLG className="text-theme mb-4">Focus Management</HeadingLG>
              <BodyMD className="text-theme-secondary mb-4">
                All interactive elements include proper focus indicators that adapt to the current theme.
              </BodyMD>
              <SpaceY size="3">
                <button className="btn-theme-primary px-4 py-2 rounded-lg font-medium focus-ring-theme">
                  Focus Ring Theme
                </button>
                <button className="btn-theme-secondary px-4 py-2 rounded-lg font-medium focus-ring-theme-inset">
                  Focus Ring Inset
                </button>
              </SpaceY>
            </div>
            
            <div className="card-theme rounded-lg p-6">
              <HeadingLG className="text-theme mb-4">Contrast Ratios</HeadingLG>
              <BodyMD className="text-theme-secondary mb-4">
                All text and background combinations meet WCAG AA contrast requirements
                in both light and dark modes.
              </BodyMD>
              <List>
                <ListItem className="text-theme">Primary text: 4.5:1+ contrast ratio</ListItem>
                <ListItem className="text-theme-secondary">Secondary text: 3:1+ contrast ratio</ListItem>
                <ListItem className="text-theme-muted">Muted text: 3:1+ contrast ratio</ListItem>
              </List>
            </div>
          </div>
        </section>

        {/* Usage Guidelines */}
        <section className="mb-16">
          <HeadingXL className="text-theme mb-8">Usage Guidelines</HeadingXL>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <HeadingLG className="text-theme mb-4">Best Practices</HeadingLG>
              <List>
                <ListItem className="text-theme">Use theme-aware utilities instead of hardcoded colors</ListItem>
                <ListItem className="text-theme">Always include theme transitions for smooth switching</ListItem>
                <ListItem className="text-theme">Test components in both light and dark modes</ListItem>
                <ListItem className="text-theme">Ensure proper contrast ratios for accessibility</ListItem>
                <ListItem className="text-theme">Use semantic color names for better maintainability</ListItem>
              </List>
            </div>
            
            <div>
              <HeadingLG className="text-theme mb-4">Implementation Tips</HeadingLG>
              <List>
                <ListItem className="text-theme">Wrap your app with DarkModeProvider</ListItem>
                <ListItem className="text-theme">Use useDarkMode hook for theme state</ListItem>
                <ListItem className="text-theme">Leverage CSS variables for dynamic theming</ListItem>
                <ListItem className="text-theme">Include theme toggle in your navigation</ListItem>
                <ListItem className="text-theme">Test with system theme preference</ListItem>
              </List>
            </div>
          </div>
        </section>

        {/* Code Examples */}
        <section className="mb-16">
          <HeadingXL className="text-theme mb-8">Code Examples</HeadingXL>
          
          <div className="card-theme rounded-lg p-6">
            <HeadingLG className="text-theme mb-4">Using Theme-Aware Utilities</HeadingLG>
            <div className="bg-theme-elevated rounded-lg p-4 border-theme border">
              <CodeMD className="text-theme">
{`<div className="bg-theme-surface text-theme border-theme border rounded-lg p-4 theme-transition">
  <h2 className="text-theme">Theme-Aware Component</h2>
  <p className="text-theme-secondary">This component adapts to both themes</p>
</div>`}
              </CodeMD>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t border-theme pt-8">
          <BodySM className="text-theme-muted text-center">
            HT-008.5.6: Complete Dark Mode Support Implementation Complete
          </BodySM>
        </div>
      </div>
    </div>
  )
}
