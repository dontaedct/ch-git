/**
 * @fileoverview Brand Preview Component
 * @module components/brand/brand-preview
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-011.2.4: Brand Configuration User Interface
 * Component for previewing brand configurations in real-time.
 */

'use client';

import { useEffect } from 'react';
import { BrandConfig } from '@/types/brand-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Eye, Download, ExternalLink } from 'lucide-react';

interface BrandPreviewProps {
  brand: BrandConfig;
}

export function BrandPreview({ brand }: BrandPreviewProps) {
  // Apply brand styles to the preview container
  useEffect(() => {
    const root = document.documentElement;
    const overrides = brand.overrides;

    // Apply color variables
    if (overrides.colors) {
      if (overrides.colors.primary) {
        root.style.setProperty('--preview-primary', overrides.colors.primary);
      }
      if (overrides.colors.secondary) {
        root.style.setProperty('--preview-secondary', overrides.colors.secondary);
      }
      if (overrides.colors.accent) {
        root.style.setProperty('--preview-accent', overrides.colors.accent);
      }
      
      // Apply neutral colors
      if (overrides.colors.neutral) {
        Object.entries(overrides.colors.neutral).forEach(([key, value]) => {
          root.style.setProperty(`--preview-neutral-${key}`, value);
        });
      }
    }

    // Apply typography variables
    if (overrides.typography) {
      if (overrides.typography.fontFamily) {
        root.style.setProperty('--preview-font-family', overrides.typography.fontFamily);
      }
      if (overrides.typography.scales) {
        Object.entries(overrides.typography.scales).forEach(([key, value]) => {
          root.style.setProperty(`--preview-font-size-${key}`, value);
        });
      }
    }

    // Cleanup function
    return () => {
      // Remove preview variables
      root.style.removeProperty('--preview-primary');
      root.style.removeProperty('--preview-secondary');
      root.style.removeProperty('--preview-accent');
      root.style.removeProperty('--preview-font-family');
      
      // Remove neutral colors
      for (let i = 50; i <= 900; i += 50) {
        root.style.removeProperty(`--preview-neutral-${i}`);
      }
      
      // Remove font sizes
      ['display', 'headline', 'body', 'caption'].forEach(scale => {
        root.style.removeProperty(`--preview-font-size-${scale}`);
      });
    };
  }, [brand]);

  const previewStyles = {
    '--preview-primary': brand.overrides.colors?.primary || '#3B82F6',
    '--preview-secondary': brand.overrides.colors?.secondary || '#8B5CF6',
    '--preview-accent': brand.overrides.colors?.accent || '#F59E0B',
    '--preview-font-family': brand.overrides.typography?.fontFamily || 'system-ui, sans-serif',
    '--preview-font-size-display': brand.overrides.typography?.scales?.display || '2.5rem',
    '--preview-font-size-headline': brand.overrides.typography?.scales?.headline || '1.5rem',
    '--preview-font-size-body': brand.overrides.typography?.scales?.body || '1rem',
    '--preview-font-size-caption': brand.overrides.typography?.scales?.caption || '0.875rem',
  } as React.CSSProperties;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Brand Preview</CardTitle>
                <CardDescription>
                  See how your brand looks across different components
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div 
              className="space-y-8 p-6 bg-white rounded-lg"
              style={previewStyles}
            >
              {/* Header Preview */}
              <div className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {brand.overrides.assets?.logo && (
                      <img 
                        src={brand.overrides.assets.logo} 
                        alt="Logo" 
                        className="h-8 w-auto"
                      />
                    )}
                    <h1 
                      className="text-xl font-bold"
                      style={{ 
                        color: 'var(--preview-primary)',
                        fontFamily: 'var(--preview-font-family)',
                        fontSize: 'var(--preview-font-size-headline)'
                      }}
                    >
                      {brand.name}
                    </h1>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm"
                      style={{ 
                        backgroundColor: 'var(--preview-primary)',
                        color: 'white'
                      }}
                    >
                      Primary Action
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      style={{ 
                        borderColor: 'var(--preview-primary)',
                        color: 'var(--preview-primary)'
                      }}
                    >
                      Secondary Action
                    </Button>
                  </div>
                </div>
              </div>

              {/* Hero Section Preview */}
              <div className="text-center py-12">
                <h2 
                  className="text-4xl font-bold mb-4"
                  style={{ 
                    color: 'var(--preview-primary)',
                    fontFamily: 'var(--preview-font-family)',
                    fontSize: 'var(--preview-font-size-display)'
                  }}
                >
                  Welcome to {brand.name}
                </h2>
                <p 
                  className="text-lg mb-8 max-w-2xl mx-auto"
                  style={{ 
                    fontFamily: 'var(--preview-font-family)',
                    fontSize: 'var(--preview-font-size-body)'
                  }}
                >
                  This is how your brand will look in hero sections and main headings. 
                  The typography and colors create a cohesive brand experience.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Button 
                    size="lg"
                    style={{ 
                      backgroundColor: 'var(--preview-primary)',
                      color: 'white'
                    }}
                  >
                    Get Started
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    style={{ 
                      borderColor: 'var(--preview-secondary)',
                      color: 'var(--preview-secondary)'
                    }}
                  >
                    Learn More
                  </Button>
                </div>
              </div>

              {/* Cards Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="border border-gray-200">
                    <CardHeader>
                      <CardTitle 
                        className="text-lg"
                        style={{ 
                          color: 'var(--preview-primary)',
                          fontFamily: 'var(--preview-font-family)'
                        }}
                      >
                        Feature {i}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p 
                        className="text-gray-600 mb-4"
                        style={{ 
                          fontFamily: 'var(--preview-font-family)',
                          fontSize: 'var(--preview-font-size-body)'
                        }}
                      >
                        This is how your brand colors and typography will appear in card components and feature sections.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        style={{ 
                          borderColor: 'var(--preview-accent)',
                          color: 'var(--preview-accent)'
                        }}
                      >
                        Learn More
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Form Preview */}
              <div className="max-w-md mx-auto">
                <h3 
                  className="text-xl font-semibold mb-4"
                  style={{ 
                    color: 'var(--preview-primary)',
                    fontFamily: 'var(--preview-font-family)'
                  }}
                >
                  Contact Form
                </h3>
                <div className="space-y-4">
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ fontFamily: 'var(--preview-font-family)' }}
                    >
                      Name
                    </label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ 
                        fontFamily: 'var(--preview-font-family)',
                        fontSize: 'var(--preview-font-size-body)'
                      }}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ fontFamily: 'var(--preview-font-family)' }}
                    >
                      Email
                    </label>
                    <input 
                      type="email" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ 
                        fontFamily: 'var(--preview-font-family)',
                        fontSize: 'var(--preview-font-size-body)'
                      }}
                      placeholder="Enter your email"
                    />
                  </div>
                  <Button 
                    className="w-full"
                    style={{ 
                      backgroundColor: 'var(--preview-primary)',
                      color: 'white'
                    }}
                  >
                    Submit
                  </Button>
                </div>
              </div>

              {/* Footer Preview */}
              <div className="border-t pt-8 mt-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {brand.overrides.assets?.logo && (
                      <img 
                        src={brand.overrides.assets.logo} 
                        alt="Logo" 
                        className="h-6 w-auto"
                      />
                    )}
                    <p 
                      className="text-sm text-gray-600"
                      style={{ 
                        fontFamily: 'var(--preview-font-family)',
                        fontSize: 'var(--preview-font-size-caption)'
                      }}
                    >
                      © 2024 {brand.name}. All rights reserved.
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge 
                      variant="secondary"
                      style={{ 
                        backgroundColor: 'var(--preview-secondary)',
                        color: 'white'
                      }}
                    >
                      {brand.metadata.industry || 'General'}
                    </Badge>
                    <Badge 
                      variant="outline"
                      style={{ 
                        borderColor: 'var(--preview-accent)',
                        color: 'var(--preview-accent)'
                      }}
                    >
                      {brand.metadata.style || 'Modern'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
