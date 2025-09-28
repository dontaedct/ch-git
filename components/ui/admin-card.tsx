/**
 * @fileoverview Standardized Admin Card Component
 * @module components/ui/admin-card
 * @version 1.0.0
 *
 * Implementation of HT-034.7.2: Component Standardization
 * Provides standardized card patterns with proper accessibility and design system compliance
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, cardPatterns, typography } from '@/lib/ui/shared-patterns';
import { motion } from 'framer-motion';

export interface AdminCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  variant?: 'admin' | 'analytics' | 'feature';
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  animated?: boolean;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

/**
 * Standardized admin card with consistent styling and accessibility
 */
export function AdminCard({
  title,
  description,
  children,
  variant = 'admin',
  className,
  headerClassName,
  contentClassName,
  animated = false,
  icon,
  actions
}: AdminCardProps) {
  const pattern = cardPatterns[variant];

  const CardComponent = animated ? motion.div : 'div';
  const cardProps = animated ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
    whileHover: { scale: 1.01 }
  } : {};

  return (
    <CardComponent {...cardProps}>
      <Card className={cn(pattern.className, className)}>
        <CardHeader className={cn(pattern.headerClassName, headerClassName)}>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              {icon && <div className="text-muted-foreground">{icon}</div>}
              <div>
                <CardTitle className={typography.cardTitle}>
                  {title}
                </CardTitle>
                {description && (
                  <CardDescription className={typography.cardDescription}>
                    {description}
                  </CardDescription>
                )}
              </div>
            </div>
            {actions && <div className="flex items-center space-x-2">{actions}</div>}
          </div>
        </CardHeader>
        <CardContent className={cn(pattern.contentClassName, contentClassName)}>
          {children}
        </CardContent>
      </Card>
    </CardComponent>
  );
}

/**
 * Quick analytics card with standard metrics styling
 */
export interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
}

export function MetricCard({
  title,
  value,
  description,
  change,
  changeType = 'neutral',
  icon
}: MetricCardProps) {
  const changeColors = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-muted-foreground'
  };

  return (
    <AdminCard
      title={title}
      description={description}
      variant="analytics"
      icon={icon}
    >
      <div className="space-y-2">
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className={cn("text-sm", changeColors[changeType])}>
            {change}
          </div>
        )}
      </div>
    </AdminCard>
  );
}

/**
 * Feature card with consistent CTA styling
 */
export interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  status?: 'active' | 'inactive' | 'pending';
}

export function FeatureCard({
  title,
  description,
  icon,
  action,
  status = 'active'
}: FeatureCardProps) {
  return (
    <AdminCard
      title={title}
      description={description}
      variant="feature"
      icon={icon}
      actions={action}
      animated
    >
      <div className="flex items-center justify-between pt-4">
        <div className={cn(
          "px-2 py-1 rounded-full text-xs font-medium",
          status === 'active' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
          status === 'inactive' && "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100",
          status === 'pending' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
        )}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>
    </AdminCard>
  );
}