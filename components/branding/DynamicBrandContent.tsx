/**
 * @fileoverview Dynamic Brand Content Component
 * @module components/branding/DynamicBrandContent
 * @author OSS Hero System
 * @version 1.0.0
 */

'use client';

import { useBrandNames } from '@/lib/branding/hooks';
import { cn } from '@/lib/utils';

interface DynamicBrandContentProps {
  /** Content type to render */
  type: 'emailFrom' | 'welcomeMessage' | 'transactionalFooter' | 'pageTitle' | 'pageDescription';
  /** Additional CSS classes */
  className?: string;
  /** Whether to show fallback if brand name is not available */
  showFallback?: boolean;
  /** Custom fallback text */
  fallbackText?: string;
}

/**
 * Dynamic brand content component that replaces hardcoded brand text
 */
export function DynamicBrandContent({
  type,
  className,
  showFallback = true,
  fallbackText,
}: DynamicBrandContentProps) {
  const { brandNames } = useBrandNames();
  
  const getContent = () => {
    switch (type) {
      case 'emailFrom':
        return `${brandNames.appName} <no-reply@example.com>`;
      case 'welcomeMessage':
        return `Welcome to ${brandNames.appName}`;
      case 'transactionalFooter':
        return `This is a transactional message from ${brandNames.appName}.`;
      case 'pageTitle':
        return `${brandNames.appName} Template`;
      case 'pageDescription':
        return `A modern micro web application template for ${brandNames.organizationName}`;
      default:
        return fallbackText || brandNames.appName;
    }
  };
  
  const content = getContent();
  
  return (
    <span className={cn(className)}>
      {content}
    </span>
  );
}

/**
 * Dynamic email from address component
 */
export function DynamicEmailFrom({ className }: { className?: string }) {
  return (
    <DynamicBrandContent
      type="emailFrom"
      className={className}
    />
  );
}

/**
 * Dynamic welcome message component
 */
export function DynamicWelcomeMessage({ className }: { className?: string }) {
  return (
    <DynamicBrandContent
      type="welcomeMessage"
      className={className}
    />
  );
}

/**
 * Dynamic transactional footer component
 */
export function DynamicTransactionalFooter({ className }: { className?: string }) {
  return (
    <DynamicBrandContent
      type="transactionalFooter"
      className={className}
    />
  );
}

/**
 * Dynamic page title component
 */
export function DynamicPageTitle({ className }: { className?: string }) {
  return (
    <DynamicBrandContent
      type="pageTitle"
      className={className}
    />
  );
}

/**
 * Dynamic page description component
 */
export function DynamicPageDescription({ className }: { className?: string }) {
  return (
    <DynamicBrandContent
      type="pageDescription"
      className={className}
    />
  );
}

/**
 * Dynamic brand text with template support
 */
export function DynamicBrandText({
  template,
  className,
  variables = {},
}: {
  template: string;
  className?: string;
  variables?: Record<string, string>;
}) {
  const { brandNames } = useBrandNames();
  
  // Replace brand variables in template
  let processedTemplate = template
    .replace(/\{brandName\}/g, brandNames.appName)
    .replace(/\{organizationName\}/g, brandNames.organizationName)
    .replace(/\{fullBrand\}/g, brandNames.fullBrand)
    .replace(/\{shortBrand\}/g, brandNames.shortBrand)
    .replace(/\{navBrand\}/g, brandNames.navBrand);
  
  // Replace custom variables
  Object.entries(variables).forEach(([key, value]) => {
    processedTemplate = processedTemplate.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  });
  
  return (
    <span className={cn(className)}>
      {processedTemplate}
    </span>
  );
}
