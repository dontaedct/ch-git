/**
 * @fileoverview CDN Integration System
 * Phase 4.2: CDN integration for asset delivery and performance optimization
 */

import type { Asset, CDNConfig } from './asset-manager';

// CDN Provider Interfaces
export interface CDNProvider {
  name: string;
  uploadAsset(asset: Asset, variant?: string): Promise<string>;
  deleteAsset(assetId: string, variant?: string): Promise<boolean>;
  getAssetUrl(assetId: string, variant?: string, transformations?: string): string;
  optimizeAsset(asset: Asset, options: OptimizationOptions): Promise<Asset>;
  generateThumbnail(asset: Asset, width: number, height: number): Promise<string>;
}

export interface OptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'thumb';
  gravity?: 'center' | 'north' | 'south' | 'east' | 'west';
  effects?: {
    blur?: number;
    brightness?: number;
    contrast?: number;
    saturation?: number;
  };
}

export interface CDNAnalytics {
  totalRequests: number;
  totalBandwidth: number;
  cacheHitRate: number;
  averageResponseTime: number;
  topAssets: Array<{
    assetId: string;
    requests: number;
    bandwidth: number;
  }>;
  errors: Array<{
    code: string;
    message: string;
    count: number;
  }>;
}

/**
 * Cloudinary CDN Provider
 */
export class CloudinaryProvider implements CDNProvider {
  name = 'cloudinary';
  private config: CDNConfig;
  private baseUrl: string;

  constructor(config: CDNConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl;
  }

  async uploadAsset(asset: Asset, variant: string = 'original'): Promise<string> {
    const formData = new FormData();
    formData.append('file', await this.getAssetBlob(asset));
    formData.append('public_id', `${asset.id}_${variant}`);
    formData.append('folder', 'agency-toolkit/assets');
    formData.append('upload_preset', 'agency_toolkit_assets');

    // Add transformations based on variant
    if (variant === 'thumbnail') {
      formData.append('transformation', 'w_300,h_300,c_fill,q_auto,f_auto');
    } else if (variant === 'optimized') {
      formData.append('transformation', 'q_auto,f_auto');
    } else if (variant === 'webp') {
      formData.append('transformation', 'f_webp,q_auto');
    } else if (variant === 'avif') {
      formData.append('transformation', 'f_avif,q_auto');
    }

    try {
      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Basic ${btoa(`${this.config.apiKey}:${this.config.apiSecret}`)}`
        }
      });

      if (!response.ok) {
        throw new Error(`Cloudinary upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  }

  async deleteAsset(assetId: string, variant: string = 'original'): Promise<boolean> {
    try {
      const publicId = `agency-toolkit/assets/${assetId}_${variant}`;
      const response = await fetch(`${this.baseUrl}/destroy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${this.config.apiKey}:${this.config.apiSecret}`)}`
        },
        body: JSON.stringify({ public_id: publicId })
      });

      return response.ok;
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      return false;
    }
  }

  getAssetUrl(assetId: string, variant: string = 'original', transformations?: string): string {
    const publicId = `agency-toolkit/assets/${assetId}_${variant}`;
    let url = `${this.baseUrl}/image/upload`;
    
    if (transformations) {
      url += `/${transformations}`;
    }
    
    url += `/${publicId}`;
    return url;
  }

  async optimizeAsset(asset: Asset, options: OptimizationOptions): Promise<Asset> {
    const transformations = this.buildTransformationString(options);
    const optimizedUrl = this.getAssetUrl(asset.id, 'optimized', transformations);
    
    // Create optimized version
    const optimizedAsset = {
      ...asset,
      optimizedUrl,
      isOptimized: true,
      metadata: {
        ...asset.metadata,
        quality: options.quality || 85,
        format: options.format || 'webp'
      }
    };

    return optimizedAsset;
  }

  async generateThumbnail(asset: Asset, width: number, height: number): Promise<string> {
    const transformations = `w_${width},h_${height},c_fill,q_auto,f_auto`;
    return this.getAssetUrl(asset.id, 'thumbnail', transformations);
  }

  private async getAssetBlob(asset: Asset): Promise<Blob> {
    // In a real implementation, this would fetch the asset from storage
    // For now, we'll create a mock blob
    return new Blob(['mock asset data'], { type: asset.mimeType });
  }

  private buildTransformationString(options: OptimizationOptions): string {
    const transformations: string[] = [];

    if (options.quality) {
      transformations.push(`q_${options.quality}`);
    }

    if (options.format) {
      transformations.push(`f_${options.format}`);
    }

    if (options.width && options.height) {
      if (options.crop === 'fill') {
        transformations.push(`w_${options.width},h_${options.height},c_fill`);
      } else if (options.crop === 'fit') {
        transformations.push(`w_${options.width},h_${options.height},c_fit`);
      } else if (options.crop === 'scale') {
        transformations.push(`w_${options.width},h_${options.height},c_scale`);
      } else {
        transformations.push(`w_${options.width},h_${options.height}`);
      }
    } else if (options.width) {
      transformations.push(`w_${options.width}`);
    } else if (options.height) {
      transformations.push(`h_${options.height}`);
    }

    if (options.gravity) {
      transformations.push(`g_${options.gravity}`);
    }

    if (options.effects) {
      if (options.effects.blur) {
        transformations.push(`e_blur:${options.effects.blur}`);
      }
      if (options.effects.brightness) {
        transformations.push(`e_brightness:${options.effects.brightness}`);
      }
      if (options.effects.contrast) {
        transformations.push(`e_contrast:${options.effects.contrast}`);
      }
      if (options.effects.saturation) {
        transformations.push(`e_saturation:${options.effects.saturation}`);
      }
    }

    return transformations.join(',');
  }
}

/**
 * AWS S3 CDN Provider
 */
export class AWSS3Provider implements CDNProvider {
  name = 'aws-s3';
  private config: CDNConfig;
  private bucketName: string;

  constructor(config: CDNConfig, bucketName: string) {
    this.config = config;
    this.bucketName = bucketName;
  }

  async uploadAsset(asset: Asset, variant: string = 'original'): Promise<string> {
    const key = `agency-toolkit/assets/${asset.id}_${variant}`;
    const url = `https://${this.bucketName}.s3.amazonaws.com/${key}`;
    
    // In a real implementation, this would use AWS SDK
    // For now, we'll simulate the upload
    console.log(`Uploading to S3: ${key}`);
    
    return url;
  }

  async deleteAsset(assetId: string, variant: string = 'original'): Promise<boolean> {
    const key = `agency-toolkit/assets/${assetId}_${variant}`;
    
    // In a real implementation, this would use AWS SDK
    console.log(`Deleting from S3: ${key}`);
    
    return true;
  }

  getAssetUrl(assetId: string, variant: string = 'original', transformations?: string): string {
    const key = `agency-toolkit/assets/${assetId}_${variant}`;
    let url = `https://${this.bucketName}.s3.amazonaws.com/${key}`;
    
    if (transformations) {
      // For S3, transformations would typically be handled by CloudFront
      url += `?transform=${encodeURIComponent(transformations)}`;
    }
    
    return url;
  }

  async optimizeAsset(asset: Asset, options: OptimizationOptions): Promise<Asset> {
    // S3 doesn't have built-in image optimization
    // This would typically be handled by Lambda functions or CloudFront
    return asset;
  }

  async generateThumbnail(asset: Asset, width: number, height: number): Promise<string> {
    // This would typically be handled by Lambda functions
    return this.getAssetUrl(asset.id, 'thumbnail');
  }
}

/**
 * Vercel CDN Provider
 */
export class VercelProvider implements CDNProvider {
  name = 'vercel';
  private config: CDNConfig;

  constructor(config: CDNConfig) {
    this.config = config;
  }

  async uploadAsset(asset: Asset, variant: string = 'original'): Promise<string> {
    const formData = new FormData();
    formData.append('file', await this.getAssetBlob(asset));
    formData.append('path', `agency-toolkit/assets/${asset.id}_${variant}`);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Vercel upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Vercel upload error:', error);
      throw error;
    }
  }

  async deleteAsset(assetId: string, variant: string = 'original'): Promise<boolean> {
    try {
      const response = await fetch(`/api/delete/${assetId}_${variant}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Vercel delete error:', error);
      return false;
    }
  }

  getAssetUrl(assetId: string, variant: string = 'original', transformations?: string): string {
    let url = `${this.config.baseUrl}/agency-toolkit/assets/${assetId}_${variant}`;
    
    if (transformations) {
      url += `?transform=${encodeURIComponent(transformations)}`;
    }
    
    return url;
  }

  async optimizeAsset(asset: Asset, options: OptimizationOptions): Promise<Asset> {
    // Vercel has built-in image optimization
    const optimizedUrl = this.getAssetUrl(asset.id, 'optimized');
    
    return {
      ...asset,
      optimizedUrl,
      isOptimized: true
    };
  }

  async generateThumbnail(asset: Asset, width: number, height: number): Promise<string> {
    const transformations = `w=${width}&h=${height}&q=80&f=webp`;
    return this.getAssetUrl(asset.id, 'thumbnail', transformations);
  }

  private async getAssetBlob(asset: Asset): Promise<Blob> {
    // In a real implementation, this would fetch the asset from storage
    return new Blob(['mock asset data'], { type: asset.mimeType });
  }
}

/**
 * CDN Manager
 * Manages multiple CDN providers and provides unified interface
 */
export class CDNManager {
  private providers: Map<string, CDNProvider> = new Map();
  private activeProvider: string | null = null;
  private analytics: CDNAnalytics = {
    totalRequests: 0,
    totalBandwidth: 0,
    cacheHitRate: 0,
    averageResponseTime: 0,
    topAssets: [],
    errors: []
  };

  /**
   * Register a CDN provider
   */
  registerProvider(provider: CDNProvider): void {
    this.providers.set(provider.name, provider);
  }

  /**
   * Set active provider
   */
  setActiveProvider(providerName: string): boolean {
    if (this.providers.has(providerName)) {
      this.activeProvider = providerName;
      return true;
    }
    return false;
  }

  /**
   * Get active provider
   */
  getActiveProvider(): CDNProvider | null {
    if (this.activeProvider) {
      return this.providers.get(this.activeProvider) || null;
    }
    return null;
  }

  /**
   * Upload asset to CDN
   */
  async uploadAsset(asset: Asset, variant?: string): Promise<string> {
    const provider = this.getActiveProvider();
    if (!provider) {
      throw new Error('No active CDN provider');
    }

    try {
      const startTime = Date.now();
      const url = await provider.uploadAsset(asset, variant);
      const responseTime = Date.now() - startTime;
      
      this.updateAnalytics('upload', responseTime);
      return url;
    } catch (error) {
      this.recordError('upload_failed', error.message);
      throw error;
    }
  }

  /**
   * Delete asset from CDN
   */
  async deleteAsset(assetId: string, variant?: string): Promise<boolean> {
    const provider = this.getActiveProvider();
    if (!provider) {
      throw new Error('No active CDN provider');
    }

    try {
      return await provider.deleteAsset(assetId, variant);
    } catch (error) {
      this.recordError('delete_failed', error.message);
      return false;
    }
  }

  /**
   * Get asset URL with transformations
   */
  getAssetUrl(assetId: string, variant?: string, transformations?: string): string {
    const provider = this.getActiveProvider();
    if (!provider) {
      throw new Error('No active CDN provider');
    }

    return provider.getAssetUrl(assetId, variant, transformations);
  }

  /**
   * Optimize asset
   */
  async optimizeAsset(asset: Asset, options: OptimizationOptions): Promise<Asset> {
    const provider = this.getActiveProvider();
    if (!provider) {
      throw new Error('No active CDN provider');
    }

    try {
      return await provider.optimizeAsset(asset, options);
    } catch (error) {
      this.recordError('optimization_failed', error.message);
      throw error;
    }
  }

  /**
   * Generate thumbnail
   */
  async generateThumbnail(asset: Asset, width: number, height: number): Promise<string> {
    const provider = this.getActiveProvider();
    if (!provider) {
      throw new Error('No active CDN provider');
    }

    try {
      return await provider.generateThumbnail(asset, width, height);
    } catch (error) {
      this.recordError('thumbnail_failed', error.message);
      throw error;
    }
  }

  /**
   * Get CDN analytics
   */
  getAnalytics(): CDNAnalytics {
    return { ...this.analytics };
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Test CDN connection
   */
  async testConnection(providerName?: string): Promise<boolean> {
    const provider = providerName ? this.providers.get(providerName) : this.getActiveProvider();
    if (!provider) return false;

    try {
      // Test with a simple request
      const testUrl = provider.getAssetUrl('test', 'test');
      const response = await fetch(testUrl, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Private helper methods
   */
  private updateAnalytics(operation: string, responseTime: number): void {
    this.analytics.totalRequests++;
    this.analytics.averageResponseTime = 
      (this.analytics.averageResponseTime + responseTime) / 2;
  }

  private recordError(code: string, message: string): void {
    const existingError = this.analytics.errors.find(e => e.code === code);
    if (existingError) {
      existingError.count++;
    } else {
      this.analytics.errors.push({ code, message, count: 1 });
    }
  }
}

// Create global CDN manager instance
export const cdnManager = new CDNManager();

// Initialize with default providers
export const initializeCDN = (config: CDNConfig) => {
  switch (config.provider) {
    case 'cloudinary':
      cdnManager.registerProvider(new CloudinaryProvider(config));
      break;
    case 'aws':
      cdnManager.registerProvider(new AWSS3Provider(config, 'agency-toolkit-assets'));
      break;
    case 'vercel':
      cdnManager.registerProvider(new VercelProvider(config));
      break;
  }
  
  cdnManager.setActiveProvider(config.provider);
};

// Export utility functions
export const uploadToCDN = (asset: Asset, variant?: string) => cdnManager.uploadAsset(asset, variant);
export const deleteFromCDN = (assetId: string, variant?: string) => cdnManager.deleteAsset(assetId, variant);
export const getCDNUrl = (assetId: string, variant?: string, transformations?: string) => 
  cdnManager.getAssetUrl(assetId, variant, transformations);
export const optimizeOnCDN = (asset: Asset, options: OptimizationOptions) => 
  cdnManager.optimizeAsset(asset, options);
export const generateCDNThumbnail = (asset: Asset, width: number, height: number) => 
  cdnManager.generateThumbnail(asset, width, height);
export const getCDNAnalytics = () => cdnManager.getAnalytics();
export const testCDNConnection = (providerName?: string) => cdnManager.testConnection(providerName);
