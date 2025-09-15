/**
 * @fileoverview Brand Aware Error Provider
 * @module components/error/BrandAwareErrorProvider
 */

'use client';

import React from 'react';

export interface BrandAwareErrorProviderProps {
  children: React.ReactNode;
  brandId?: string;
}

export const BrandAwareErrorProvider: React.FC<BrandAwareErrorProviderProps> = ({ 
  children, 
  brandId = 'default' 
}) => {
  return (
    <div data-brand={brandId} className="brand-aware-error-provider">
      {children}
    </div>
  );
};

export default BrandAwareErrorProvider;