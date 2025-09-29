/**
 * @fileoverview Branding Settings Components - HT-032.1.3
 * @module components/admin/branding-settings
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Reusable UI components for branding configuration including color pickers,
 * logo upload, font selection, and brand preview components.
 */

"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Palette,
  Upload,
  Eye,
  Copy,
  Check,
  Image as ImageIcon,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { BrandingSettings } from '@/lib/admin/foundation-settings';

interface ColorPalette {
  name: string;
  primary: string;
  secondary: string;
  description: string;
}

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

interface LogoUploadProps {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  onFileUpload: (file: File) => void;
  icon?: React.ReactNode;
  className?: string;
}

interface BrandPreviewProps {
  settings: BrandingSettings;
  className?: string;
}

interface ColorPalettePickerProps {
  palettes: ColorPalette[];
  onPaletteSelect: (palette: ColorPalette) => void;
  className?: string;
}

/**
 * Color Picker Component
 */
export function ColorPicker({ label, value, onChange, className }: ColorPickerProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={`color-${label.toLowerCase().replace(/\s+/g, '-')}`}>
        {label}
      </Label>
      <div className="flex items-center space-x-4">
        <div
          className="w-16 h-16 rounded-lg border-2 cursor-pointer transition-all hover:scale-105"
          style={{ backgroundColor: value }}
          onClick={() => document.getElementById(`color-input-${label}`)?.click()}
        />
        <div className="flex-1">
          <div className="flex space-x-2">
            <Input
              id={`color-${label.toLowerCase().replace(/\s+/g, '-')}`}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#3B82F6"
              className="font-mono"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="px-3"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        <input
          id={`color-input-${label}`}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
        />
      </div>
    </div>
  );
}

/**
 * Logo Upload Component
 */
export function LogoUpload({ 
  label, 
  description, 
  value, 
  onChange, 
  onFileUpload, 
  icon = <ImageIcon className="w-8 h-8 text-gray-400" />,
  className 
}: LogoUploadProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          {icon}
          <span className="ml-2">{label}</span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          {value ? (
            <div className="relative">
              <img
                src={value}
                alt={`${label} preview`}
                className="max-h-24 max-w-48 object-contain"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 p-0"
                onClick={() => onChange('')}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <div className="text-center">
              {icon}
              <p className="text-sm text-gray-500 mt-2">No {label.toLowerCase()} uploaded</p>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`${label.toLowerCase()}-url`}>{label} URL</Label>
          <div className="flex space-x-2">
            <Input
              id={`${label.toLowerCase()}-url`}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={`https://example.com/${label.toLowerCase()}.png`}
            />
            <label className="cursor-pointer">
              <Button variant="outline" asChild>
                <span>
                  <Upload className="w-4 h-4" />
                </span>
              </Button>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onFileUpload(file);
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Brand Preview Component
 */
export function BrandPreview({ settings, className }: BrandPreviewProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Eye className="w-5 h-5 mr-2" />
          Brand Preview
        </CardTitle>
        <CardDescription>
          Preview how your branding will appear across different devices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Desktop Preview */}
          <div className="text-center">
            <Monitor className="w-6 h-6 mx-auto mb-2 text-gray-500" />
            <p className="text-sm font-medium mb-3">Desktop</p>
            <div 
              className="border rounded-lg p-4 h-32 flex items-center justify-center transition-all"
              style={{ 
                backgroundColor: settings.primaryColor + '10',
                borderColor: settings.primaryColor
              }}
            >
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt="Logo"
                  className="max-h-12 object-contain"
                />
              ) : (
                <div 
                  className="px-4 py-2 rounded text-white font-medium"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  Your Brand
                </div>
              )}
            </div>
          </div>

          {/* Tablet Preview */}
          <div className="text-center">
            <Tablet className="w-6 h-6 mx-auto mb-2 text-gray-500" />
            <p className="text-sm font-medium mb-3">Tablet</p>
            <div 
              className="border rounded-lg p-3 h-32 flex items-center justify-center transition-all"
              style={{ 
                backgroundColor: settings.primaryColor + '10',
                borderColor: settings.primaryColor
              }}
            >
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt="Logo"
                  className="max-h-10 object-contain"
                />
              ) : (
                <div 
                  className="px-3 py-1 rounded text-white font-medium text-sm"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  Your Brand
                </div>
              )}
            </div>
          </div>

          {/* Mobile Preview */}
          <div className="text-center">
            <Smartphone className="w-6 h-6 mx-auto mb-2 text-gray-500" />
            <p className="text-sm font-medium mb-3">Mobile</p>
            <div 
              className="border rounded-lg p-2 h-32 flex items-center justify-center transition-all"
              style={{ 
                backgroundColor: settings.primaryColor + '10',
                borderColor: settings.primaryColor
              }}
            >
              {settings.faviconUrl ? (
                <img
                  src={settings.faviconUrl}
                  alt="Favicon"
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <div 
                  className="w-8 h-8 rounded text-white font-bold text-xs flex items-center justify-center"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  YB
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Color Palette Picker Component
 */
export function ColorPalettePicker({ palettes, onPaletteSelect, className }: ColorPalettePickerProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Pre-made Color Palettes</CardTitle>
        <CardDescription>
          Choose from professionally designed color combinations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {palettes.map((palette) => (
            <motion.div
              key={palette.name}
              className="border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md hover:scale-105"
              onClick={() => onPaletteSelect(palette)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: palette.primary }}
                />
                <div
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: palette.secondary }}
                />
                <h3 className="font-medium">{palette.name}</h3>
              </div>
              <p className="text-sm text-gray-500">{palette.description}</p>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Brand Color Preview Component
 */
interface BrandColorPreviewProps {
  primaryColor: string;
  secondaryColor: string;
  className?: string;
}

export function BrandColorPreview({ primaryColor, secondaryColor, className }: BrandColorPreviewProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Color Preview</CardTitle>
        <CardDescription>
          See how your colors will look in different contexts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-4">
            <Button style={{ backgroundColor: primaryColor, borderColor: primaryColor }}>
              Primary Button
            </Button>
            <Button 
              variant="outline"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              Outline Button
            </Button>
            <Button 
              variant="secondary"
              style={{ backgroundColor: secondaryColor, borderColor: secondaryColor }}
            >
              Secondary Button
            </Button>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Sample Content</h3>
            <p className="text-gray-600 mb-3">
              This is how your content will look with the selected colors.
            </p>
            <a 
              href="#" 
              className="underline"
              style={{ color: primaryColor }}
            >
              This is a sample link
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Font Preview Component
 */
interface FontPreviewProps {
  fontFamily: string;
  className?: string;
}

export function FontPreview({ fontFamily, className }: FontPreviewProps) {
  return (
    <div className={cn("border rounded-lg p-6", className)} style={{ fontFamily }}>
      <h1 className="text-3xl font-bold mb-2">Heading 1</h1>
      <h2 className="text-2xl font-semibold mb-2">Heading 2</h2>
      <h3 className="text-xl font-medium mb-4">Heading 3</h3>
      <p className="text-base mb-3">
        This is a paragraph of regular text to show how the selected font family 
        will appear in your admin interface. The quick brown fox jumps over the lazy dog.
      </p>
      <p className="text-sm text-gray-600">
        This is smaller text that might be used for descriptions or metadata.
      </p>
    </div>
  );
}

/**
 * CSS Variables Display Component
 */
interface CSSVariablesProps {
  settings: BrandingSettings;
  className?: string;
}

export function CSSVariables({ settings, className }: CSSVariablesProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Generated CSS Variables</CardTitle>
        <CardDescription>
          CSS variables that will be available throughout your admin interface
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm">
          <div className="space-y-1">
            <div>--brand-primary: {settings.primaryColor};</div>
            <div>--brand-secondary: {settings.secondaryColor};</div>
            <div>--brand-font-family: {settings.fontFamily};</div>
            {settings.logoUrl && <div>--brand-logo-url: url({settings.logoUrl});</div>}
            {settings.faviconUrl && <div>--brand-favicon-url: url({settings.faviconUrl});</div>}
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          These variables can be used in your custom CSS or by developers 
          when creating custom components.
        </p>
      </CardContent>
    </Card>
  );
}

export default {
  ColorPicker,
  LogoUpload,
  BrandPreview,
  ColorPalettePicker,
  BrandColorPreview,
  FontPreview,
  CSSVariables
};
