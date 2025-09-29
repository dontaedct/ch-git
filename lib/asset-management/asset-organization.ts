/**
 * @fileoverview Asset Organization and Tagging System
 * Phase 4.2: Advanced asset organization with smart tagging and categorization
 */

import type { Asset, AssetCategory, AssetType } from './asset-manager';

// Organization Interfaces
export interface AssetCollection {
  id: string;
  name: string;
  description?: string;
  assets: string[]; // Asset IDs
  tags: string[];
  category: AssetCategory;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  coverAsset?: string; // Asset ID for collection cover
}

export interface AssetTag {
  id: string;
  name: string;
  color: string;
  description?: string;
  category: 'brand' | 'style' | 'content' | 'technical' | 'custom';
  usageCount: number;
  createdAt: Date;
  createdBy: string;
}

export interface AssetFolder {
  id: string;
  name: string;
  parentId?: string;
  path: string;
  assets: string[];
  subfolders: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface SmartTag {
  id: string;
  name: string;
  rules: TagRule[];
  autoApply: boolean;
  description?: string;
  createdAt: Date;
  createdBy: string;
}

export interface TagRule {
  field: 'name' | 'type' | 'size' | 'dimensions' | 'metadata' | 'usage';
  operator: 'contains' | 'equals' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'between';
  value: any;
  value2?: any; // For 'between' operator
}

export interface AssetAnalytics {
  totalAssets: number;
  totalSize: number;
  assetsByType: Record<AssetType, number>;
  assetsByCategory: Record<AssetCategory, number>;
  mostUsedTags: Array<{ tag: string; count: number }>;
  recentUploads: Asset[];
  storageUsage: {
    total: number;
    byType: Record<AssetType, number>;
    byCategory: Record<AssetCategory, number>;
  };
  usageStats: {
    totalViews: number;
    totalDownloads: number;
    mostViewed: Asset[];
    mostDownloaded: Asset[];
  };
}

/**
 * Asset Organization Manager
 * Handles collections, folders, tags, and smart organization
 */
export class AssetOrganizationManager {
  private collections: Map<string, AssetCollection> = new Map();
  private tags: Map<string, AssetTag> = new Map();
  private folders: Map<string, AssetFolder> = new Map();
  private smartTags: Map<string, SmartTag> = new Map();
  private assetManager: any; // Reference to AssetManager

  constructor(assetManager: any) {
    this.assetManager = assetManager;
    this.initializeDefaultTags();
    this.initializeDefaultFolders();
  }

  /**
   * Create a new asset collection
   */
  createCollection(
    name: string,
    description?: string,
    category: AssetCategory = 'other',
    isPublic: boolean = true
  ): AssetCollection {
    const id = this.generateId('collection');
    const collection: AssetCollection = {
      id,
      name,
      description,
      assets: [],
      tags: [],
      category,
      isPublic,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current-user'
    };

    this.collections.set(id, collection);
    return collection;
  }

  /**
   * Add assets to collection
   */
  addAssetsToCollection(collectionId: string, assetIds: string[]): boolean {
    const collection = this.collections.get(collectionId);
    if (!collection) return false;

    const newAssets = assetIds.filter(id => !collection.assets.includes(id));
    collection.assets.push(...newAssets);
    collection.updatedAt = new Date();
    
    this.collections.set(collectionId, collection);
    return true;
  }

  /**
   * Remove assets from collection
   */
  removeAssetsFromCollection(collectionId: string, assetIds: string[]): boolean {
    const collection = this.collections.get(collectionId);
    if (!collection) return false;

    collection.assets = collection.assets.filter(id => !assetIds.includes(id));
    collection.updatedAt = new Date();
    
    this.collections.set(collectionId, collection);
    return true;
  }

  /**
   * Create a new tag
   */
  createTag(
    name: string,
    color: string = '#3b82f6',
    category: AssetTag['category'] = 'custom',
    description?: string
  ): AssetTag {
    const id = this.generateId('tag');
    const tag: AssetTag = {
      id,
      name,
      color,
      description,
      category,
      usageCount: 0,
      createdAt: new Date(),
      createdBy: 'current-user'
    };

    this.tags.set(id, tag);
    return tag;
  }

  /**
   * Apply tags to assets
   */
  applyTagsToAssets(assetIds: string[], tagNames: string[]): boolean {
    let success = true;
    
    for (const assetId of assetIds) {
      const asset = this.assetManager.getAsset(assetId);
      if (!asset) {
        success = false;
        continue;
      }

      // Add new tags
      const newTags = tagNames.filter(tag => !asset.tags.includes(tag));
      asset.tags.push(...newTags);
      
      // Update tag usage counts
      for (const tagName of newTags) {
        const tag = this.getTagByName(tagName);
        if (tag) {
          tag.usageCount++;
        }
      }

      this.assetManager.updateAsset(assetId, { tags: asset.tags });
    }

    return success;
  }

  /**
   * Remove tags from assets
   */
  removeTagsFromAssets(assetIds: string[], tagNames: string[]): boolean {
    let success = true;
    
    for (const assetId of assetIds) {
      const asset = this.assetManager.getAsset(assetId);
      if (!asset) {
        success = false;
        continue;
      }

      // Remove tags
      asset.tags = asset.tags.filter(tag => !tagNames.includes(tag));
      
      // Update tag usage counts
      for (const tagName of tagNames) {
        const tag = this.getTagByName(tagName);
        if (tag && tag.usageCount > 0) {
          tag.usageCount--;
        }
      }

      this.assetManager.updateAsset(assetId, { tags: asset.tags });
    }

    return success;
  }

  /**
   * Create a new folder
   */
  createFolder(
    name: string,
    parentId?: string,
    path?: string
  ): AssetFolder {
    const id = this.generateId('folder');
    const fullPath = path || (parentId ? `${this.getFolderPath(parentId)}/${name}` : name);
    
    const folder: AssetFolder = {
      id,
      name,
      parentId,
      path: fullPath,
      assets: [],
      subfolders: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current-user'
    };

    this.folders.set(id, folder);
    
    // Update parent folder
    if (parentId) {
      const parentFolder = this.folders.get(parentId);
      if (parentFolder) {
        parentFolder.subfolders.push(id);
        this.folders.set(parentId, parentFolder);
      }
    }

    return folder;
  }

  /**
   * Move assets to folder
   */
  moveAssetsToFolder(assetIds: string[], folderId: string): boolean {
    const folder = this.folders.get(folderId);
    if (!folder) return false;

    // Remove from current folders
    for (const assetId of assetIds) {
      this.removeAssetFromAllFolders(assetId);
    }

    // Add to new folder
    folder.assets.push(...assetIds);
    folder.updatedAt = new Date();
    
    this.folders.set(folderId, folder);
    return true;
  }

  /**
   * Create a smart tag
   */
  createSmartTag(
    name: string,
    rules: TagRule[],
    autoApply: boolean = false,
    description?: string
  ): SmartTag {
    const id = this.generateId('smarttag');
    const smartTag: SmartTag = {
      id,
      name,
      rules,
      autoApply,
      description,
      createdAt: new Date(),
      createdBy: 'current-user'
    };

    this.smartTags.set(id, smartTag);
    
    if (autoApply) {
      this.applySmartTag(id);
    }

    return smartTag;
  }

  /**
   * Apply smart tag to matching assets
   */
  applySmartTag(smartTagId: string): { applied: number; total: number } {
    const smartTag = this.smartTags.get(smartTagId);
    if (!smartTag) return { applied: 0, total: 0 };

    const allAssets = this.assetManager.searchAssets();
    let appliedCount = 0;

    for (const asset of allAssets) {
      if (this.assetMatchesRules(asset, smartTag.rules)) {
        if (!asset.tags.includes(smartTag.name)) {
          asset.tags.push(smartTag.name);
          this.assetManager.updateAsset(asset.id, { tags: asset.tags });
          appliedCount++;
        }
      }
    }

    return { applied: appliedCount, total: allAssets.length };
  }

  /**
   * Get asset analytics
   */
  getAssetAnalytics(): AssetAnalytics {
    const allAssets = this.assetManager.searchAssets();
    
    const analytics: AssetAnalytics = {
      totalAssets: allAssets.length,
      totalSize: allAssets.reduce((sum, asset) => sum + asset.size, 0),
      assetsByType: {} as Record<AssetType, number>,
      assetsByCategory: {} as Record<AssetCategory, number>,
      mostUsedTags: [],
      recentUploads: allAssets
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 10),
      storageUsage: {
        total: 0,
        byType: {} as Record<AssetType, number>,
        byCategory: {} as Record<AssetCategory, number>
      },
      usageStats: {
        totalViews: 0,
        totalDownloads: 0,
        mostViewed: [],
        mostDownloaded: []
      }
    };

    // Calculate type and category distributions
    for (const asset of allAssets) {
      analytics.assetsByType[asset.type] = (analytics.assetsByType[asset.type] || 0) + 1;
      analytics.assetsByCategory[asset.category] = (analytics.assetsByCategory[asset.category] || 0) + 1;
      
      analytics.storageUsage.byType[asset.type] = (analytics.storageUsage.byType[asset.type] || 0) + asset.size;
      analytics.storageUsage.byCategory[asset.category] = (analytics.storageUsage.byCategory[asset.category] || 0) + asset.size;
      
      analytics.usageStats.totalViews += asset.usage.totalViews;
      analytics.usageStats.totalDownloads += asset.usage.totalDownloads;
    }

    analytics.storageUsage.total = analytics.totalSize;

    // Get most used tags
    const tagUsage = new Map<string, number>();
    for (const asset of allAssets) {
      for (const tag of asset.tags) {
        tagUsage.set(tag, (tagUsage.get(tag) || 0) + 1);
      }
    }
    
    analytics.mostUsedTags = Array.from(tagUsage.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get most viewed and downloaded assets
    analytics.usageStats.mostViewed = allAssets
      .sort((a, b) => b.usage.totalViews - a.usage.totalViews)
      .slice(0, 10);
    
    analytics.usageStats.mostDownloaded = allAssets
      .sort((a, b) => b.usage.totalDownloads - a.usage.totalDownloads)
      .slice(0, 10);

    return analytics;
  }

  /**
   * Search collections
   */
  searchCollections(query?: string, category?: AssetCategory): AssetCollection[] {
    let collections = Array.from(this.collections.values());

    if (query) {
      const searchQuery = query.toLowerCase();
      collections = collections.filter(collection =>
        collection.name.toLowerCase().includes(searchQuery) ||
        collection.description?.toLowerCase().includes(searchQuery) ||
        collection.tags.some(tag => tag.toLowerCase().includes(searchQuery))
      );
    }

    if (category) {
      collections = collections.filter(collection => collection.category === category);
    }

    return collections.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  /**
   * Get folder tree structure
   */
  getFolderTree(): AssetFolder[] {
    const rootFolders = Array.from(this.folders.values())
      .filter(folder => !folder.parentId)
      .sort((a, b) => a.name.localeCompare(b.name));

    return this.buildFolderTree(rootFolders);
  }

  /**
   * Get all tags with usage statistics
   */
  getAllTags(): AssetTag[] {
    return Array.from(this.tags.values()).sort((a, b) => b.usageCount - a.usageCount);
  }

  /**
   * Get tags by category
   */
  getTagsByCategory(category: AssetTag['category']): AssetTag[] {
    return Array.from(this.tags.values())
      .filter(tag => tag.category === category)
      .sort((a, b) => b.usageCount - a.usageCount);
  }

  /**
   * Delete collection
   */
  deleteCollection(collectionId: string): boolean {
    return this.collections.delete(collectionId);
  }

  /**
   * Delete tag
   */
  deleteTag(tagId: string): boolean {
    const tag = this.tags.get(tagId);
    if (!tag) return false;

    // Remove tag from all assets
    const allAssets = this.assetManager.searchAssets();
    for (const asset of allAssets) {
      if (asset.tags.includes(tag.name)) {
        asset.tags = asset.tags.filter(t => t !== tag.name);
        this.assetManager.updateAsset(asset.id, { tags: asset.tags });
      }
    }

    return this.tags.delete(tagId);
  }

  /**
   * Delete folder
   */
  deleteFolder(folderId: string): boolean {
    const folder = this.folders.get(folderId);
    if (!folder) return false;

    // Move assets to parent folder or root
    if (folder.assets.length > 0) {
      if (folder.parentId) {
        this.moveAssetsToFolder(folder.assets, folder.parentId);
      } else {
        // Remove from all folders (move to root)
        for (const assetId of folder.assets) {
          this.removeAssetFromAllFolders(assetId);
        }
      }
    }

    // Move subfolders to parent
    if (folder.subfolders.length > 0) {
      for (const subfolderId of folder.subfolders) {
        const subfolder = this.folders.get(subfolderId);
        if (subfolder) {
          subfolder.parentId = folder.parentId;
          this.folders.set(subfolderId, subfolder);
        }
      }
    }

    // Remove from parent folder
    if (folder.parentId) {
      const parentFolder = this.folders.get(folder.parentId);
      if (parentFolder) {
        parentFolder.subfolders = parentFolder.subfolders.filter(id => id !== folderId);
        this.folders.set(folder.parentId, parentFolder);
      }
    }

    return this.folders.delete(folderId);
  }

  /**
   * Private helper methods
   */
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getTagByName(name: string): AssetTag | undefined {
    return Array.from(this.tags.values()).find(tag => tag.name === name);
  }

  private getFolderPath(folderId: string): string {
    const folder = this.folders.get(folderId);
    if (!folder) return '';
    
    if (folder.parentId) {
      return `${this.getFolderPath(folder.parentId)}/${folder.name}`;
    }
    
    return folder.name;
  }

  private removeAssetFromAllFolders(assetId: string): void {
    for (const folder of this.folders.values()) {
      const index = folder.assets.indexOf(assetId);
      if (index > -1) {
        folder.assets.splice(index, 1);
        folder.updatedAt = new Date();
        this.folders.set(folder.id, folder);
      }
    }
  }

  private assetMatchesRules(asset: Asset, rules: TagRule[]): boolean {
    return rules.every(rule => this.evaluateRule(asset, rule));
  }

  private evaluateRule(asset: Asset, rule: TagRule): boolean {
    let value: any;

    switch (rule.field) {
      case 'name':
        value = asset.name;
        break;
      case 'type':
        value = asset.type;
        break;
      case 'size':
        value = asset.size;
        break;
      case 'dimensions':
        value = asset.dimensions;
        break;
      case 'metadata':
        value = asset.metadata;
        break;
      case 'usage':
        value = asset.usage;
        break;
      default:
        return false;
    }

    switch (rule.operator) {
      case 'contains':
        return String(value).toLowerCase().includes(String(rule.value).toLowerCase());
      case 'equals':
        return value === rule.value;
      case 'starts_with':
        return String(value).toLowerCase().startsWith(String(rule.value).toLowerCase());
      case 'ends_with':
        return String(value).toLowerCase().endsWith(String(rule.value).toLowerCase());
      case 'greater_than':
        return Number(value) > Number(rule.value);
      case 'less_than':
        return Number(value) < Number(rule.value);
      case 'between':
        return Number(value) >= Number(rule.value) && Number(value) <= Number(rule.value2);
      default:
        return false;
    }
  }

  private buildFolderTree(folders: AssetFolder[]): AssetFolder[] {
    return folders.map(folder => ({
      ...folder,
      subfolders: this.buildFolderTree(
        Array.from(this.folders.values())
          .filter(f => f.parentId === folder.id)
          .sort((a, b) => a.name.localeCompare(b.name))
      )
    }));
  }

  private initializeDefaultTags(): void {
    const defaultTags = [
      { name: 'logo', color: '#ef4444', category: 'brand' as const },
      { name: 'icon', color: '#f59e0b', category: 'style' as const },
      { name: 'hero', color: '#10b981', category: 'content' as const },
      { name: 'background', color: '#6366f1', category: 'style' as const },
      { name: 'product', color: '#8b5cf6', category: 'content' as const },
      { name: 'team', color: '#ec4899', category: 'content' as const },
      { name: 'high-res', color: '#06b6d4', category: 'technical' as const },
      { name: 'vector', color: '#84cc16', category: 'technical' as const }
    ];

    for (const tagData of defaultTags) {
      this.createTag(tagData.name, tagData.color, tagData.category);
    }
  }

  private initializeDefaultFolders(): void {
    const defaultFolders = [
      { name: 'Brand Assets', path: 'brand-assets' },
      { name: 'UI Elements', path: 'ui-elements' },
      { name: 'Content Images', path: 'content-images' },
      { name: 'Marketing Materials', path: 'marketing-materials' },
      { name: 'Social Media', path: 'social-media' }
    ];

    for (const folderData of defaultFolders) {
      this.createFolder(folderData.name, undefined, folderData.path);
    }
  }
}

// Export utility functions
export const createAssetOrganizationManager = (assetManager: any) => 
  new AssetOrganizationManager(assetManager);
