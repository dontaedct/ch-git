"use client";

import { Container } from "@/components/ui/container";
import { Grid, Col } from "@/components/ui/grid";
import { Surface, SurfaceCard, SurfaceElevated, SurfaceSubtle } from "@/components/ui/surface";
import { Button, CTAButton, SecondaryCTAButton } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-motion-preference";

export default function Home() {
  const reducedMotion = useReducedMotion();

  // Animation variants for staggered hero text - Optimized for performance and reduced motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reducedMotion ? 0 : 0.05, // No stagger in reduced motion
        delayChildren: reducedMotion ? 0 : 0.1, // No delay in reduced motion
        duration: reducedMotion ? 0.01 : 0.3, // Minimal duration in reduced motion
      },
    },
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: reducedMotion ? 0 : 10, // No movement in reduced motion
      scale: reducedMotion ? 1 : 0.98, // No scaling in reduced motion
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: reducedMotion ? 0.01 : 0.2, // Minimal duration in reduced motion
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <main role="main" aria-label="Homepage">
      {/* HT-002.3.2: Skip links for keyboard navigation and screen readers */}
      <a href="#hero-heading" className="skip-link">
        Skip to main content
      </a>
      <a href="#features-heading" className="skip-link">
        Skip to features
      </a>
      <a href="#cta-heading" className="skip-link">
        Skip to call to action
      </a>
      {/* HT-002.1.4: Linear-specific spacing patterns test */}
      <section className="py-section-sm bg-muted/30" aria-labelledby="spacing-test">
        <Container variant="page">
          <div className="text-center">
            <h2 id="spacing-test" className="text-2xl font-semibold mb-4">Linear Spacing Patterns</h2>
            <p className="text-muted-foreground mb-6">
              Testing Linear-specific spacing tokens: section-sm (4rem/64px)
            </p>
            <div className="space-y-section-sm">
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm">This section uses py-section-sm for vertical spacing</p>
              </div>
              <div className="bg-secondary/10 p-4 rounded-lg">
                <p className="text-sm">Space between sections uses space-y-section-sm</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* HT-001.4.1 - Hero Section Skeleton */}
      <section className="section" aria-labelledby="hero-heading">
        <Container variant="page" className="py-16">
          <motion.div 
            className="mx-auto max-w-4xl text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ 
              willChange: 'transform, opacity', // Performance hint
              transform: 'translateZ(0)' // Force hardware acceleration
            }}
          >
            {/* Badge - Linear-style subtle announcement */}
            <motion.div className="mb-8" variants={itemVariants}>
              <span 
                className="inline-flex items-center rounded-full bg-primary/5 px-3 py-1 text-sm font-medium text-primary ring-1 ring-primary/10"
                role="status"
                aria-label="New feature announcement"
              >
                ✨ Now Available
              </span>
            </motion.div>
            
            {/* Main Headline - Linear-style typography hierarchy */}
            <motion.h1 
              id="hero-heading"
              className="mb-8 text-5xl font-semibold leading-[1.1] tracking-[-0.02em] text-foreground sm:text-6xl lg:text-7xl xl:text-8xl"
              variants={itemVariants}
            >
              Build Better Products
              <span className="block text-primary font-medium">Faster Than Ever</span>
            </motion.h1>
            
            {/* Subcopy - Linear-style body text */}
            <motion.p 
              className="mx-auto mb-10 max-w-[42rem] text-xl leading-[1.6] text-muted-foreground sm:text-2xl"
              variants={itemVariants}
              aria-describedby="hero-heading"
            >
              Transform your ideas into production-ready applications with our comprehensive development platform. 
              Ship features faster, maintain quality, and scale effortlessly.
            </motion.p>
            
            {/* CTA Buttons - Linear-style spacing */}
            <motion.div 
              className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4"
              variants={itemVariants}
              role="group"
              aria-label="Primary actions"
            >
              <CTAButton 
                size="lg" 
                className="sm:w-auto"
                aria-describedby="hero-description"
                tabIndex={0}
              >
                Get Started Free
              </CTAButton>
              <SecondaryCTAButton 
                size="lg" 
                className="sm:w-auto"
                aria-describedby="hero-description"
                tabIndex={0}
              >
                View Documentation
              </SecondaryCTAButton>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* HT-001.4.2 - Hero art placeholder (no heavy assets) - Optimized for CLS */}
      <section className="section" aria-labelledby="product-preview-heading">
        <Container variant="page" className="py-8">
          <div className="mx-auto max-w-6xl">
            <SurfaceElevated 
              className="relative overflow-hidden"
              style={{ 
                height: '420px',
                minHeight: '420px', // Prevent CLS
                aspectRatio: '16/9', // Maintain aspect ratio
                contain: 'layout style paint' // Optimize rendering
              }}
              role="img"
              aria-label="Product preview placeholder"
            >
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5" aria-hidden="true" />
              
              {/* Grid pattern overlay */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}
                aria-hidden="true"
              />
              
              {/* Content placeholder */}
              <div className="relative z-10 flex h-full items-center justify-center">
                <div className="text-center">
                  {/* Product mockup placeholder - Optimized SVG */}
                  <div className="mb-6 mx-auto w-32 h-32 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center shadow-lg" aria-hidden="true">
                    <svg 
                      className="w-16 h-16 text-primary/60" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      style={{ willChange: 'transform' }} // Optimize for animations
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                      />
                    </svg>
                  </div>
                  
                  {/* Placeholder text */}
                  <h2 id="product-preview-heading" className="text-lg font-medium text-muted-foreground mb-2">
                    Product Preview
                  </h2>
                  <p className="text-sm text-muted-foreground/80 max-w-md">
                    Interactive demo and product screenshots will be displayed here
                  </p>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary/30" aria-hidden="true" />
              <div className="absolute bottom-6 left-6 w-1 h-1 rounded-full bg-primary/40" aria-hidden="true" />
              <div className="absolute top-1/3 left-4 w-1.5 h-1.5 rounded-full bg-primary/20" aria-hidden="true" />
            </SurfaceElevated>
          </div>
        </Container>
      </section>

      {/* HT-001.4.3 - Features section (3-4 cards) */}
      <section className="section" aria-labelledby="features-heading">
        <Container variant="page" className="py-16">
          <div className="mx-auto max-w-4xl text-center mb-12">
            <h2 id="features-heading" className="text-3xl font-bold leading-tight tracking-[-0.01em] text-foreground mb-4">
              Everything you need to build
            </h2>
            <p className="text-lg text-muted-foreground" aria-describedby="features-heading">
              Powerful tools and components designed to accelerate your development workflow
            </p>
          </div>
          
          <Grid cols={12} gap="lg" role="list" aria-label="Feature list">
            {/* Feature 1: Development Tools */}
            <Col span={12} sm={6} lg={3}>
              <SurfaceCard 
                className="h-full text-center group hover:shadow-[var(--shadow-elevation-2)] transition-all duration-200 ease-out hover:-translate-y-0.5" 
                role="listitem"
                interactive
                tabIndex={0}
                aria-describedby="feature-1-description"
                style={{ 
                  minHeight: '200px', // Prevent CLS
                  contain: 'layout style' // Optimize rendering
                }}
              >
                <div className="mb-4">
                  <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary/15 flex items-center justify-center mb-4 transition-colors duration-200" aria-hidden="true">
                    <svg 
                      className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-200" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      style={{ willChange: 'transform' }}
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" 
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
                    Development Tools
                  </h3>
                  <p id="feature-1-description" className="text-muted-foreground text-sm leading-relaxed">
                    Built-in TypeScript, ESLint, Prettier, and testing frameworks. 
                    Start coding immediately with zero configuration.
                  </p>
                </div>
              </SurfaceCard>
            </Col>

            {/* Feature 2: UI Components */}
            <Col span={12} sm={6} lg={3}>
              <SurfaceCard 
                className="h-full text-center group hover:shadow-[var(--shadow-elevation-2)] transition-all duration-200 ease-out hover:-translate-y-0.5" 
                role="listitem"
                interactive
                tabIndex={0}
                aria-describedby="feature-2-description"
                style={{ 
                  minHeight: '200px', // Prevent CLS
                  contain: 'layout style' // Optimize rendering
                }}
              >
                <div className="mb-4">
                  <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary/15 flex items-center justify-center mb-4 transition-colors duration-200" aria-hidden="true">
                    <svg 
                      className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-200" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      style={{ willChange: 'transform' }}
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" 
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
                    UI Components
                  </h3>
                  <p id="feature-2-description" className="text-muted-foreground text-sm leading-relaxed">
                    Beautiful, accessible components built with Radix UI and styled with Tailwind CSS. 
                    Consistent design system out of the box.
                  </p>
                </div>
              </SurfaceCard>
            </Col>

            {/* Feature 3: Database & Auth */}
            <Col span={12} sm={6} lg={3}>
              <SurfaceCard 
                className="h-full text-center group hover:shadow-[var(--shadow-elevation-2)] transition-all duration-200 ease-out hover:-translate-y-0.5" 
                role="listitem"
                interactive
                tabIndex={0}
                aria-describedby="feature-3-description"
                style={{ 
                  minHeight: '200px', // Prevent CLS
                  contain: 'layout style' // Optimize rendering
                }}
              >
                <div className="mb-4">
                  <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary/15 flex items-center justify-center mb-4 transition-colors duration-200" aria-hidden="true">
                    <svg 
                      className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-200" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      style={{ willChange: 'transform' }}
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" 
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
                    Database & Auth
                  </h3>
                  <p id="feature-3-description" className="text-muted-foreground text-sm leading-relaxed">
                    Integrated Supabase for database, authentication, and real-time features. 
                    Row-level security and API generation included.
                  </p>
                </div>
              </SurfaceCard>
            </Col>

            {/* Feature 4: Deployment */}
            <Col span={12} sm={6} lg={3}>
              <SurfaceCard 
                className="h-full text-center group hover:shadow-[var(--shadow-elevation-2)] transition-all duration-200 ease-out hover:-translate-y-0.5" 
                role="listitem"
                interactive
                tabIndex={0}
                aria-describedby="feature-4-description"
                style={{ 
                  minHeight: '200px', // Prevent CLS
                  contain: 'layout style' // Optimize rendering
                }}
              >
                <div className="mb-4">
                  <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary/15 flex items-center justify-center mb-4 transition-colors duration-200" aria-hidden="true">
                    <svg 
                      className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-200" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      style={{ willChange: 'transform' }}
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" 
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
                    One-Click Deploy
                  </h3>
                  <p id="feature-4-description" className="text-muted-foreground text-sm leading-relaxed">
                    Deploy to Vercel with zero configuration. Automatic builds, 
                    preview deployments, and global CDN for optimal performance.
                  </p>
                </div>
              </SurfaceCard>
            </Col>
          </Grid>
        </Container>
      </section>

      {/* HT-002.2.3 - Social proof section with Linear-style muted styling */}
      <section className="section" aria-labelledby="social-proof-heading">
        <Container variant="page" className="py-16">
          <div className="mx-auto max-w-5xl text-center">
            {/* Muted label with Linear-style typography */}
            <h2 id="social-proof-heading" className="mb-12 text-sm font-medium text-muted-foreground tracking-wide uppercase">
              Trusted by teams at
            </h2>
            
            {/* Logo grid with Linear-style spacing and muted presentation */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center" role="list" aria-label="Trusted companies">
              {/* Logo 1: Vercel - Linear-style muted */}
              <div className="flex items-center justify-center opacity-40 hover:opacity-60 transition-opacity duration-300" role="listitem">
                <svg 
                  className="h-5 w-auto text-muted-foreground grayscale" 
                  viewBox="0 0 115 20" 
                  fill="currentColor"
                  aria-label="Vercel logo"
                  style={{ willChange: 'opacity' }}
                >
                  <path d="M0 20L5.5 0h9l5.5 20h-9l-1-4H9l-1 4H0zm7.5-8h5l-2.5-6-2.5 6z"/>
                  <path d="M25 0h9v20h-9V0zm2 2v16h5V2h-5z"/>
                  <path d="M40 0h9v20h-9V0zm2 2v16h5V2h-5z"/>
                  <path d="M55 0h9v20h-9V0zm2 2v16h5V2h-5z"/>
                  <path d="M70 0h9v20h-9V0zm2 2v16h5V2h-5z"/>
                  <path d="M85 0h9v20h-9V0zm2 2v16h5V2h-5z"/>
                  <path d="M100 0h9v20h-9V0zm2 2v16h5V2h-5z"/>
                </svg>
              </div>
              
              {/* Logo 2: Linear - Linear-style muted */}
              <div className="flex items-center justify-center opacity-40 hover:opacity-60 transition-opacity duration-300" role="listitem">
                <svg 
                  className="h-5 w-auto text-muted-foreground grayscale" 
                  viewBox="0 0 100 20" 
                  fill="currentColor"
                  aria-label="Linear logo"
                  style={{ willChange: 'opacity' }}
                >
                  <path d="M0 0h100v20H0V0zm5 5v10h90V5H5z"/>
                  <path d="M10 8h80v4H10V8z"/>
                </svg>
              </div>
              
              {/* Logo 3: Supabase - Linear-style muted */}
              <div className="flex items-center justify-center opacity-40 hover:opacity-60 transition-opacity duration-300" role="listitem">
                <svg 
                  className="h-5 w-auto text-muted-foreground grayscale" 
                  viewBox="0 0 120 20" 
                  fill="currentColor"
                  aria-label="Supabase logo"
                  style={{ willChange: 'opacity' }}
                >
                  <path d="M0 0h120v20H0V0zm5 5v10h110V5H5z"/>
                  <path d="M15 8h90v4H15V8z"/>
                </svg>
              </div>
              
              {/* Logo 4: Next.js - Linear-style muted */}
              <div className="flex items-center justify-center opacity-40 hover:opacity-60 transition-opacity duration-300" role="listitem">
                <svg 
                  className="h-5 w-auto text-muted-foreground grayscale" 
                  viewBox="0 0 100 20" 
                  fill="currentColor"
                  aria-label="Next.js logo"
                  style={{ willChange: 'opacity' }}
                >
                  <path d="M0 0h100v20H0V0zm5 5v10h90V5H5z"/>
                  <path d="M10 8h80v4H10V8z"/>
                </svg>
              </div>
              
              {/* Logo 5: Tailwind - Linear-style muted */}
              <div className="flex items-center justify-center opacity-40 hover:opacity-60 transition-opacity duration-300" role="listitem">
                <svg 
                  className="h-5 w-auto text-muted-foreground grayscale" 
                  viewBox="0 0 120 20" 
                  fill="currentColor"
                  aria-label="Tailwind CSS logo"
                  style={{ willChange: 'opacity' }}
                >
                  <path d="M0 0h120v20H0V0zm5 5v10h110V5H5z"/>
                  <path d="M15 8h90v4H15V8z"/>
                </svg>
              </div>
              
              {/* Logo 6: TypeScript - Linear-style muted */}
              <div className="flex items-center justify-center opacity-40 hover:opacity-60 transition-opacity duration-300" role="listitem">
                <svg 
                  className="h-5 w-auto text-muted-foreground grayscale" 
                  viewBox="0 0 100 20" 
                  fill="currentColor"
                  aria-label="TypeScript logo"
                  style={{ willChange: 'opacity' }}
                >
                  <path d="M0 0h100v20H0V0zm5 5v10h90V5H5z"/>
                  <path d="M10 8h80v4H10V8z"/>
                </svg>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* HT-002.2.4 - CTA section with Linear-style condensed layout and proper spacing */}
      <section className="py-section bg-muted/20" aria-labelledby="cta-heading">
        <Container variant="page">
          <div className="mx-auto max-w-2xl text-center">
            {/* Headline - Linear-style typography hierarchy */}
            <h2 
              id="cta-heading" 
              className="mb-6 text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-foreground sm:text-4xl lg:text-5xl"
            >
              Ready to get started?
            </h2>
            
            {/* One sentence - Linear-style body text with proper spacing */}
            <p 
              className="mb-10 text-lg leading-[1.6] text-muted-foreground sm:text-xl" 
              aria-describedby="cta-heading"
            >
              Join thousands of developers building the future with our platform.
            </p>
            
            {/* Primary button - Linear-style CTA with proper spacing */}
            <CTAButton 
              size="lg" 
              className="sm:w-auto"
              aria-describedby="cta-heading"
              tabIndex={0}
            >
              Start Building Today
            </CTAButton>
          </div>
        </Container>
      </section>
      
      {/* HT-001.3.4 Verification: Surface component with Linear/Vercel-style appearance */}
      <Container variant="page" className="py-16">
        <div className="mt-12">
          <h2 className="mb-6 text-center text-xl font-medium">Surface Component Test</h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Default Surface */}
            <Surface>
              <h3 className="mb-2 font-semibold">Default Surface</h3>
              <p className="text-sm text-muted-foreground">
                This is the default surface variant with subtle borders and background.
              </p>
            </Surface>
            
            {/* Elevated Surface */}
            <SurfaceElevated>
              <h3 className="mb-2 font-semibold">Elevated Surface</h3>
              <p className="text-sm text-muted-foreground">
                This surface has more elevation and stronger shadows for emphasis.
              </p>
            </SurfaceElevated>
            
            {/* Card Surface */}
            <SurfaceCard>
              <h3 className="mb-2 font-semibold">Card Surface</h3>
              <p className="text-sm text-muted-foreground">
                This surface mimics a traditional card with solid background.
              </p>
            </SurfaceCard>
            
            {/* Subtle Surface */}
            <SurfaceSubtle>
              <h3 className="mb-2 font-semibold">Subtle Surface</h3>
              <p className="text-sm text-muted-foreground">
                This surface has minimal styling for background content.
              </p>
            </SurfaceSubtle>
            
            {/* Ghost Surface */}
            <Surface variant="ghost" interactive>
              <h3 className="mb-2 font-semibold">Ghost Surface</h3>
              <p className="text-sm text-muted-foreground">
                This surface is nearly transparent with hover effects.
              </p>
            </Surface>
            
            {/* Interactive Surface */}
            <Surface variant="default" interactive>
              <h3 className="mb-2 font-semibold">Interactive Surface</h3>
              <p className="text-sm text-muted-foreground">
                This surface has interactive hover and scale effects.
              </p>
            </Surface>
          </div>
          
          {/* Size variations */}
          <div className="mt-8">
            <h3 className="mb-4 text-center text-lg font-medium">Size Variations</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Surface size="sm">
                <h4 className="mb-1 font-medium">Small</h4>
                <p className="text-xs text-muted-foreground">Compact padding</p>
              </Surface>
              <Surface size="default">
                <h4 className="mb-1 font-medium">Default</h4>
                <p className="text-sm text-muted-foreground">Standard padding</p>
              </Surface>
              <Surface size="lg">
                <h4 className="mb-1 font-medium">Large</h4>
                <p className="text-sm text-muted-foreground">Generous padding</p>
              </Surface>
            </div>
          </div>
          
          {/* Rounded variations */}
          <div className="mt-8">
            <h3 className="mb-4 text-center text-lg font-medium">Rounded Variations</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Surface rounded="sm">
                <h4 className="mb-1 font-medium">Small Radius</h4>
                <p className="text-sm text-muted-foreground">Subtle rounding</p>
              </Surface>
              <Surface rounded="default">
                <h4 className="mb-1 font-medium">Default Radius</h4>
                <p className="text-sm text-muted-foreground">Standard rounding</p>
              </Surface>
              <Surface rounded="xl">
                <h4 className="mb-1 font-medium">Extra Large</h4>
                <p className="text-sm text-muted-foreground">Pronounced rounding</p>
              </Surface>
            </div>
          </div>
        </div>
        
        {/* HT-001.3.3 Verification: Two Col span={6} side-by-side */}
        <div className="mt-8">
          <h2 className="mb-4 text-center text-xl font-medium">Grid System Test</h2>
          
          {/* Basic 2-column layout */}
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Basic 2-Column Layout</h3>
            <Grid cols={12} gap="md">
              <Col span={6}>
                <div className="rounded-lg border border-border/50 bg-background/50 p-4 text-center">
                  Left Column (span=6)
                </div>
              </Col>
              <Col span={6}>
                <div className="rounded-lg border border-border/50 bg-background/50 p-4 text-center">
                  Right Column (span=6)
                </div>
              </Col>
            </Grid>
          </div>

          {/* Responsive 3-column layout */}
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Responsive 3-Column Layout</h3>
            <Grid cols={12} gap="md">
              <Col span={12} sm={6} md={4}>
                <div className="rounded-lg border border-border/50 bg-background/50 p-4 text-center">
                  Column 1 (12/6/4)
                </div>
              </Col>
              <Col span={12} sm={6} md={4}>
                <div className="rounded-lg border border-border/50 bg-background/50 p-4 text-center">
                  Column 2 (12/6/4)
                </div>
              </Col>
              <Col span={12} sm={12} md={4}>
                <div className="rounded-lg border border-border/50 bg-background/50 p-4 text-center">
                  Column 3 (12/12/4)
                </div>
              </Col>
            </Grid>
          </div>

          {/* Offset example */}
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Column with Offset</h3>
            <Grid cols={12} gap="md">
              <Col span={4} offset={2}>
                <div className="rounded-lg border border-border/50 bg-background/50 p-4 text-center">
                  Offset Column (span=4, offset=2)
                </div>
              </Col>
            </Grid>
          </div>

          {/* Different grid configurations */}
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Different Grid Configurations</h3>
            
            {/* 6-column grid */}
            <div className="mb-4">
              <h4 className="mb-2 text-xs font-medium text-muted-foreground">6-Column Grid</h4>
              <Grid cols={6} gap="sm">
                <Col span={2}>
                  <div className="rounded border border-border/30 bg-background/30 p-2 text-center text-xs">
                    Col 1
                  </div>
                </Col>
                <Col span={2}>
                  <div className="rounded border border-border/30 bg-background/30 p-2 text-center text-xs">
                    Col 2
                  </div>
                </Col>
                <Col span={2}>
                  <div className="rounded border border-border/30 bg-background/30 p-2 text-center text-xs">
                    Col 3
                  </div>
                </Col>
              </Grid>
            </div>

            {/* 4-column grid */}
            <div className="mb-4">
              <h4 className="mb-2 text-xs font-medium text-muted-foreground">4-Column Grid</h4>
              <Grid cols={4} gap="lg">
                <Col span={1}>
                  <div className="rounded border border-border/30 bg-background/30 p-2 text-center text-xs">
                    1
                  </div>
                </Col>
                <Col span={1}>
                  <div className="rounded border border-border/30 bg-background/30 p-2 text-center text-xs">
                    2
                  </div>
                </Col>
                <Col span={1}>
                  <div className="rounded border border-border/30 bg-background/30 p-2 text-center text-xs">
                    3
                  </div>
                </Col>
                <Col span={1}>
                  <div className="rounded border border-border/30 bg-background/30 p-2 text-center text-xs">
                    4
                  </div>
                </Col>
              </Grid>
            </div>
          </div>

          {/* Gap variations */}
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Gap Variations</h3>
            
            <div className="mb-4">
              <h4 className="mb-2 text-xs font-medium text-muted-foreground">Small Gap</h4>
              <Grid cols={12} gap="sm">
                <Col span={4}>
                  <div className="rounded border border-border/30 bg-background/30 p-2 text-center text-xs">
                    Small Gap
                  </div>
                </Col>
                <Col span={4}>
                  <div className="rounded border border-border/30 bg-background/30 p-2 text-center text-xs">
                    Small Gap
                  </div>
                </Col>
                <Col span={4}>
                  <div className="rounded border border-border/30 bg-background/30 p-2 text-center text-xs">
                    Small Gap
                  </div>
                </Col>
              </Grid>
            </div>

            <div className="mb-4">
              <h4 className="mb-2 text-xs font-medium text-muted-foreground">Large Gap</h4>
              <Grid cols={12} gap="lg">
                <Col span={4}>
                  <div className="rounded border border-border/30 bg-background/30 p-2 text-center text-xs">
                    Large Gap
                  </div>
                </Col>
                <Col span={4}>
                  <div className="rounded border border-border/30 bg-background/30 p-2 text-center text-xs">
                    Large Gap
                  </div>
                </Col>
                <Col span={4}>
                  <div className="rounded border border-border/30 bg-background/30 p-2 text-center text-xs">
                    Large Gap
                  </div>
                </Col>
              </Grid>
            </div>
          </div>
        </div>
      </Container>

      {/* HT-002.2.6 - Enhanced footer with multi-column layout */}
      <footer className="py-section-sm bg-muted/30 border-t border-border/50" role="contentinfo" aria-label="Site footer">
        <Container variant="page">
          <div className="mx-auto max-w-6xl">
            {/* Main footer content */}
            <div className="mb-8">
              <Grid cols={12} gap="lg">
                {/* Company/Brand column */}
                <Col span={12} md={3}>
                  <div className="mb-6 md:mb-0">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Micro App Platform
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      Build better products faster than ever with our comprehensive development platform.
                    </p>
                    {/* Social links placeholder */}
                    <div className="flex gap-3" role="list" aria-label="Social media links">
                      <a 
                        href="#" 
                        className="text-muted-foreground hover:text-foreground transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                        aria-label="Follow us on Twitter"
                        tabIndex={0}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </a>
                      <a 
                        href="#" 
                        className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                        aria-label="Follow us on GitHub"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </a>
                      <a 
                        href="#" 
                        className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                        aria-label="Follow us on LinkedIn"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </Col>

                {/* Product column */}
                <Col span={6} md={2}>
                  <div className="mb-6 md:mb-0">
                    <h4 className="text-sm font-semibold text-foreground mb-4">Product</h4>
                    <nav role="list" aria-label="Product links">
                      <ul className="space-y-3">
                        <li>
                          <a 
                            href="#" 
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                          >
                            Features
                          </a>
                        </li>
                        <li>
                          <a 
                            href="#" 
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                          >
                            Pricing
                          </a>
                        </li>
                        <li>
                          <a 
                            href="#" 
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                          >
                            Documentation
                          </a>
                        </li>
                        <li>
                          <a 
                            href="#" 
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                          >
                            API Reference
                          </a>
                        </li>
                        <li>
                          <a 
                            href="#" 
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                          >
                            Changelog
                          </a>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </Col>

                {/* Resources column */}
                <Col span={6} md={2}>
                  <div className="mb-6 md:mb-0">
                    <h4 className="text-sm font-semibold text-foreground mb-4">Resources</h4>
                    <nav role="list" aria-label="Resources links">
                      <ul className="space-y-3">
                        <li>
                          <a 
                            href="#" 
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                          >
                            Blog
                          </a>
                        </li>
                        <li>
                          <a 
                            href="#" 
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                          >
                            Guides
                          </a>
                        </li>
                        <li>
                          <a 
                            href="#" 
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                          >
                            Examples
                          </a>
                        </li>
                        <li>
                          <a 
                            href="#" 
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                          >
                            Community
                          </a>
                        </li>
                        <li>
                          <a 
                            href="#" 
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                          >
                            Support
                          </a>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </Col>

                {/* Company column */}
                <Col span={6} md={2}>
                  <div className="mb-6 md:mb-0">
                    <h4 className="text-sm font-semibold text-foreground mb-4">Company</h4>
                    <nav role="list" aria-label="Company links">
                      <ul className="space-y-3">
                        <li>
                          <a 
                            href="#" 
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                          >
                            About
                          </a>
                        </li>
                        <li>
                          <a 
                            href="#" 
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                          >
                            Careers
                          </a>
                        </li>
                        <li>
                          <a 
                            href="#" 
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                          >
                            Contact
                          </a>
                        </li>
                        <li>
                          <a 
                            href="#" 
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                          >
                            Press
                          </a>
                        </li>
                        <li>
                          <a 
                            href="#" 
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                          >
                            Partners
                          </a>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </Col>

                {/* Legal column */}
                <Col span={6} md={3}>
                  <div className="mb-6 md:mb-0">
                    <h4 className="text-sm font-semibold text-foreground mb-4">Legal</h4>
                    <nav role="list" aria-label="Legal links">
                      <ul className="space-y-3">
                        <li>
                          <a 
                            href="#" 
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                          >
                            Privacy Policy
                          </a>
                        </li>
                        <li>
                          <a 
                            href="#" 
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                          >
                            Terms of Service
                          </a>
                        </li>
                        <li>
                          <a 
                            href="#" 
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                          >
                            Cookie Policy
                          </a>
                        </li>
                        <li>
                          <a 
                            href="#" 
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                          >
                            Security
                          </a>
                        </li>
                        <li>
                          <a 
                            href="#" 
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                          >
                            Compliance
                          </a>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </Col>
              </Grid>
            </div>

            {/* Footer bottom */}
            <div className="pt-6 border-t border-border/30">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  © 2025 Micro App Platform. All rights reserved.
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span>Made with ❤️ for developers</span>
                  <div className="flex items-center gap-2">
                    <span>Status:</span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full" aria-hidden="true"></span>
                      <span>All systems operational</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </footer>
    </main>
  );
}