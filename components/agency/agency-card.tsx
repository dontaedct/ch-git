/**
 * HT-022.1.3: Agency Card Component
 * 
 * Enhanced compound component pattern for agency micro-app development
 * Part of the HT-022 Component System Integration
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { SimpleClientTheme } from '@/lib/foundation';

// Agency Card Props
export interface AgencyCardProps extends React.ComponentProps<'div'> {
  // Client customization
  clientId?: string;
  customTheme?: SimpleClientTheme;
  brandVariant?: 'default' | 'primary' | 'secondary';

  // Layout options
  layout?: 'standard' | 'feature' | 'testimonial' | 'product';
  spacing?: 'compact' | 'normal' | 'spacious';

  // Visual options
  elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg';

  // Behavior options
  interactive?: boolean;
  loading?: boolean;
}

// Card Header Props
export interface CardHeaderProps extends React.ComponentProps<'div'> {
  className?: string;
  children: React.ReactNode;
}

// Card Title Props
export interface CardTitleProps extends React.ComponentProps<'h3'> {
  className?: string;
  children: React.ReactNode;
}

// Card Description Props
export interface CardDescriptionProps extends React.ComponentProps<'p'> {
  className?: string;
  children: React.ReactNode;
}

// Card Content Props
export interface CardContentProps extends React.ComponentProps<'div'> {
  className?: string;
  children: React.ReactNode;
}

// Card Footer Props
export interface CardFooterProps extends React.ComponentProps<'div'> {
  className?: string;
  children: React.ReactNode;
}

// Client Logo Props
export interface ClientLogoProps extends React.ComponentProps<'img'> {
  className?: string;
  clientId?: string;
  customTheme?: SimpleClientTheme;
}

// Branded Action Props
export interface BrandedActionProps extends React.ComponentProps<'button'> {
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  clientId?: string;
  customTheme?: SimpleClientTheme;
}

// Customizable Content Props
export interface CustomizableContentProps extends React.ComponentProps<'div'> {
  className?: string;
  clientId?: string;
  customTheme?: SimpleClientTheme;
  children: React.ReactNode;
}

// Agency Card Root Component
const AgencyCardRoot: React.FC<AgencyCardProps> = ({
  clientId,
  customTheme,
  brandVariant = 'default',
  layout = 'standard',
  spacing = 'normal',
  elevation = 'md',
  borderRadius = 'md',
  interactive = false,
  loading = false,
  className,
  children,
  ...props
}) => {
  const getSpacingClasses = () => {
    switch (spacing) {
      case 'compact': return 'p-3';
      case 'spacious': return 'p-6';
      default: return 'p-4';
    }
  };

  const getElevationClasses = () => {
    switch (elevation) {
      case 'none': return '';
      case 'sm': return 'shadow-sm';
      case 'lg': return 'shadow-lg';
      case 'xl': return 'shadow-xl';
      default: return 'shadow-md';
    }
  };

  const getBorderRadiusClasses = () => {
    switch (borderRadius) {
      case 'none': return 'rounded-none';
      case 'sm': return 'rounded-sm';
      case 'lg': return 'rounded-lg';
      default: return 'rounded-md';
    }
  };

  const getLayoutClasses = () => {
    switch (layout) {
      case 'feature': return 'border-l-4 border-l-primary';
      case 'testimonial': return 'bg-gradient-to-br from-primary/5 to-secondary/5';
      case 'product': return 'hover:scale-105 transition-transform';
      default: return '';
    }
  };

  const getBrandVariantClasses = () => {
    if (!customTheme) return '';
    
    switch (brandVariant) {
      case 'primary': return 'border-primary/20 bg-primary/5';
      case 'secondary': return 'border-secondary/20 bg-secondary/5';
      default: return 'border-border bg-card';
    }
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden border bg-card text-card-foreground',
        getSpacingClasses(),
        getElevationClasses(),
        getBorderRadiusClasses(),
        getLayoutClasses(),
        getBrandVariantClasses(),
        interactive && 'cursor-pointer hover:shadow-lg transition-shadow',
        loading && 'animate-pulse',
        className
      )}
      data-client-id={clientId}
      data-theme-id={customTheme?.id}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Header Component
const CardHeader: React.FC<CardHeaderProps> = ({ className, children, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 pb-4', className)} {...props}>
    {children}
  </div>
);

// Card Title Component
const CardTitle: React.FC<CardTitleProps> = ({ className, children, ...props }) => (
  <h3 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props}>
    {children}
  </h3>
);

// Card Description Component
const CardDescription: React.FC<CardDescriptionProps> = ({ className, children, ...props }) => (
  <p className={cn('text-sm text-muted-foreground', className)} {...props}>
    {children}
  </p>
);

// Card Content Component
const CardContent: React.FC<CardContentProps> = ({ className, children, ...props }) => (
  <div className={cn('pt-0', className)} {...props}>
    {children}
  </div>
);

// Card Footer Component
const CardFooter: React.FC<CardFooterProps> = ({ className, children, ...props }) => (
  <div className={cn('flex items-center pt-4', className)} {...props}>
    {children}
  </div>
);

// Client Logo Component
const ClientLogo: React.FC<ClientLogoProps> = ({ 
  className, 
  clientId, 
  customTheme, 
  alt = 'Client Logo',
  ...props 
}) => {
  const logoSrc = customTheme?.logo.src || '/default-logo.png';
  const logoAlt = customTheme?.logo.alt || alt;

  return (
    <img
      src={logoSrc}
      alt={logoAlt}
      className={cn('h-8 w-auto object-contain', className)}
      data-client-id={clientId}
      {...props}
    />
  );
};

// Branded Action Component
const BrandedAction: React.FC<BrandedActionProps> = ({
  className,
  variant = 'primary',
  clientId,
  customTheme,
  children,
  ...props
}) => {
  const getVariantClasses = () => {
    if (customTheme) {
      switch (variant) {
        case 'primary': return 'bg-primary text-primary-foreground hover:bg-primary/90';
        case 'secondary': return 'bg-secondary text-secondary-foreground hover:bg-secondary/90';
        case 'outline': return 'border border-primary text-primary hover:bg-primary hover:text-primary-foreground';
        default: return 'bg-primary text-primary-foreground hover:bg-primary/90';
      }
    }
    
    // Default classes when no custom theme
    switch (variant) {
      case 'primary': return 'bg-primary text-primary-foreground hover:bg-primary/90';
      case 'secondary': return 'bg-secondary text-secondary-foreground hover:bg-secondary/90';
      case 'outline': return 'border border-input bg-background hover:bg-accent hover:text-accent-foreground';
      default: return 'bg-primary text-primary-foreground hover:bg-primary/90';
    }
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 px-4 py-2',
        getVariantClasses(),
        className
      )}
      data-client-id={clientId}
      data-theme-id={customTheme?.id}
      {...props}
    >
      {children}
    </button>
  );
};

// Customizable Content Component
const CustomizableContent: React.FC<CustomizableContentProps> = ({
  className,
  clientId,
  customTheme,
  children,
  ...props
}) => {
  return (
    <div
      className={cn('space-y-2', className)}
      data-client-id={clientId}
      data-theme-id={customTheme?.id}
      {...props}
    >
      {children}
    </div>
  );
};

// Agency Card Compound Component
export const AgencyCard = {
  Root: AgencyCardRoot,
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
  Footer: CardFooter,
  ClientLogo,
  BrandedAction,
  CustomizableContent,
};

// Export individual components for convenience
export {
  AgencyCardRoot,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  ClientLogo,
  BrandedAction,
  CustomizableContent,
};
