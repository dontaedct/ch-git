/**
 * @fileoverview Dynamic Brand Element Integration Demo
 * @module components/branding/BrandIntegrationDemo
 * @author OSS Hero System
 * @version 1.0.0
 */

'use client';

import { useBrandNames, useLogoConfig } from '@/lib/branding/hooks';
import { DynamicLogo } from './DynamicLogo';
import { DynamicBrandName } from './DynamicBrandName';
import { 
  DynamicBrandContent,
  DynamicEmailFrom,
  DynamicWelcomeMessage,
  DynamicTransactionalFooter,
  DynamicPageTitle,
  DynamicPageDescription,
  DynamicBrandText
} from './DynamicBrandContent';
import { cn } from '@/lib/utils';

interface BrandIntegrationDemoProps {
  /** Additional CSS classes */
  className?: string;
  /** Whether to show all components or just a subset */
  variant?: 'full' | 'compact' | 'email-only';
}

/**
 * Comprehensive demo component showing all dynamic brand elements
 */
export function BrandIntegrationDemo({ 
  className, 
  variant = 'full' 
}: BrandIntegrationDemoProps) {
  const { brandNames } = useBrandNames();
  const { logoConfig } = useLogoConfig();
  
  const renderFullDemo = () => (
    <div className="space-y-8">
      {/* Logo and Brand Name Integration */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Logo & Brand Name Integration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Small Logo + Brand</h4>
            <div className="flex items-center gap-2">
              <DynamicLogo size="sm" />
              <DynamicBrandName variant="short" />
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Medium Logo + Brand</h4>
            <div className="flex items-center gap-2">
              <DynamicLogo size="md" />
              <DynamicBrandName variant="full" />
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Large Logo + Brand</h4>
            <div className="flex items-center gap-2">
              <DynamicLogo size="lg" />
              <DynamicBrandName variant="organization" />
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Navigation Style</h4>
            <div className="flex items-center gap-2">
              <DynamicLogo size="sm" />
              <DynamicBrandName variant="nav" />
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Content Integration */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Dynamic Content Integration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Page Metadata</h4>
            <div className="space-y-2 text-sm">
              <div><strong>Title:</strong> <DynamicPageTitle /></div>
              <div><strong>Description:</strong> <DynamicPageDescription /></div>
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Email Content</h4>
            <div className="space-y-2 text-sm">
              <div><strong>From:</strong> <DynamicEmailFrom /></div>
              <div><strong>Welcome:</strong> <DynamicWelcomeMessage /></div>
              <div><strong>Footer:</strong> <DynamicTransactionalFooter /></div>
            </div>
          </div>
        </div>
      </section>

      {/* Template Processing */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Template Processing</h3>
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">Custom Brand Templates</h4>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Template:</strong> "Welcome to {'{brandName}'}, powered by {'{organizationName}'}"
            </div>
            <div>
              <strong>Result:</strong> <DynamicBrandText 
                template="Welcome to {brandName}, powered by {organizationName}"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Current Brand Configuration */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Current Brand Configuration</h3>
        <div className="p-4 border rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Brand Names</h4>
              <div className="space-y-1">
                <div><strong>Organization:</strong> {brandNames.organizationName}</div>
                <div><strong>App Name:</strong> {brandNames.appName}</div>
                <div><strong>Full Brand:</strong> {brandNames.fullBrand}</div>
                <div><strong>Short Brand:</strong> {brandNames.shortBrand}</div>
                <div><strong>Nav Brand:</strong> {brandNames.navBrand}</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Logo Configuration</h4>
              <div className="space-y-1">
                <div><strong>Show as Image:</strong> {logoConfig.showAsImage ? 'Yes' : 'No'}</div>
                <div><strong>Initials:</strong> {logoConfig.initials}</div>
                <div><strong>Alt Text:</strong> {logoConfig.alt}</div>
                <div><strong>Background:</strong> {logoConfig.fallbackBgColor}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  const renderCompactDemo = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <DynamicLogo size="md" />
        <div>
          <DynamicBrandName variant="full" className="text-lg font-semibold" />
          <DynamicPageDescription className="text-sm text-gray-600" />
        </div>
      </div>
      <div className="text-sm text-gray-600">
        <DynamicEmailFrom /> • <DynamicWelcomeMessage />
      </div>
    </div>
  );

  const renderEmailOnlyDemo = () => (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg">
        <h4 className="font-medium mb-2">Email Integration</h4>
        <div className="space-y-2 text-sm">
          <div><strong>From Address:</strong> <DynamicEmailFrom /></div>
          <div><strong>Welcome Subject:</strong> <DynamicWelcomeMessage /></div>
          <div><strong>Footer Text:</strong> <DynamicTransactionalFooter /></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn('p-6 bg-white rounded-lg shadow-sm', className)}>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Dynamic Brand Element Integration</h2>
        <p className="text-gray-600 mt-1">
          Demonstration of HT-011.3.3: Dynamic Brand Element Integration
        </p>
      </div>
      
      {variant === 'full' && renderFullDemo()}
      {variant === 'compact' && renderCompactDemo()}
      {variant === 'email-only' && renderEmailOnlyDemo()}
    </div>
  );
}

/**
 * Quick brand element preview component
 */
export function BrandElementPreview({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3 p-3 border rounded-lg', className)}>
      <DynamicLogo size="sm" />
      <div className="flex-1">
        <DynamicBrandName variant="short" className="font-medium" />
        <DynamicBrandText 
          template="Powered by {organizationName}"
          className="text-xs text-gray-500"
        />
      </div>
    </div>
  );
}

/**
 * Email template preview component
 */
export function EmailTemplatePreview({ className }: { className?: string }) {
  return (
    <div className={cn('p-4 border rounded-lg bg-gray-50', className)}>
      <div className="space-y-2 text-sm">
        <div><strong>From:</strong> <DynamicEmailFrom /></div>
        <div><strong>Subject:</strong> <DynamicWelcomeMessage /></div>
        <div className="mt-3 p-2 bg-white rounded border">
          <DynamicBrandText 
            template="Welcome to {brandName}! We're excited to have you on board."
          />
        </div>
        <div className="text-xs text-gray-500">
          <DynamicTransactionalFooter />
        </div>
      </div>
    </div>
  );
}
