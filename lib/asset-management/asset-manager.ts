/**
 * @fileoverview Brand Asset Management System
 * Phase 4.2: Comprehensive asset management with optimization, versioning, and CDN integration
 */

// Asset Types and Interfaces
export interface Asset {
  id: string;
  name: string;
  originalName: string;
  type: AssetType;
  mimeType: string;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
  url: string;
  thumbnailUrl?: string;
  optimizedUrl?: string;
  cdnUrl?: string;
  tags: string[];
  category: AssetCategory;
  metadata: AssetMetadata;
  versions: AssetVersion[];
  currentVersion: number;
  usage: AssetUsage;
  createdAt: Date;
  updatedAt: Date;
  uploadedBy: string;
  isPublic: boolean;
  isOptimized: boolean;
}

export interface AssetVersion {
  version: number;
  url: string;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
  createdAt: Date;
  changes: string;
  isActive: boolean;
}

export interface AssetMetadata {
  alt?: string;
  description?: string;
  keywords?: string[];
  colorPalette?: string[];
  dominantColor?: string;
  format: string;
  quality: number;
  compressionLevel: number;
  hasTransparency: boolean;
  isAnimated?: boolean;
  frameCount?: number;
  duration?: number;
}

export interface AssetUsage {
  totalViews: number;
  totalDownloads: number;
  lastAccessed: Date;
  usedInPages: string[];
  usedInComponents: string[];
  usedInThemes: string[];
}

export type AssetType = 'image' | 'video' | 'audio' | 'document' | 'font' | 'icon' | 'logo' | 'pattern' | 'other';
export type AssetCategory = 'branding' | 'ui' | 'content' | 'marketing' | 'social' | 'print' | 'web' | 'mobile' | 'other';

// Upload Configuration
export interface UploadConfig {
  maxFileSize: number;
  allowedTypes: string[];
  maxDimensions?: {
    width: number;
    height: number;
  };
  quality: number;
  compressionLevel: number;
  generateThumbnails: boolean;
  optimizeImages: boolean;
  generateWebP: boolean;
  generateAVIF: boolean;
}

// CDN Configuration
export interface CDNConfig {
  provider: 'cloudinary' | 'aws' | 'vercel' | 'custom';
  baseUrl: string;
  apiKey?: string;
  apiSecret?: string;
  transformations: {
    thumbnail: string;
    optimized: string;
    webp: string;
    avif: string;
  };
}

// Search and Filter Options
export interface AssetSearchOptions {
  query?: string;
  type?: AssetType;
  category?: AssetCategory;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sizeRange?: {
    min: number;
    max: number;
  };
  dimensions?: {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
  };
  sortBy?: 'name' | 'size' | 'date' | 'usage' | 'type';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Brand Asset Manager Class
 * Comprehensive asset management system with optimization, versioning, and CDN integration
 */
export class AssetManager {
  private assets: Map<string, Asset> = new Map();
  private uploadConfig: UploadConfig;
  private cdnConfig?: CDNConfig;
  private optimizationQueue: string[] = [];
  private isProcessingQueue = false;

  constructor(uploadConfig?: Partial<UploadConfig>, cdnConfig?: CDNConfig) {
    this.uploadConfig = {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif'],
      maxDimensions: { width: 4096, height: 4096 },
      quality: 85,
      compressionLevel: 6,
      generateThumbnails: true,
      optimizeImages: true,
      generateWebP: true,
      generateAVIF: true,
      ...uploadConfig
    };
    this.cdnConfig = cdnConfig;
  }

  /**
   * Upload and process a new asset
   */
  async uploadAsset(
    file: File,
    metadata: Partial<AssetMetadata> = {},
    tags: string[] = [],
    category: AssetCategory = 'other'
  ): Promise<Asset> {
    // Validate file
    this.validateFile(file);

    // Generate unique ID
    const id = this.generateAssetId();
    
    // Create asset object
    const asset: Asset = {
      id,
      name: this.sanitizeFileName(file.name),
      originalName: file.name,
      type: this.getAssetType(file.type),
      mimeType: file.type,
      size: file.size,
      url: '', // Will be set after upload
      tags,
      category,
      metadata: {
        format: this.getFileFormat(file.name),
        quality: this.uploadConfig.quality,
        compressionLevel: this.uploadConfig.compressionLevel,
        hasTransparency: this.hasTransparency(file.type),
        ...metadata
      },
      versions: [],
      currentVersion: 1,
      usage: {
        totalViews: 0,
        totalDownloads: 0,
        lastAccessed: new Date(),
        usedInPages: [],
        usedInComponents: [],
        usedInThemes: []
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      uploadedBy: 'current-user', // In real implementation, get from auth context
      isPublic: true,
      isOptimized: false
    };

    // Process and upload file
    const processedAsset = await this.processAndUploadAsset(asset, file);
    
    // Store asset
    this.assets.set(id, processedAsset);
    
    // Add to optimization queue if needed
    if (this.uploadConfig.optimizeImages && this.isImageAsset(asset)) {
      this.addToOptimizationQueue(id);
    }

    return processedAsset;
  }

  /**
   * Process and upload asset with optimization
   */
  private async processAndUploadAsset(asset: Asset, file: File): Promise<Asset> {
    // Create optimized versions
    const optimizedVersions = await this.createOptimizedVersions(file, asset);
    
    // Upload to storage/CDN
    const uploadResults = await this.uploadToStorage(file, optimizedVersions, asset);
    
    // Update asset with URLs
    asset.url = uploadResults.original;
    asset.thumbnailUrl = uploadResults.thumbnail;
    asset.optimizedUrl = uploadResults.optimized;
    asset.cdnUrl = uploadResults.cdn;
    
    // Set dimensions if it's an image
    if (this.isImageAsset(asset)) {
      asset.dimensions = await this.getImageDimensions(file);
    }

    // Create initial version
    asset.versions.push({
      version: 1,
      url: asset.url,
      size: asset.size,
      dimensions: asset.dimensions,
      createdAt: new Date(),
      changes: 'Initial upload',
      isActive: true
    });

    return asset;
  }

  /**
   * Create optimized versions of the asset
   */
  private async createOptimizedVersions(file: File, asset: Asset): Promise<{
    thumbnail?: Blob;
    optimized?: Blob;
    webp?: Blob;
    avif?: Blob;
  }> {
    const versions: any = {};

    if (!this.isImageAsset(asset)) {
      return versions;
    }

    try {
      // Create thumbnail
      if (this.uploadConfig.generateThumbnails) {
        versions.thumbnail = await this.createThumbnail(file, 300, 300);
      }

      // Create optimized version
      if (this.uploadConfig.optimizeImages) {
        versions.optimized = await this.optimizeImage(file, this.uploadConfig.quality);
      }

      // Create WebP version
      if (this.uploadConfig.generateWebP) {
        versions.webp = await this.convertToWebP(file, this.uploadConfig.quality);
      }

      // Create AVIF version
      if (this.uploadConfig.generateAVIF) {
        versions.avif = await this.convertToAVIF(file, this.uploadConfig.quality);
      }
    } catch (error) {
      console.warn('Error creating optimized versions:', error);
    }

    return versions;
  }

  /**
   * Upload asset to storage/CDN
   */
  private async uploadToStorage(
    originalFile: File,
    optimizedVersions: any,
    asset: Asset
  ): Promise<{
    original: string;
    thumbnail?: string;
    optimized?: string;
    cdn?: string;
  }> {
    const results: any = {};

    if (this.cdnConfig) {
      // Upload to CDN
      results.original = await this.uploadToCDN(originalFile, asset, 'original');
      if (optimizedVersions.thumbnail) {
        results.thumbnail = await this.uploadToCDN(optimizedVersions.thumbnail, asset, 'thumbnail');
      }
      if (optimizedVersions.optimized) {
        results.optimized = await this.uploadToCDN(optimizedVersions.optimized, asset, 'optimized');
      }
      if (optimizedVersions.webp) {
        results.webp = await this.uploadToCDN(optimizedVersions.webp, asset, 'webp');
      }
      if (optimizedVersions.avif) {
        results.avif = await this.uploadToCDN(optimizedVersions.avif, asset, 'avif');
      }
      results.cdn = results.original;
    } else {
      // Upload to local storage (for development)
      results.original = await this.uploadToLocalStorage(originalFile, asset);
      if (optimizedVersions.thumbnail) {
        results.thumbnail = await this.uploadToLocalStorage(optimizedVersions.thumbnail, asset, 'thumbnail');
      }
      if (optimizedVersions.optimized) {
        results.optimized = await this.uploadToLocalStorage(optimizedVersions.optimized, asset, 'optimized');
      }
    }

    return results;
  }

  /**
   * Upload to CDN
   */
  private async uploadToCDN(file: File | Blob, asset: Asset, variant: string): Promise<string> {
    // In a real implementation, this would integrate with Cloudinary, AWS S3, etc.
    // For now, we'll simulate the upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('public_id', `${asset.id}_${variant}`);
    formData.append('folder', 'agency-toolkit/assets');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return `${this.cdnConfig?.baseUrl}/agency-toolkit/assets/${asset.id}_${variant}`;
  }

  /**
   * Upload to local storage (development)
   */
  private async uploadToLocalStorage(file: File | Blob, asset: Asset, variant?: string): Promise<string> {
    // Create object URL for local development
    const url = URL.createObjectURL(file);
    
    // In a real implementation, this would save to a local file system
    // For now, we'll return the object URL
    return url;
  }

  /**
   * Create thumbnail from image
   */
  private async createThumbnail(file: File, width: number, height: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate dimensions maintaining aspect ratio
        const aspectRatio = img.width / img.height;
        let newWidth = width;
        let newHeight = height;

        if (aspectRatio > 1) {
          newHeight = width / aspectRatio;
        } else {
          newWidth = height * aspectRatio;
        }

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, newWidth, newHeight);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create thumbnail'));
            }
          },
          'image/jpeg',
          0.8
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Optimize image quality and size
   */
  private async optimizeImage(file: File, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        ctx?.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to optimize image'));
            }
          },
          file.type,
          quality / 100
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Convert image to WebP format
   */
  private async convertToWebP(file: File, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        ctx?.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert to WebP'));
            }
          },
          'image/webp',
          quality / 100
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Convert image to AVIF format
   */
  private async convertToAVIF(file: File, quality: number): Promise<Blob> {
    // AVIF conversion requires more complex implementation
    // For now, we'll return the original file
    return file;
  }

  /**
   * Get image dimensions
   */
  private async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Search and filter assets
   */
  async searchAssets(options: AssetSearchOptions = {}): Promise<Asset[]> {
    let assets = Array.from(this.assets.values());

    // Apply filters
    if (options.query) {
      const query = options.query.toLowerCase();
      assets = assets.filter(asset => 
        asset.name.toLowerCase().includes(query) ||
        asset.originalName.toLowerCase().includes(query) ||
        asset.tags.some(tag => tag.toLowerCase().includes(query)) ||
        asset.metadata.description?.toLowerCase().includes(query)
      );
    }

    if (options.type) {
      assets = assets.filter(asset => asset.type === options.type);
    }

    if (options.category) {
      assets = assets.filter(asset => asset.category === options.category);
    }

    if (options.tags && options.tags.length > 0) {
      assets = assets.filter(asset => 
        options.tags!.some(tag => asset.tags.includes(tag))
      );
    }

    if (options.dateRange) {
      assets = assets.filter(asset => 
        asset.createdAt >= options.dateRange!.start &&
        asset.createdAt <= options.dateRange!.end
      );
    }

    if (options.sizeRange) {
      assets = assets.filter(asset => 
        asset.size >= options.sizeRange!.min &&
        asset.size <= options.sizeRange!.max
      );
    }

    if (options.dimensions) {
      assets = assets.filter(asset => {
        if (!asset.dimensions) return false;
        const { minWidth, maxWidth, minHeight, maxHeight } = options.dimensions!;
        return (!minWidth || asset.dimensions.width >= minWidth) &&
               (!maxWidth || asset.dimensions.width <= maxWidth) &&
               (!minHeight || asset.dimensions.height >= minHeight) &&
               (!maxHeight || asset.dimensions.height <= maxHeight);
      });
    }

    // Sort results
    if (options.sortBy) {
      assets.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (options.sortBy) {
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          case 'size':
            aValue = a.size;
            bValue = b.size;
            break;
          case 'date':
            aValue = a.createdAt;
            bValue = b.createdAt;
            break;
          case 'usage':
            aValue = a.usage.totalViews;
            bValue = b.usage.totalViews;
            break;
          case 'type':
            aValue = a.type;
            bValue = b.type;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return options.sortOrder === 'desc' ? 1 : -1;
        if (aValue > bValue) return options.sortOrder === 'desc' ? -1 : 1;
        return 0;
      });
    }

    // Apply pagination
    if (options.offset) {
      assets = assets.slice(options.offset);
    }
    if (options.limit) {
      assets = assets.slice(0, options.limit);
    }

    return assets;
  }

  /**
   * Get asset by ID
   */
  getAsset(id: string): Asset | undefined {
    return this.assets.get(id);
  }

  /**
   * Update asset metadata
   */
  async updateAsset(id: string, updates: Partial<Asset>): Promise<Asset | null> {
    const asset = this.assets.get(id);
    if (!asset) return null;

    const updatedAsset = { ...asset, ...updates, updatedAt: new Date() };
    this.assets.set(id, updatedAsset);
    return updatedAsset;
  }

  /**
   * Delete asset
   */
  async deleteAsset(id: string): Promise<boolean> {
    const asset = this.assets.get(id);
    if (!asset) return false;

    // Delete from storage/CDN
    await this.deleteFromStorage(asset);
    
    // Remove from local storage
    this.assets.delete(id);
    return true;
  }

  /**
   * Bulk operations
   */
  async bulkDelete(ids: string[]): Promise<{ success: string[]; failed: string[] }> {
    const results = { success: [] as string[], failed: [] as string[] };
    
    for (const id of ids) {
      try {
        const success = await this.deleteAsset(id);
        if (success) {
          results.success.push(id);
        } else {
          results.failed.push(id);
        }
      } catch (error) {
        results.failed.push(id);
      }
    }
    
    return results;
  }

  async bulkUpdate(ids: string[], updates: Partial<Asset>): Promise<{ success: string[]; failed: string[] }> {
    const results = { success: [] as string[], failed: [] as string[] };
    
    for (const id of ids) {
      try {
        const updated = await this.updateAsset(id, updates);
        if (updated) {
          results.success.push(id);
        } else {
          results.failed.push(id);
        }
      } catch (error) {
        results.failed.push(id);
      }
    }
    
    return results;
  }

  /**
   * Track asset usage
   */
  trackUsage(id: string, context: 'view' | 'download' | 'page' | 'component' | 'theme', contextId?: string): void {
    const asset = this.assets.get(id);
    if (!asset) return;

    asset.usage.lastAccessed = new Date();
    
    if (context === 'view') {
      asset.usage.totalViews++;
    } else if (context === 'download') {
      asset.usage.totalDownloads++;
    } else if (contextId) {
      const contextArray = asset.usage[`usedIn${context.charAt(0).toUpperCase() + context.slice(1)}s` as keyof AssetUsage] as string[];
      if (Array.isArray(contextArray) && !contextArray.includes(contextId)) {
        contextArray.push(contextId);
      }
    }

    this.assets.set(id, asset);
  }

  /**
   * Get asset analytics
   */
  getAssetAnalytics(id: string): AssetUsage | null {
    const asset = this.assets.get(id);
    return asset ? asset.usage : null;
  }

  /**
   * Get all tags
   */
  getAllTags(): string[] {
    const tagSet = new Set<string>();
    this.assets.forEach(asset => {
      asset.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }

  /**
   * Get all categories
   */
  getAllCategories(): AssetCategory[] {
    const categorySet = new Set<AssetCategory>();
    this.assets.forEach(asset => {
      categorySet.add(asset.category);
    });
    return Array.from(categorySet).sort();
  }

  /**
   * Utility methods
   */
  private validateFile(file: File): void {
    if (file.size > this.uploadConfig.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.uploadConfig.maxFileSize / 1024 / 1024}MB`);
    }

    if (!this.uploadConfig.allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed`);
    }

    if (this.uploadConfig.maxDimensions && this.isImageFile(file.type)) {
      // In a real implementation, we would check image dimensions here
    }
  }

  private generateAssetId(): string {
    return `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeFileName(fileName: string): string {
    return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  }

  private getAssetType(mimeType: string): AssetType {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('font')) return 'font';
    if (mimeType.includes('svg')) return 'icon';
    return 'other';
  }

  private getFileFormat(fileName: string): string {
    return fileName.split('.').pop()?.toLowerCase() || 'unknown';
  }

  private hasTransparency(mimeType: string): boolean {
    return ['image/png', 'image/gif', 'image/webp', 'image/svg+xml'].includes(mimeType);
  }

  private isImageAsset(asset: Asset): boolean {
    return asset.type === 'image';
  }

  private isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  private addToOptimizationQueue(assetId: string): void {
    this.optimizationQueue.push(assetId);
    if (!this.isProcessingQueue) {
      this.processOptimizationQueue();
    }
  }

  private async processOptimizationQueue(): Promise<void> {
    this.isProcessingQueue = true;
    
    while (this.optimizationQueue.length > 0) {
      const assetId = this.optimizationQueue.shift();
      if (assetId) {
        await this.optimizeAsset(assetId);
      }
    }
    
    this.isProcessingQueue = false;
  }

  private async optimizeAsset(assetId: string): Promise<void> {
    const asset = this.assets.get(assetId);
    if (!asset || !this.isImageAsset(asset)) return;

    try {
      // Perform additional optimization
      asset.isOptimized = true;
      this.assets.set(assetId, asset);
    } catch (error) {
      console.error('Error optimizing asset:', error);
    }
  }

  private async deleteFromStorage(asset: Asset): Promise<void> {
    // In a real implementation, this would delete from CDN/storage
    // For now, we'll just revoke object URLs
    if (asset.url.startsWith('blob:')) {
      URL.revokeObjectURL(asset.url);
    }
    if (asset.thumbnailUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(asset.thumbnailUrl);
    }
    if (asset.optimizedUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(asset.optimizedUrl);
    }
  }
}

// Create global asset manager instance
export const assetManager = new AssetManager();

// Export utility functions
export const uploadAsset = (file: File, metadata?: Partial<AssetMetadata>, tags?: string[], category?: AssetCategory) =>
  assetManager.uploadAsset(file, metadata, tags, category);

export const searchAssets = (options?: AssetSearchOptions) => assetManager.searchAssets(options);
export const getAsset = (id: string) => assetManager.getAsset(id);
export const updateAsset = (id: string, updates: Partial<Asset>) => assetManager.updateAsset(id, updates);
export const deleteAsset = (id: string) => assetManager.deleteAsset(id);
export const bulkDelete = (ids: string[]) => assetManager.bulkDelete(ids);
export const bulkUpdate = (ids: string[], updates: Partial<Asset>) => assetManager.bulkUpdate(ids, updates);
export const trackUsage = (id: string, context: 'view' | 'download' | 'page' | 'component' | 'theme', contextId?: string) =>
  assetManager.trackUsage(id, context, contextId);
export const getAssetAnalytics = (id: string) => assetManager.getAssetAnalytics(id);
export const getAllTags = () => assetManager.getAllTags();
export const getAllCategories = () => assetManager.getAllCategories();
