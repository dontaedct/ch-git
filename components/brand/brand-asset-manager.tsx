/**
 * @fileoverview Brand Asset Manager Component
 * @module components/brand/brand-asset-manager
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-011.2.4: Brand Configuration User Interface
 * Component for managing brand assets like logos, icons, and images.
 */

'use client';

import { useState, useRef } from 'react';
import { BrandConfig } from '@/types/brand-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Image, 
  Upload, 
  Trash2, 
  Eye, 
  Download, 
  AlertCircle, 
  CheckCircle,
  ExternalLink
} from 'lucide-react';

interface BrandAssetManagerProps {
  brand: BrandConfig;
  onBrandChange: (brand: BrandConfig) => void;
}

export function BrandAssetManager({ brand, onBrandChange }: BrandAssetManagerProps) {
  const [assets, setAssets] = useState(brand.overrides.assets || {});
  const [uploading, setUploading] = useState<string | null>(null);
  const [previewAsset, setPreviewAsset] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAssetChange = (assetType: string, value: string) => {
    const newAssets = {
      ...assets,
      [assetType]: value
    };
    setAssets(newAssets);
    
    onBrandChange({
      ...brand,
      overrides: {
        ...brand.overrides,
        assets: newAssets
      }
    });
  };

  const handleFileUpload = async (assetType: string, file: File) => {
    setUploading(assetType);
    
    try {
      // Simulate file upload - in a real implementation, this would upload to a storage service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a local URL for preview (in production, this would be the uploaded URL)
      const url = URL.createObjectURL(file);
      
      handleAssetChange(assetType, url);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(null);
    }
  };

  const handleFileSelect = (assetType: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileUpload(assetType, file);
      }
    };
    input.click();
  };

  const removeAsset = (assetType: string) => {
    const newAssets = { ...assets };
    delete newAssets[assetType as keyof typeof newAssets];
    setAssets(newAssets);
    
    onBrandChange({
      ...brand,
      overrides: {
        ...brand.overrides,
        assets: newAssets
      }
    });
  };

  const AssetUploader = ({ 
    assetType, 
    label, 
    description, 
    placeholder = 'Enter URL or upload file',
    recommendedSize = 'Recommended: 200x200px'
  }: {
    assetType: string;
    label: string;
    description: string;
    placeholder?: string;
    recommendedSize?: string;
  }) => {
    const assetValue = assets[assetType as keyof typeof assets];
    const isUploading = uploading === assetType;

    return (
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {recommendedSize}
          </p>
        </div>

        <div className="space-y-2">
          <Input
            value={assetValue || ''}
            onChange={(e) => handleAssetChange(assetType, e.target.value)}
            placeholder={placeholder}
            disabled={isUploading}
          />
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFileSelect(assetType)}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload File'}
            </Button>
            
            {assetValue && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewAsset(assetValue)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeAsset(assetType)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Asset Preview */}
        {assetValue && (
          <div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded border border-gray-300 overflow-hidden bg-white flex items-center justify-center">
                {assetValue.startsWith('http') || assetValue.startsWith('data:') ? (
                  <img 
                    src={assetValue} 
                    alt={label}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Image className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{label}</p>
                <p className="text-xs text-gray-500 truncate">{assetValue}</p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(assetValue, '_blank')}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Logo Assets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Logo Assets</CardTitle>
          <CardDescription>
            Upload your brand logos for different contexts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AssetUploader
            assetType="logo"
            label="Primary Logo"
            description="Main logo for headers, navigation, and general use"
            recommendedSize="Recommended: 200x60px (SVG preferred)"
          />
          
          <AssetUploader
            assetType="logoDark"
            label="Dark Background Logo"
            description="Logo variant for dark backgrounds and themes"
            recommendedSize="Recommended: 200x60px (SVG preferred)"
          />
        </CardContent>
      </Card>

      {/* Icon Assets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Icon Assets</CardTitle>
          <CardDescription>
            Brand icons and favicons for browser tabs and bookmarks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AssetUploader
            assetType="favicon"
            label="Favicon"
            description="Small icon displayed in browser tabs and bookmarks"
            recommendedSize="Recommended: 32x32px (ICO or PNG)"
          />
          
          <AssetUploader
            assetType="icon"
            label="Brand Icon"
            description="Square brand icon for app icons and social media"
            recommendedSize="Recommended: 512x512px (PNG)"
          />
        </CardContent>
      </Card>

      {/* Asset Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Asset Guidelines</CardTitle>
          <CardDescription>
            Best practices for brand assets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>File Formats:</strong> Use SVG for logos when possible, PNG for icons, and ICO for favicons.
            </AlertDescription>
          </Alert>
          
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>File Size:</strong> Keep files under 100KB for optimal loading performance.
            </AlertDescription>
          </Alert>
          
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Transparency:</strong> Use transparent backgrounds for logos and icons to ensure compatibility across different backgrounds.
            </AlertDescription>
          </Alert>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Accessibility:</strong> Ensure sufficient contrast between logo colors and background colors for accessibility compliance.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Asset Preview Modal */}
      {previewAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Asset Preview</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setPreviewAsset(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <img 
                  src={previewAsset} 
                  alt="Asset preview"
                  className="max-w-full max-h-96 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => window.open(previewAsset, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
