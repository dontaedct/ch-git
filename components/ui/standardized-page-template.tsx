/**
 * @fileoverview Standardized Page Template Component
 * @module components/ui/standardized-page-template
 * @version 1.0.0
 *
 * Implementation of HT-034.7.2: Component Standardization & Shared Pattern Implementation
 * Provides consistent page layout patterns across all admin interfaces
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdminCard, MetricCard, FeatureCard } from '@/components/ui/admin-card';
import { cn, spacing, typography, animationVariants } from '@/lib/ui/shared-patterns';
import { motion } from 'framer-motion';

export interface StandardizedPageProps {
  title: string;
  description: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  sidebar?: React.ReactNode;
}

/**
 * Standardized page layout with consistent header, spacing, and accessibility
 */
export function StandardizedPageTemplate({
  title,
  description,
  children,
  actions,
  breadcrumbs,
  sidebar
}: StandardizedPageProps) {
  return (
    <motion.div
      className="min-h-screen"
      initial="hidden"
      animate="visible"
      variants={animationVariants.container}
    >
      {breadcrumbs && (
        <div className="mb-4">
          {breadcrumbs}
        </div>
      )}

      <div className="flex gap-6">
        {sidebar && (
          <aside className="w-64 flex-shrink-0">
            {sidebar}
          </aside>
        )}

        <main className="flex-1">
          <div className={spacing.section}>
            {/* Page Header */}
            <motion.div variants={animationVariants.item} className="mb-8">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className={typography.pageTitle}>{title}</h1>
                  <p className={typography.pageDescription}>{description}</p>
                </div>
                {actions && (
                  <div className={spacing.buttonGroup}>
                    {actions}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Page Content */}
            <motion.div variants={animationVariants.item}>
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </motion.div>
  );
}

/**
 * Standardized card grid layout
 */
export interface CardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function StandardizedCardGrid({
  children,
  columns = 3,
  className
}: CardGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={cn('grid gap-6', gridCols[columns], className)}>
      {children}
    </div>
  );
}

/**
 * Standardized metrics dashboard
 */
export interface MetricsDashboardProps {
  metrics: Array<{
    title: string;
    value: string | number;
    description?: string;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon?: React.ReactNode;
  }>;
}

export function StandardizedMetricsDashboard({ metrics }: MetricsDashboardProps) {
  return (
    <StandardizedCardGrid columns={4}>
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </StandardizedCardGrid>
  );
}

/**
 * Standardized feature grid
 */
export interface FeatureGridProps {
  features: Array<{
    title: string;
    description: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
    status?: 'active' | 'inactive' | 'pending';
  }>;
}

export function StandardizedFeatureGrid({ features }: FeatureGridProps) {
  return (
    <StandardizedCardGrid>
      {features.map((feature, index) => (
        <FeatureCard key={index} {...feature} />
      ))}
    </StandardizedCardGrid>
  );
}

/**
 * Standardized section with consistent spacing and typography
 */
export interface StandardizedSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function StandardizedSection({
  title,
  description,
  children,
  actions,
  className
}: StandardizedSectionProps) {
  return (
    <motion.section
      variants={animationVariants.item}
      className={cn(spacing.section, className)}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className={typography.sectionTitle}>{title}</h2>
          {description && (
            <p className={typography.pageDescription}>{description}</p>
          )}
        </div>
        {actions && (
          <div className={spacing.buttonGroup}>
            {actions}
          </div>
        )}
      </div>
      {children}
    </motion.section>
  );
}

/**
 * Example usage component showing standardized patterns
 */
export function StandardizedPageExample() {
  const metrics = [
    { title: 'Total Users', value: '1,234', change: '+12%', changeType: 'positive' as const },
    { title: 'Active Sessions', value: '456', change: '+5%', changeType: 'positive' as const },
    { title: 'Revenue', value: '$12,345', change: '+8%', changeType: 'positive' as const },
    { title: 'Conversion', value: '3.2%', change: '-0.1%', changeType: 'negative' as const }
  ];

  const features = [
    {
      title: 'Analytics Dashboard',
      description: 'Real-time insights and metrics tracking',
      status: 'active' as const
    },
    {
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      status: 'active' as const
    },
    {
      title: 'API Integration',
      description: 'Connect with external services',
      status: 'pending' as const
    }
  ];

  return (
    <StandardizedPageTemplate
      title="Admin Dashboard"
      description="Manage your application settings and monitor performance"
      actions={
        <>
          <Button variant="outline">Settings</Button>
          <Button>New Project</Button>
        </>
      }
    >
      <StandardizedSection title="Overview Metrics">
        <StandardizedMetricsDashboard metrics={metrics} />
      </StandardizedSection>

      <StandardizedSection
        title="Available Features"
        description="Core functionality and integrations"
      >
        <StandardizedFeatureGrid features={features} />
      </StandardizedSection>
    </StandardizedPageTemplate>
  );
}