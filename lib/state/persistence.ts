/**
 * @fileoverview HT-021.3.3: State Persistence Layer Implementation
 * @module lib/state/persistence
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-021.3.3 - State Management Foundation
 * Focus: Comprehensive state persistence with multiple storage backends
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: MEDIUM (data integrity)
 */

import { StateStorage } from 'zustand/middleware';
import { AppState } from './zustand-store';

// ============================================================================
// STORAGE TYPES AND INTERFACES
// ============================================================================

export type StorageBackend = 'localStorage' | 'sessionStorage' | 'indexedDB' | 'memory' | 'hybrid';

export interface StorageConfig {
  backend: StorageBackend;
  prefix?: string;
  version?: number;
  encryption?: boolean;
  compression?: boolean;
  migration?: (oldState: any, version: number) => any;
  whitelist?: string[];
  blacklist?: string[];
  debounceMs?: number;
  maxSize?: number;
}

export interface PersistenceMetadata {
  version: number;
  timestamp: number;
  checksum?: string;
  compressed?: boolean;
  encrypted?: boolean;
}

export interface StorageItem<T = any> {
  data: T;
  metadata: PersistenceMetadata;
}

export interface StorageAdapter {
  getItem(key: string): Promise<string | null> | string | null;
  setItem(key: string, value: string): Promise<void> | void;
  removeItem(key: string): Promise<void> | void;
  clear(): Promise<void> | void;
  getAllKeys?(): Promise<string[]> | string[];
  getSize?(): Promise<number> | number;
}

// ============================================================================
// STORAGE ADAPTERS
// ============================================================================

class LocalStorageAdapter implements StorageAdapter {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('LocalStorage getItem error:', error);
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('LocalStorage setItem error:', error);
      // Handle quota exceeded error
      if (error instanceof DOMException && error.code === DOMException.QUOTA_EXCEEDED_ERR) {
        this.cleanup();
        try {
          localStorage.setItem(key, value);
        } catch (retryError) {
          console.error('LocalStorage retry failed:', retryError);
        }
      }
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('LocalStorage removeItem error:', error);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('LocalStorage clear error:', error);
    }
  }

  getAllKeys(): string[] {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('LocalStorage getAllKeys error:', error);
      return [];
    }
  }

  getSize(): number {
    try {
      let size = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          size += localStorage[key].length + key.length;
        }
      }
      return size;
    } catch (error) {
      console.error('LocalStorage getSize error:', error);
      return 0;
    }
  }

  private cleanup(): void {
    try {
      // Remove old items based on timestamp
      const keys = this.getAllKeys();
      const items = keys.map(key => ({
        key,
        item: this.parseStorageItem(localStorage.getItem(key)),
      })).filter(({ item }) => item !== null);

      // Sort by timestamp and remove oldest 25%
      items.sort((a, b) => (a.item?.metadata?.timestamp || 0) - (b.item?.metadata?.timestamp || 0));
      const toRemove = Math.ceil(items.length * 0.25);
      
      for (let i = 0; i < toRemove; i++) {
        this.removeItem(items[i].key);
      }
    } catch (error) {
      console.error('LocalStorage cleanup error:', error);
    }
  }

  private parseStorageItem(value: string | null): StorageItem | null {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
}

class SessionStorageAdapter implements StorageAdapter {
  getItem(key: string): string | null {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.error('SessionStorage getItem error:', error);
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.error('SessionStorage setItem error:', error);
    }
  }

  removeItem(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('SessionStorage removeItem error:', error);
    }
  }

  clear(): void {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('SessionStorage clear error:', error);
    }
  }

  getAllKeys(): string[] {
    try {
      return Object.keys(sessionStorage);
    } catch (error) {
      console.error('SessionStorage getAllKeys error:', error);
      return [];
    }
  }

  getSize(): number {
    try {
      let size = 0;
      for (const key in sessionStorage) {
        if (sessionStorage.hasOwnProperty(key)) {
          size += sessionStorage[key].length + key.length;
        }
      }
      return size;
    } catch (error) {
      console.error('SessionStorage getSize error:', error);
      return 0;
    }
  }
}

class IndexedDBAdapter implements StorageAdapter {
  private dbName: string;
  private dbVersion: number;
  private storeName: string;

  constructor(dbName = 'AppStateDB', dbVersion = 1, storeName = 'state') {
    this.dbName = dbName;
    this.dbVersion = dbVersion;
    this.storeName = storeName;
  }

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          store.createIndex('timestamp', 'metadata.timestamp', { unique: false });
        }
      };
    });
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const result = request.result;
          resolve(result ? result.value : null);
        };
      });
    } catch (error) {
      console.error('IndexedDB getItem error:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.put({ key, value, timestamp: Date.now() });
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('IndexedDB setItem error:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.delete(key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('IndexedDB removeItem error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.clear();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('IndexedDB clear error:', error);
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.getAllKeys();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result as string[]);
      });
    } catch (error) {
      console.error('IndexedDB getAllKeys error:', error);
      return [];
    }
  }
}

class MemoryAdapter implements StorageAdapter {
  private storage: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.storage.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }

  getAllKeys(): string[] {
    return Array.from(this.storage.keys());
  }

  getSize(): number {
    let size = 0;
    for (const [key, value] of this.storage) {
      size += key.length + value.length;
    }
    return size;
  }
}

class HybridAdapter implements StorageAdapter {
  private primary: StorageAdapter;
  private fallback: StorageAdapter;

  constructor(primary: StorageAdapter, fallback: StorageAdapter) {
    this.primary = primary;
    this.fallback = fallback;
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const result = await this.primary.getItem(key);
      return result;
    } catch (error) {
      console.warn('Primary storage failed, using fallback:', error);
      return this.fallback.getItem(key);
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await this.primary.setItem(key, value);
      // Also store in fallback for redundancy
      await this.fallback.setItem(key, value);
    } catch (error) {
      console.warn('Primary storage failed, using fallback only:', error);
      await this.fallback.setItem(key, value);
    }
  }

  async removeItem(key: string): Promise<void> {
    await Promise.allSettled([
      this.primary.removeItem(key),
      this.fallback.removeItem(key),
    ]);
  }

  async clear(): Promise<void> {
    await Promise.allSettled([
      this.primary.clear(),
      this.fallback.clear(),
    ]);
  }

  async getAllKeys(): Promise<string[]> {
    try {
      return await this.primary.getAllKeys?.() || [];
    } catch (error) {
      return this.fallback.getAllKeys?.() || [];
    }
  }
}

// ============================================================================
// STORAGE MANAGER
// ============================================================================

export class StorageManager {
  private adapter: StorageAdapter;
  private config: StorageConfig;

  constructor(config: StorageConfig) {
    this.config = {
      prefix: 'app-state',
      version: 1,
      debounceMs: 300,
      maxSize: 5 * 1024 * 1024, // 5MB
      ...config,
    };
    
    this.adapter = this.createAdapter(config.backend);
  }

  private createAdapter(backend: StorageBackend): StorageAdapter {
    switch (backend) {
      case 'localStorage':
        return new LocalStorageAdapter();
      case 'sessionStorage':
        return new SessionStorageAdapter();
      case 'indexedDB':
        return new IndexedDBAdapter();
      case 'memory':
        return new MemoryAdapter();
      case 'hybrid':
        return new HybridAdapter(
          new IndexedDBAdapter(),
          new LocalStorageAdapter()
        );
      default:
        throw new Error(`Unsupported storage backend: ${backend}`);
    }
  }

  private getStorageKey(key: string): string {
    return `${this.config.prefix}:${key}`;
  }

  private createStorageItem<T>(data: T): StorageItem<T> {
    return {
      data,
      metadata: {
        version: this.config.version!,
        timestamp: Date.now(),
        compressed: this.config.compression || false,
        encrypted: this.config.encryption || false,
      },
    };
  }

  private async serializeData<T>(data: T): Promise<string> {
    let serialized = JSON.stringify(data);
    
    // Apply compression if enabled
    if (this.config.compression) {
      serialized = await this.compress(serialized);
    }
    
    // Apply encryption if enabled
    if (this.config.encryption) {
      serialized = await this.encrypt(serialized);
    }
    
    return serialized;
  }

  private async deserializeData<T>(serialized: string): Promise<T> {
    let data = serialized;
    
    // Apply decryption if needed
    if (this.config.encryption) {
      data = await this.decrypt(data);
    }
    
    // Apply decompression if needed
    if (this.config.compression) {
      data = await this.decompress(data);
    }
    
    return JSON.parse(data);
  }

  private async compress(data: string): Promise<string> {
    // Simple compression using native compression API if available
    if (typeof CompressionStream !== 'undefined') {
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();
      
      writer.write(new TextEncoder().encode(data));
      writer.close();
      
      const chunks: Uint8Array[] = [];
      let done = false;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) chunks.push(value);
      }
      
      const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        compressed.set(chunk, offset);
        offset += chunk.length;
      }
      
      return btoa(String.fromCharCode(...compressed));
    }
    
    // Fallback: no compression
    return data;
  }

  private async decompress(data: string): Promise<string> {
    // Simple decompression using native decompression API if available
    if (typeof DecompressionStream !== 'undefined') {
      const compressed = new Uint8Array(atob(data).split('').map(c => c.charCodeAt(0)));
      const stream = new DecompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();
      
      writer.write(compressed);
      writer.close();
      
      const chunks: Uint8Array[] = [];
      let done = false;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) chunks.push(value);
      }
      
      const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        decompressed.set(chunk, offset);
        offset += chunk.length;
      }
      
      return new TextDecoder().decode(decompressed);
    }
    
    // Fallback: no decompression
    return data;
  }

  private async encrypt(data: string): Promise<string> {
    // Simple encryption using Web Crypto API
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const key = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        new TextEncoder().encode(data)
      );
      
      // Store key and IV with encrypted data (in practice, you'd use a more secure key management)
      const keyData = await crypto.subtle.exportKey('raw', key);
      return btoa(JSON.stringify({
        encrypted: Array.from(new Uint8Array(encrypted)),
        key: Array.from(new Uint8Array(keyData)),
        iv: Array.from(iv),
      }));
    }
    
    // Fallback: no encryption
    return data;
  }

  private async decrypt(data: string): Promise<string> {
    // Simple decryption using Web Crypto API
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      try {
        const { encrypted, key: keyData, iv } = JSON.parse(atob(data));
        
        const key = await crypto.subtle.importKey(
          'raw',
          new Uint8Array(keyData),
          { name: 'AES-GCM', length: 256 },
          true,
          ['encrypt', 'decrypt']
        );
        
        const decrypted = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: new Uint8Array(iv) },
          key,
          new Uint8Array(encrypted)
        );
        
        return new TextDecoder().decode(decrypted);
      } catch (error) {
        console.error('Decryption failed:', error);
        throw error;
      }
    }
    
    // Fallback: no decryption
    return data;
  }

  private shouldPersist(key: string, data: any): boolean {
    // Check whitelist
    if (this.config.whitelist && !this.config.whitelist.includes(key)) {
      return false;
    }
    
    // Check blacklist
    if (this.config.blacklist && this.config.blacklist.includes(key)) {
      return false;
    }
    
    // Check size limit
    const serialized = JSON.stringify(data);
    if (this.config.maxSize && serialized.length > this.config.maxSize) {
      console.warn(`Data too large for key ${key}: ${serialized.length} bytes`);
      return false;
    }
    
    return true;
  }

  async getItem<T = any>(key: string): Promise<T | null> {
    try {
      const storageKey = this.getStorageKey(key);
      const serialized = await this.adapter.getItem(storageKey);
      
      if (!serialized) return null;
      
      const storageItem: StorageItem<T> = JSON.parse(serialized);
      
      // Check version compatibility
      if (storageItem.metadata.version !== this.config.version) {
        if (this.config.migration) {
          const migrated = this.config.migration(storageItem.data, storageItem.metadata.version);
          await this.setItem(key, migrated);
          return migrated;
        } else {
          // Remove incompatible data
          await this.removeItem(key);
          return null;
        }
      }
      
      return await this.deserializeData(JSON.stringify(storageItem.data));
    } catch (error) {
      console.error(`Failed to get item ${key}:`, error);
      return null;
    }
  }

  private debounceTimers = new Map<string, NodeJS.Timeout>();

  async setItem<T>(key: string, data: T): Promise<void> {
    if (!this.shouldPersist(key, data)) return;

    const storageKey = this.getStorageKey(key);
    
    // Clear existing debounce timer
    if (this.debounceTimers.has(storageKey)) {
      clearTimeout(this.debounceTimers.get(storageKey));
    }
    
    // Set up debounced save
    const timer = setTimeout(async () => {
      try {
        const storageItem = this.createStorageItem(data);
        const serialized = JSON.stringify(storageItem);
        await this.adapter.setItem(storageKey, serialized);
        this.debounceTimers.delete(storageKey);
      } catch (error) {
        console.error(`Failed to set item ${key}:`, error);
      }
    }, this.config.debounceMs);
    
    this.debounceTimers.set(storageKey, timer);
  }

  async removeItem(key: string): Promise<void> {
    try {
      const storageKey = this.getStorageKey(key);
      
      // Clear debounce timer if exists
      if (this.debounceTimers.has(storageKey)) {
        clearTimeout(this.debounceTimers.get(storageKey));
        this.debounceTimers.delete(storageKey);
      }
      
      await this.adapter.removeItem(storageKey);
    } catch (error) {
      console.error(`Failed to remove item ${key}:`, error);
    }
  }

  async clear(): Promise<void> {
    try {
      // Clear all debounce timers
      this.debounceTimers.forEach(timer => clearTimeout(timer));
      this.debounceTimers.clear();
      
      await this.adapter.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }

  async getSize(): Promise<number> {
    if (this.adapter.getSize) {
      return this.adapter.getSize();
    }
    return 0;
  }

  // Immediate save (bypasses debouncing)
  async flush<T>(key: string, data: T): Promise<void> {
    const storageKey = this.getStorageKey(key);
    
    // Clear debounce timer
    if (this.debounceTimers.has(storageKey)) {
      clearTimeout(this.debounceTimers.get(storageKey));
      this.debounceTimers.delete(storageKey);
    }
    
    try {
      const storageItem = this.createStorageItem(data);
      const serialized = JSON.stringify(storageItem);
      await this.adapter.setItem(storageKey, serialized);
    } catch (error) {
      console.error(`Failed to flush item ${key}:`, error);
    }
  }
}

// ============================================================================
// ZUSTAND STORAGE IMPLEMENTATION
// ============================================================================

export function createPersistentStorage(config: StorageConfig): StateStorage {
  const storageManager = new StorageManager(config);
  
  return {
    getItem: async (name: string): Promise<string | null> => {
      return storageManager.getItem(name);
    },
    setItem: async (name: string, value: string): Promise<void> => {
      return storageManager.setItem(name, value);
    },
    removeItem: async (name: string): Promise<void> => {
      return storageManager.removeItem(name);
    },
  };
}

// ============================================================================
// STATE PARTITIONING
// ============================================================================

export function createPartitionedStorage(partitions: Record<string, StorageConfig>): Record<string, StateStorage> {
  const storages: Record<string, StateStorage> = {};
  
  for (const [key, config] of Object.entries(partitions)) {
    storages[key] = createPersistentStorage(config);
  }
  
  return storages;
}

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

export const defaultStorageConfigs = {
  // Fast, session-based storage for UI state
  ui: {
    backend: 'sessionStorage' as StorageBackend,
    prefix: 'app-ui',
    whitelist: ['theme', 'sidebar', 'preferences'],
    debounceMs: 100,
  },
  
  // Persistent storage for user data
  user: {
    backend: 'localStorage' as StorageBackend,
    prefix: 'app-user',
    encryption: true,
    whitelist: ['profile', 'preferences', 'permissions'],
    debounceMs: 500,
  },
  
  // Large data storage for application data
  data: {
    backend: 'indexedDB' as StorageBackend,
    prefix: 'app-data',
    compression: true,
    whitelist: ['heroTasks', 'designTokens', 'components'],
    maxSize: 10 * 1024 * 1024, // 10MB
    debounceMs: 1000,
  },
  
  // Memory-only storage for forms (no persistence)
  forms: {
    backend: 'memory' as StorageBackend,
    prefix: 'app-forms',
    debounceMs: 50,
  },
  
  // Hybrid storage for critical data
  critical: {
    backend: 'hybrid' as StorageBackend,
    prefix: 'app-critical',
    encryption: true,
    compression: true,
    debounceMs: 100,
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  StorageManager,
  createPersistentStorage,
  createPartitionedStorage,
  defaultStorageConfigs,
  // Adapters
  LocalStorageAdapter,
  SessionStorageAdapter,
  IndexedDBAdapter,
  MemoryAdapter,
  HybridAdapter,
};