'use client';

/**
 * Brand Asset Management Component
 *
 * Interactive component for managing brand assets including logos, favicons,
 * banners, and other visual elements with upload, preview, and optimization features.
 */

import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  whiteLabelBranding,
  type BrandAsset,
  type ClientBranding
} from '@/lib/branding/white-label-manager';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Download,
  Edit,
  Eye,
  AlertTriangle,
  CheckCircle,
  FileImage,
  Palette,
  Monitor,
  Smartphone,
  Tablet,
  Copy,
  ExternalLink,
  Info,
  Plus,
  RefreshCw
} from 'lucide-react';

interface BrandAssetManagerProps {
  branding: ClientBranding;
  onBrandingUpdate: (updates: Partial<ClientBranding>) => void;
  onAssetUpload?: (asset: BrandAsset) => void;
  allowEditing?: boolean;
  className?: string;
}

interface AssetUploadState {
  isDragging: boolean;
  isUploading: boolean;
  uploadProgress: number;
  uploadError: string | null;
}

interface AssetPreview {
  asset: BrandAsset | null;
  isEditing: boolean;
  editData: Partial<BrandAsset>;
}

export function BrandAssetManager({
  branding,
  onBrandingUpdate,
  onAssetUpload,
  allowEditing = true,
  className = ''
}: BrandAssetManagerProps) {
  const [uploadState, setUploadState] = useState<AssetUploadState>({
    isDragging: false,
    isUploading: false,
    uploadProgress: 0,
    uploadError: null
  });

  const [activeTab, setActiveTab] = useState<'logos' | 'icons' | 'images' | 'upload'>('logos');
  const [previewState, setPreviewState] = useState<AssetPreview>({
    asset: null,
    isEditing: false,
    editData: {}
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const allAssets = whiteLabelBranding.getAllAssets();
  const logoAssets = allAssets.filter(asset => asset.type === 'logo');
  const iconAssets = allAssets.filter(asset => asset.type === 'favicon' || asset.type === 'icon');
  const imageAssets = allAssets.filter(asset => ['banner', 'background'].includes(asset.type));

  // File upload handling
  const handleFileSelect = useCallback(async (files: FileList) => {
    if (!allowEditing) return;

    setUploadState(prev => ({ ...prev, isUploading: true, uploadError: null, uploadProgress: 0 }));

    try {
      const file = files[0];
      if (!file) return;

      // Validate file
      const validation = validateAssetFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        setUploadState(prev => ({ ...prev, uploadProgress: progress }));
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Upload asset
      const assetType = getAssetTypeFromFile(file);
      const asset = await whiteLabelBranding.uploadAsset(file, assetType, file.name);

      // Call callback
      onAssetUpload?.(asset);

      // Reset upload state
      setUploadState({
        isDragging: false,
        isUploading: false,
        uploadProgress: 0,
        uploadError: null
      });

      // Auto-assign if it's the first logo or favicon
      if (assetType === 'logo' && !branding.logo_primary) {
        onBrandingUpdate({ logo_primary: asset });
      } else if (assetType === 'favicon' && !branding.favicon) {
        onBrandingUpdate({ favicon: asset });
      }

    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        uploadError: error instanceof Error ? error.message : 'Upload failed'
      }));
    }
  }, [allowEditing, onAssetUpload, onBrandingUpdate, branding]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setUploadState(prev => ({ ...prev, isDragging: true }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setUploadState(prev => ({ ...prev, isDragging: false }));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setUploadState(prev => ({ ...prev, isDragging: false }));

    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  const validateAssetFile = (file: File) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Please upload a valid image file (JPEG, PNG, GIF, WebP, SVG)' };
    }

    if (file.size > maxSize) {
      return { isValid: false, error: 'File size must be less than 5MB' };
    }

    return { isValid: true, error: null };
  };

  const getAssetTypeFromFile = (file: File): BrandAsset['type'] => {
    const name = file.name.toLowerCase();

    if (name.includes('favicon') || name.includes('icon')) {
      return 'favicon';
    } else if (name.includes('logo')) {
      return 'logo';
    } else if (name.includes('banner')) {
      return 'banner';
    } else if (name.includes('background')) {
      return 'background';
    } else {
      return 'logo'; // Default to logo
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / 1048576) + ' MB';
  };

  const getImageDimensionsText = (asset: BrandAsset): string => {
    return `${asset.dimensions.width} × ${asset.dimensions.height}`;
  };

  const handleAssetAssign = (asset: BrandAsset, role: 'primary_logo' | 'secondary_logo' | 'favicon') => {
    if (!allowEditing) return;

    const updates: Partial<ClientBranding> = {};

    switch (role) {
      case 'primary_logo':
        updates.logo_primary = asset;
        break;
      case 'secondary_logo':
        updates.logo_secondary = asset;
        break;
      case 'favicon':
        updates.favicon = asset;
        break;
    }

    onBrandingUpdate(updates);
  };

  const handleAssetDelete = async (assetId: string) => {
    if (!allowEditing) return;

    if (!confirm('Are you sure you want to delete this asset?')) {
      return;
    }

    try {
      await whiteLabelBranding.deleteAsset(assetId);

      // Remove from branding if assigned
      const updates: Partial<ClientBranding> = {};
      if (branding.logo_primary?.id === assetId) updates.logo_primary = null;
      if (branding.logo_secondary?.id === assetId) updates.logo_secondary = null;
      if (branding.favicon?.id === assetId) updates.favicon = null;

      if (Object.keys(updates).length > 0) {
        onBrandingUpdate(updates);
      }
    } catch (error) {
      alert(`Error deleting asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const renderAssetCard = (asset: BrandAsset, isAssigned?: boolean, assignedRole?: string) => (
    <Card key={asset.id} className={`relative ${isAssigned ? 'ring-2 ring-blue-500' : ''}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Asset Preview */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
            <img
              src={asset.url}
              alt={asset.alt_text || asset.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-image.png';
              }}
            />
            {isAssigned && (
              <Badge className="absolute top-2 right-2 bg-blue-500">
                {assignedRole}
              </Badge>
            )}
          </div>

          {/* Asset Info */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm truncate">{asset.name}</h4>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{getImageDimensionsText(asset)}</span>
              <span>{formatFileSize(asset.file_size)}</span>
            </div>
            <div className="text-xs text-gray-500">
              {asset.format.replace('image/', '').toUpperCase()}
            </div>
          </div>

          {/* Actions */}
          {allowEditing && (
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPreviewState({ asset, isEditing: false, editData: {} })}
              >
                <Eye className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(asset.url, '_blank')}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAssetDelete(asset.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Assignment Buttons */}
          {allowEditing && asset.type === 'logo' && (
            <div className="space-y-1">
              <Button
                size="sm"
                variant={branding.logo_primary?.id === asset.id ? 'default' : 'outline'}
                className="w-full text-xs"
                onClick={() => handleAssetAssign(asset, 'primary_logo')}
              >
                {branding.logo_primary?.id === asset.id ? '✓ Primary Logo' : 'Set as Primary'}
              </Button>
              <Button
                size="sm"
                variant={branding.logo_secondary?.id === asset.id ? 'default' : 'outline'}
                className="w-full text-xs"
                onClick={() => handleAssetAssign(asset, 'secondary_logo')}
              >
                {branding.logo_secondary?.id === asset.id ? '✓ Secondary Logo' : 'Set as Secondary'}
              </Button>
            </div>
          )}

          {allowEditing && asset.type === 'favicon' && (
            <Button
              size="sm"
              variant={branding.favicon?.id === asset.id ? 'default' : 'outline'}
              className="w-full text-xs"
              onClick={() => handleAssetAssign(asset, 'favicon')}
            >
              {branding.favicon?.id === asset.id ? '✓ Active Favicon' : 'Set as Favicon'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderUploadZone = () => (
    <div
      ref={dropZoneRef}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        uploadState.isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        className="hidden"
      />

      {uploadState.isUploading ? (
        <div className="space-y-4">
          <RefreshCw className="h-8 w-8 text-blue-500 mx-auto animate-spin" />
          <div>
            <p className="text-sm text-gray-600">Uploading asset...</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${uploadState.uploadProgress}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Upload className="h-8 w-8 text-gray-400 mx-auto" />
          <div>
            <p className="text-lg font-medium text-gray-900">
              Drop your image here
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or click to browse files
            </p>
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={!allowEditing}
          >
            <Plus className="h-4 w-4 mr-2" />
            Choose File
          </Button>
          <div className="text-xs text-gray-500">
            Supports JPEG, PNG, GIF, WebP, SVG • Max 5MB
          </div>
        </div>
      )}

      {uploadState.uploadError && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
            <span className="text-sm text-red-600">{uploadState.uploadError}</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`brand-asset-manager ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Brand Assets</h2>
          <p className="text-gray-600 mt-1">
            Manage logos, icons, and visual assets for your brand.
          </p>
        </div>

        {/* Current Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <CheckCircle className="h-5 w-5 mr-2" />
              Current Assignments
            </CardTitle>
            <CardDescription>
              Assets currently assigned to your brand
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Primary Logo */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Primary Logo</Label>
                {branding.logo_primary ? (
                  <div className="border rounded-lg p-3">
                    <div className="aspect-video bg-gray-100 rounded overflow-hidden mb-2">
                      <img
                        src={branding.logo_primary.url}
                        alt="Primary Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-xs text-gray-600 truncate">
                      {branding.logo_primary.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getImageDimensionsText(branding.logo_primary)}
                    </p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No logo assigned</p>
                  </div>
                )}
              </div>

              {/* Secondary Logo */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Secondary Logo</Label>
                {branding.logo_secondary ? (
                  <div className="border rounded-lg p-3">
                    <div className="aspect-video bg-gray-100 rounded overflow-hidden mb-2">
                      <img
                        src={branding.logo_secondary.url}
                        alt="Secondary Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-xs text-gray-600 truncate">
                      {branding.logo_secondary.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getImageDimensionsText(branding.logo_secondary)}
                    </p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No secondary logo</p>
                  </div>
                )}
              </div>

              {/* Favicon */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Favicon</Label>
                {branding.favicon ? (
                  <div className="border rounded-lg p-3">
                    <div className="aspect-square bg-gray-100 rounded overflow-hidden mb-2 w-16 h-16">
                      <img
                        src={branding.favicon.url}
                        alt="Favicon"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-xs text-gray-600 truncate">
                      {branding.favicon.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getImageDimensionsText(branding.favicon)}
                    </p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No favicon assigned</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Asset Management Tabs */}
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="logos">Logos ({logoAssets.length})</TabsTrigger>
            <TabsTrigger value="icons">Icons ({iconAssets.length})</TabsTrigger>
            <TabsTrigger value="images">Images ({imageAssets.length})</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="logos" className="space-y-4">
            {logoAssets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {logoAssets.map((asset) => {
                  const isAssigned = branding.logo_primary?.id === asset.id || branding.logo_secondary?.id === asset.id;
                  const role = branding.logo_primary?.id === asset.id ? 'Primary' :
                              branding.logo_secondary?.id === asset.id ? 'Secondary' : '';
                  return renderAssetCard(asset, isAssigned, role);
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileImage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No logos uploaded</h3>
                  <p className="text-gray-600 mb-4">Upload your company logos to get started.</p>
                  <Button onClick={() => setActiveTab('upload')}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="icons" className="space-y-4">
            {iconAssets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {iconAssets.map((asset) => {
                  const isAssigned = branding.favicon?.id === asset.id;
                  return renderAssetCard(asset, isAssigned, isAssigned ? 'Favicon' : '');
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No icons uploaded</h3>
                  <p className="text-gray-600 mb-4">Upload icons and favicons for your brand.</p>
                  <Button onClick={() => setActiveTab('upload')}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Icon
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="images" className="space-y-4">
            {imageAssets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {imageAssets.map((asset) => renderAssetCard(asset))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No images uploaded</h3>
                  <p className="text-gray-600 mb-4">Upload banners, backgrounds, and other images.</p>
                  <Button onClick={() => setActiveTab('upload')}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload New Asset</CardTitle>
                <CardDescription>
                  Upload logos, icons, or images for your brand. Supported formats: JPEG, PNG, GIF, WebP, SVG
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderUploadZone()}
              </CardContent>
            </Card>

            {/* Upload Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Info className="h-5 w-5 mr-2" />
                  Asset Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Logos</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Recommended: 512×512px or higher</li>
                      <li>• Transparent background (PNG)</li>
                      <li>• SVG format for best scalability</li>
                      <li>• Include both horizontal and stacked versions</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Favicons</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Required: 32×32px or 16×16px</li>
                      <li>• ICO or PNG format</li>
                      <li>• Simple, recognizable design</li>
                      <li>• High contrast for visibility</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Images</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Banners: 1200×400px recommended</li>
                      <li>• Backgrounds: 1920×1080px or higher</li>
                      <li>• Optimized file size for web</li>
                      <li>• Consistent with brand style</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Asset Preview Modal */}
        {previewState.asset && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Asset Preview</h3>
                  <Button
                    variant="ghost"
                    onClick={() => setPreviewState({ asset: null, isEditing: false, editData: {} })}
                  >
                    ×
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Image Preview */}
                  <div className="bg-gray-100 rounded-lg p-4">
                    <img
                      src={previewState.asset.url}
                      alt={previewState.asset.alt_text || previewState.asset.name}
                      className="max-w-full max-h-64 mx-auto object-contain"
                    />
                  </div>

                  {/* Asset Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <div className="font-medium">{previewState.asset.name}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <div className="font-medium capitalize">{previewState.asset.type}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Dimensions:</span>
                      <div className="font-medium">{getImageDimensionsText(previewState.asset)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">File Size:</span>
                      <div className="font-medium">{formatFileSize(previewState.asset.file_size)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Format:</span>
                      <div className="font-medium">{previewState.asset.format.replace('image/', '').toUpperCase()}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <div className="font-medium">{new Date(previewState.asset.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => window.open(previewState.asset?.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Full Size
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = previewState.asset?.url || '';
                        link.download = previewState.asset?.name || 'asset';
                        link.click();
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}