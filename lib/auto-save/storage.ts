export interface StorageData {
  key: string;
  value: unknown;
  timestamp: number;
  expiresAt?: number;
}

export interface StorageOptions {
  persistent?: boolean; // Use localStorage instead of sessionStorage
  ttl?: number; // Time to live in milliseconds
  compress?: boolean; // Whether to compress data
  encrypt?: boolean; // Whether to encrypt sensitive data
}

class StorageManager {
  private readonly prefix = 'micro-app-auto-save';
  private readonly maxSize = 10 * 1024 * 1024; // 10MB limit
  private readonly compressionThreshold = 1024; // Compress data larger than 1KB
  private readonly cache = new Map<string, StorageData>();
  private readonly cacheSize = 100; // Maximum cache size
  private lastCleanup = Date.now();
  private readonly cleanupInterval = 5 * 60 * 1000; // Cleanup every 5 minutes

  constructor() {
    this.cleanupExpiredData();
  }

  // Set data with options and caching
  set(key: string, value: unknown, options: StorageOptions = {}): boolean {
    try {
      const storageKey = this.getFullKey(key);
      const data: StorageData = {
        key: storageKey,
        value,
        timestamp: Date.now(),
      };

      // Add expiration if TTL is specified
      if (options.ttl) {
        data.expiresAt = Date.now() + options.ttl;
      }

      // Compress data if enabled and data is large enough
      if (options.compress && this.shouldCompress(value)) {
        data.value = this.compress(JSON.stringify(value));
        data.value = `compressed:${data.value}`;
      }

      // Encrypt data if enabled
      if (options.encrypt) {
        data.value = this.encrypt(JSON.stringify(data.value));
        data.value = `encrypted:${data.value}`;
      }

      // Update cache
      this.updateCache(storageKey, data);

      const serialized = JSON.stringify(data);
      
      // Check size before storing
      if (this.getStorageSize() + serialized.length > this.maxSize) {
        this.cleanupOldData();
      }

      const storage = options.persistent ? localStorage : sessionStorage;
      storage.setItem(storageKey, serialized);
      
      return true;
    } catch (_error) {
      console.warn('Failed to store data:', _error);
      return false;
    }
  }

  // Get data with automatic decompression/decryption and caching
  get(key: string, options: StorageOptions = {}): unknown | null {
    try {
      const storageKey = this.getFullKey(key);
      
      // Check cache first
      const cached = this.cache.get(storageKey);
      if (cached) {
        // Check if cached data has expired
        if (cached.expiresAt && Date.now() > cached.expiresAt) {
          this.cache.delete(storageKey);
          this.remove(key, options);
          return null;
        }
        return this.processValue(cached.value);
      }

      const storage = options.persistent ? localStorage : sessionStorage;
      const serialized = storage.getItem(storageKey);
      
      if (!serialized) return null;

      const data: StorageData = JSON.parse(serialized);
      
      // Check if data has expired
      if (data.expiresAt && Date.now() > data.expiresAt) {
        this.remove(key, options);
        return null;
      }

      // Cache the data
      this.updateCache(storageKey, data);

      return this.processValue(data.value);
    } catch {
      return null;
    }
  }

  // Process value (decompress/decrypt)
  private processValue(value: unknown): unknown {
    let processedValue = value;

    // Decrypt if needed
    if (typeof processedValue === 'string' && processedValue.startsWith('encrypted:')) {
      processedValue = this.decrypt(processedValue.replace('encrypted:', ''));
      processedValue = JSON.parse(processedValue as string);
    }

    // Decompress if needed
    if (typeof processedValue === 'string' && processedValue.startsWith('compressed:')) {
      processedValue = this.decompress(processedValue.replace('compressed:', ''));
      processedValue = JSON.parse(processedValue as string);
    }

    return processedValue;
  }

  // Update cache with size management
  private updateCache(key: string, data: StorageData): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.cacheSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
    this.cache.set(key, data);
  }

  // Remove data
  remove(key: string, options: StorageOptions = {}): boolean {
    try {
      const storageKey = this.getFullKey(key);
      
      // Remove from cache
      this.cache.delete(storageKey);
      
      const storage = options.persistent ? localStorage : sessionStorage;
      storage.removeItem(storageKey);
      return true;
    } catch {
      console.warn('Failed to remove data');
      return false;
    }
  }

  // Check if key exists
  has(key: string, options: StorageOptions = {}): boolean {
    try {
      const storageKey = this.getFullKey(key);
      
      // Check cache first
      if (this.cache.has(storageKey)) {
        return true;
      }
      
      const storage = options.persistent ? localStorage : sessionStorage;
      return storage.getItem(storageKey) !== null;
    } catch {
      return false;
    }
  }

  // Get all keys with prefix
  keys(options: StorageOptions = {}): string[] {
    try {
      const storage = options.persistent ? localStorage : sessionStorage;
      const keys: string[] = [];
      
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key?.startsWith(this.prefix)) {
          keys.push(key.replace(`${this.prefix}:`, ''));
        }
      }
      
      return keys;
    } catch {
      console.warn('Failed to get keys');
      return [];
    }
  }

  // Clear all data with prefix
  clear(options: StorageOptions = {}): boolean {
    try {
      const keys = this.keys(options);
      
      keys.forEach(key => {
        this.remove(key, options);
      });
      
      return true;
    } catch {
      console.warn('Failed to clear data');
      return false;
    }
  }

  // Get storage size in bytes with caching
  getStorageSize(): number {
    try {
      let totalSize = 0;
      
      // Check localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.prefix)) {
          totalSize += key.length + (localStorage.getItem(key)?.length ?? 0);
        }
      }
      
      // Check sessionStorage
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith(this.prefix)) {
          totalSize += key.length + (sessionStorage.getItem(key)?.length ?? 0);
        }
      }
      
      return totalSize;
    } catch {
      return 0;
    }
  }

  // Cleanup expired data with rate limiting
  private cleanupExpiredData(): void {
    const now = Date.now();
    if (now - this.lastCleanup < this.cleanupInterval) {
      return; // Skip if cleanup was done recently
    }
    
    try {
      const storages = [localStorage, sessionStorage];
      
      storages.forEach(storage => {
        const keys = this.keys({ persistent: storage === localStorage });
        
        keys.forEach(key => {
          const data = this.get(key, { persistent: storage === localStorage });
          if (data && typeof data === 'object' && 'expiresAt' in data && typeof data.expiresAt === 'number' && now > data.expiresAt) {
            this.remove(key, { persistent: storage === localStorage });
          }
        });
      });
      
      this.lastCleanup = now;
    } catch {
      console.warn('Failed to cleanup expired data');
    }
  }

  // Cleanup old data when storage is full
  private cleanupOldData(): void {
    try {
      const storages = [localStorage, sessionStorage];
      
      storages.forEach(storage => {
        const keys = this.keys({ persistent: storage === localStorage });
        const entries: { key: string; timestamp: number; size: number }[] = [];
        
        // Get all entries with their sizes
        keys.forEach(key => {
          const data = this.get(key, { persistent: storage === localStorage });
          if (data && typeof data === 'object' && 'timestamp' in data) {
            const serialized = JSON.stringify(data);
            entries.push({
              key,
              timestamp: (data as StorageData).timestamp ?? 0,
              size: serialized.length,
            });
          }
        });
        
        // Sort by timestamp (oldest first) and remove until we have space
        entries.sort((a, b) => a.timestamp - b.timestamp);
        
        let removedSize = 0;
        const targetRemoval = this.maxSize * 0.2; // Remove 20% of max size
        
        for (const entry of entries) {
          if (removedSize >= targetRemoval) break;
          
          this.remove(entry.key, { persistent: storage === localStorage });
          removedSize += entry.size;
        }
      });
    } catch {
      console.warn('Failed to cleanup old data');
    }
  }

  // Check if data should be compressed
  private shouldCompress(value: unknown): boolean {
    const size = JSON.stringify(value).length;
    return size > this.compressionThreshold;
  }

  // Simple compression (base64 encoding for demo - in production use proper compression)
  private compress(data: string): string {
    try {
      return btoa(data);
    } catch {
      return data;
    }
  }

  // Simple decompression
  private decompress(data: string): string {
    try {
      return atob(data);
    } catch {
      return data;
    }
  }

  // Simple encryption (base64 encoding for demo - in production use proper encryption)
  private encrypt(data: string): string {
    try {
      return btoa(data);
    } catch {
      return data;
    }
  }

  // Simple decryption
  private decrypt(data: string): string {
    try {
      return atob(data);
    } catch {
      return data;
    }
  }

  // Get full storage key
  private getFullKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  // Export all data (useful for debugging)
  exportData(): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    
    try {
      const keys = this.keys({ persistent: true });
      keys.forEach(key => {
        data[key] = this.get(key, { persistent: true });
      });
      
      const sessionKeys = this.keys({ persistent: false });
      sessionKeys.forEach(key => {
        data[`session:${key}`] = this.get(key, { persistent: false });
      });
    } catch {
      console.warn('Failed to export data');
    }
    
    return data;
  }

  // Import data (useful for migration)
  importData(data: Record<string, unknown>): boolean {
    try {
      Object.entries(data).forEach(([key, value]) => {
        if (key.startsWith('session:')) {
          const sessionKey = key.replace('session:', '');
          this.set(sessionKey, value, { persistent: false });
        } else {
          this.set(key, value, { persistent: true });
        }
      });
      
      return true;
    } catch (error) {
      console.warn('Failed to import data:', error);
      return false;
    }
  }

  // Clear cache for memory management
  clearCache(): void {
    this.cache.clear();
  }
}

// Global instance
export const storageManager = new StorageManager();

export default storageManager;
