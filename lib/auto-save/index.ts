import { storageManager, StorageOptions } from './storage';

// Local debounce function specifically for Event handlers
function debounceEvent<T extends Event>(func: (event: T) => void, wait: number): (event: T) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (event: T) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(event);
    }, wait);
  };
}

export interface AutoSaveMetadata {
  id?: string;
  type?: 'form' | 'input' | 'contenteditable';
  name?: string;
  [key: string]: unknown;
}

export interface AutoSaveEntry {
  id: string;
  content: string;
  timestamp: number;
  filePath?: string;
  metadata?: AutoSaveMetadata;
}

export interface AutoSaveConfig {
  debounceMs: number;
  maxEntries: number;
  storageKey: string;
  enableRecovery: boolean;
  storageOptions?: StorageOptions;
}

class AutoSaveManager {
  private config: AutoSaveConfig;
  private entries: Map<string, AutoSaveEntry> = new Map();
  private isInitialized = false;
  private debouncedSave: (event: Event) => void;
  private pendingSaves: Set<string> = new Set();
  private batchSaveTimeout: NodeJS.Timeout | null = null;
  private lastContentCache: Map<string, string> = new Map();

  constructor(config: Partial<AutoSaveConfig> = {}) {
    this.config = {
      debounceMs: 2000, // Increased from 1000ms for better performance
      maxEntries: 100,
      storageKey: 'micro-app-auto-save',
      enableRecovery: true,
      storageOptions: {
        persistent: true,
        compress: true,
        ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
      ...config,
    };
    
    // Initialize debounced save after config is set
    this.debouncedSave = debounceEvent((event: Event) => {
      this.autoSave(event);
    }, this.config.debounceMs);
  }

  init() {
    if (this.isInitialized) return;
    
    this.loadFromStorage();
    this.setupEventListeners();
    this.setupBeforeUnload();
    this.isInitialized = true;
    
    // Auto-save system initialized - ready for use
  }

  private setupEventListeners() {
    // Monitor form inputs with optimized event handling
    document.addEventListener('input', this.debouncedSave.bind(this), { passive: true });
    document.addEventListener('change', this.debouncedSave.bind(this), { passive: true });
    
    // Remove redundant keyup listener - input event covers this
    // document.addEventListener('keyup', this.debouncedSave.bind(this));
    
    // Monitor contenteditable elements with capture for better performance
    document.addEventListener('input', this.debouncedSave.bind(this), { passive: true, capture: true });
  }

  private setupBeforeUnload() {
    window.addEventListener('beforeunload', (e) => {
      if (this.hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    });
  }

  private autoSave(event: Event) {
    const target = event.target as HTMLElement;
    
    if (!target) return;

    // Handle different input types with content diffing
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      this.saveInput(target);
    } else if (target.isContentEditable) {
      this.saveContentEditable(target);
    } else if (target instanceof HTMLFormElement) {
      this.saveForm(target);
    }
  }

  private saveInput(element: HTMLInputElement | HTMLTextAreaElement) {
    const id = this.generateId(element);
    const content = element.value;
    
    // Skip save if content hasn't changed
    if (!this.hasContentChanged(id, content)) {
      return;
    }

    const entry: AutoSaveEntry = {
      id,
      content,
      timestamp: Date.now(),
      filePath: window.location.pathname,
      metadata: {
        type: this.getValidType(element.type),
        name: element.name,
        id: element.id,
        className: element.className,
      },
    };

    this.queueSave(entry);
  }

  private saveContentEditable(element: HTMLElement) {
    const id = this.generateId(element);
    const content = element.innerHTML ?? '';
    
    // Skip save if content hasn't changed
    if (!this.hasContentChanged(id, content)) {
      return;
    }

    const entry: AutoSaveEntry = {
      id,
      content,
      timestamp: Date.now(),
      filePath: window.location.pathname,
      metadata: {
        type: 'contenteditable',
        id: element.id ?? '',
      },
    };

    this.queueSave(entry);
  }

  private saveForm(form: HTMLFormElement) {
    const formData = new FormData(form);
    const formObject: Record<string, string | File> = {};
    
    for (const [key, value] of formData.entries()) {
      formObject[key] = value;
    }

    const id = this.generateId(form);
    const content = JSON.stringify(formObject);
    
    // Skip save if content hasn't changed
    if (!this.hasContentChanged(id, content)) {
      return;
    }

    const entry: AutoSaveEntry = {
      id,
      content,
      timestamp: Date.now(),
      filePath: window.location.pathname,
      metadata: {
        type: 'form',
        action: form.action,
        method: form.method,
        id: form.id,
      },
    };

    this.queueSave(entry);
  }

  private hasContentChanged(id: string, content: string): boolean {
    const lastContent = this.lastContentCache.get(id);
    if (lastContent === content) {
      return false;
    }
    
    // Update cache
    this.lastContentCache.set(id, content);
    return true;
  }

  private queueSave(entry: AutoSaveEntry) {
    this.entries.set(entry.id, entry);
    this.pendingSaves.add(entry.id);
    
    // Batch save operations for better performance
    this.scheduleBatchSave();
    
    // Emit event for other parts of the app
    window.dispatchEvent(new CustomEvent('auto-save', { detail: entry }));
  }

  private scheduleBatchSave() {
    if (this.batchSaveTimeout) {
      clearTimeout(this.batchSaveTimeout);
    }
    
    // Batch save after a short delay to group multiple rapid changes
    this.batchSaveTimeout = setTimeout(() => {
      this.executeBatchSave();
    }, 100);
  }

  private executeBatchSave() {
    if (this.pendingSaves.size === 0) return;
    
    try {
      const entriesArray = Array.from(this.entries.values());
      
      // Keep only the most recent entries
      if (entriesArray.length > this.config.maxEntries) {
        const sorted = entriesArray.sort((a, b) => b.timestamp - a.timestamp);
        const trimmed = sorted.slice(0, this.config.maxEntries);
        this.entries = new Map(trimmed.map(entry => [entry.id, entry]));
      }
      
      // Use the new storage manager with batched operation
      storageManager.set(
        this.config.storageKey, 
        Array.from(this.entries.entries()),
        this.config.storageOptions
      );
      
      // Clear pending saves
      this.pendingSaves.clear();
      
    } catch (error) {
      console.warn('Failed to persist auto-save data:', error);
    }
  }

  private generateId(element: HTMLElement): string {
    const elementId = element.id ?? (element as HTMLInputElement).name ?? element.className ?? 'unknown';
    const path = window.location.pathname;
    return `${path}:${elementId}`;
  }

  private getValidType(inputType: string): 'form' | 'input' | 'contenteditable' {
    // Map HTML input types to our valid types
    if (inputType === 'submit' || inputType === 'button' || inputType === 'reset') {
      return 'form'
    }
    return 'input'
  }

  // Public method for external components to save entries
  saveEntry(entry: AutoSaveEntry) {
    // Skip save if content hasn't changed
    if (!this.hasContentChanged(entry.id, entry.content)) {
      return;
    }
    
    this.entries.set(entry.id, entry);
    this.pendingSaves.add(entry.id);
    this.scheduleBatchSave();
    
    // Emit event for other parts of the app
    window.dispatchEvent(new CustomEvent('auto-save', { detail: entry }));
  }

  private persistToStorage() {
    // This method is now handled by executeBatchSave
    this.executeBatchSave();
  }

  private loadFromStorage() {
    try {
      const stored = storageManager.get(this.config.storageKey, this.config.storageOptions);
      if (stored && Array.isArray(stored)) {
        this.entries = new Map(stored as [string, AutoSaveEntry][]);
        
        // Initialize content cache
        for (const [id, entry] of this.entries) {
          this.lastContentCache.set(id, entry.content);
        }
      }
    } catch (error) {
      console.warn('Failed to load auto-save data:', error);
    }
  }

  // Public API methods
  hasUnsavedChanges(): boolean {
    return this.entries.size > 0;
  }

  getUnsavedEntries(): AutoSaveEntry[] {
    return Array.from(this.entries.values());
  }

  getEntriesForPath(path: string): AutoSaveEntry[] {
    return Array.from(this.entries.values()).filter(entry => entry.filePath === path);
  }

  getEntry(id: string): AutoSaveEntry | null {
    return this.entries.get(id) ?? null;
  }

  clearEntry(id: string) {
    this.entries.delete(id);
    this.lastContentCache.delete(id);
    this.pendingSaves.delete(id);
    this.scheduleBatchSave();
  }

  clearAllEntries() {
    this.entries.clear();
    this.lastContentCache.clear();
    this.pendingSaves.clear();
    this.scheduleBatchSave();
  }

  // Recovery methods
  async attemptRecovery(): Promise<AutoSaveEntry[]> {
    const currentPath = window.location.pathname;
    const entries = this.getEntriesForPath(currentPath);
    
    if (entries.length > 0) {
              console.warn(`🔄 Found ${entries.length} unsaved entries for recovery`);
      return entries;
    }
    
    return [];
  }

  // Manual save trigger
  forceSave() {
    this.executeBatchSave();
  }

  // Cleanup method for better memory management
  cleanup() {
    if (this.batchSaveTimeout) {
      clearTimeout(this.batchSaveTimeout);
      this.batchSaveTimeout = null;
    }
    
    // Clear caches
    this.lastContentCache.clear();
    this.pendingSaves.clear();
  }
}

// Global instance
export const autoSaveManager = new AutoSaveManager();

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => autoSaveManager.init());
  } else {
    autoSaveManager.init();
  }
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    autoSaveManager.cleanup();
  });
}

export default autoSaveManager;
