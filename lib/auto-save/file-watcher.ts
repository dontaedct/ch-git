import { autoSaveManager, AutoSaveEntry } from './index';

interface FileChangeEvent {
  filePath: string;
  content: string;
  timestamp: number;
  type: 'create' | 'update' | 'delete';
}

// Define a local interface for HMR support
interface HotModule {
  hot?: {
    accept: (callback?: (err?: unknown) => void) => void;
  };
}

class DevelopmentFileWatcher {
  private isWatching = false;
  private fileStates = new Map<string, string>();
  private changeCallbacks: ((event: FileChangeEvent) => void)[] = [];

  constructor() {
    // Only enable in development
    if (process.env.NODE_ENV === 'development') {
      this.init();
    }
  }

  private init() {
    // Set up file change detection for development
    this.setupFileChangeDetection();
    this.setupAutoSave();
  }

  private setupFileChangeDetection() {
    // Monitor for file changes in development
    if (typeof window !== 'undefined') {
      // Listen for webpack HMR events
      if (typeof module !== 'undefined' && (module as HotModule).hot) {
        (module as HotModule).hot!.accept((err: unknown) => {
          if (err) {
            console.warn('HMR error:', err);
          }
        });
      }

      // Listen for Next.js file changes
      if (process.env.NODE_ENV === 'development') {
        this.setupNextJSFileWatching();
      }
    }
  }

  private setupNextJSFileWatching() {
    // Next.js development server file watching
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      // Monitor for route changes that might indicate file changes
      let lastPath = window.location.pathname;
      
      const checkForFileChanges = () => {
        const currentPath = window.location.pathname;
        if (currentPath !== lastPath) {
          // Route changed, check if we need to restore any auto-saved content
          setTimeout(() => {
            this.checkForRecovery();
          }, 100);
          lastPath = currentPath;
        }
      };

      // Listen for route changes
      window.addEventListener('popstate', checkForFileChanges);
      
      // Override history methods to catch programmatic navigation
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;
      
      history.pushState = function(...args) {
        originalPushState.apply(history, args);
        checkForFileChanges();
      };
      
      history.replaceState = function(...args) {
        originalReplaceState.apply(history, args);
        checkForFileChanges();
      };
    }
  }

  private setupAutoSave() {
    // Set up periodic auto-save for development
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      setInterval(() => {
        this.forceAutoSave();
      }, 30000); // Auto-save every 30 seconds in development
    }
  }

  private async checkForRecovery() {
    try {
      const entries = await autoSaveManager.attemptRecovery();
      if (entries.length > 0) {
        console.warn(`🔄 Development: Found ${entries.length} entries for recovery`);
        
        // Emit change event for recovery UI
        this.emitChange({
          filePath: window.location.pathname,
          content: '',
          timestamp: Date.now(),
          type: 'update',
        });
      }
    } catch (error) {
      console.warn('Development recovery check failed:', error);
    }
  }

  private forceAutoSave() {
    // Force save all current form states
    if (typeof window !== 'undefined') {
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        const formData = new FormData(form);
        const formObject: Record<string, string | File> = {};
        
        for (const [key, value] of formData.entries()) {
          formObject[key] = value;
        }

        if (Object.keys(formObject).length > 0) {
          const entry = {
            id: `dev-auto-${form.id || 'unknown'}-${Date.now()}`,
            content: JSON.stringify(formObject),
            timestamp: Date.now(),
            filePath: window.location.pathname,
            metadata: {
              type: 'form',
              action: form.action,
              method: form.method,
              id: form.id,
              source: 'development-auto-save',
            },
          };

          autoSaveManager.saveEntry(entry as AutoSaveEntry);
        }
      });

      // Also save any contenteditable elements
      const contentEditables = document.querySelectorAll('[contenteditable="true"]');
      contentEditables.forEach(element => {
        if (element.innerHTML.trim()) {
          const entry = {
            id: `dev-auto-${element.id || 'unknown'}-${Date.now()}`,
            content: element.innerHTML,
            timestamp: Date.now(),
            filePath: window.location.pathname,
            metadata: {
              type: 'contenteditable',
              id: element.id,
              className: element.className,
              source: 'development-auto-save',
            },
          };

          autoSaveManager.saveEntry(entry as AutoSaveEntry);
        }
      });
    }
  }

  // Public API
  startWatching() {
    if (this.isWatching) return;
    
    this.isWatching = true;
    console.warn('🔍 Development file watcher started');
  }

  stopWatching() {
    if (!this.isWatching) return;
    
    this.isWatching = false;
    console.warn('🔍 Development file watcher stopped');
  }

  onFileChange(callback: (event: FileChangeEvent) => void) {
    this.changeCallbacks.push(callback);
    
    return () => {
      const index = this.changeCallbacks.indexOf(callback);
      if (index > -1) {
        this.changeCallbacks.splice(index, 1);
      }
    };
  }

  private emitChange(event: FileChangeEvent) {
    this.changeCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.warn('File change callback error:', error);
      }
    });
  }

  // Development utilities
  getFileStates() {
    return new Map(this.fileStates);
  }

  clearFileStates() {
    this.fileStates.clear();
  }

  // Force development auto-save
  forceDevAutoSave() {
    this.forceAutoSave();
  }
}

// Global instance for development
export const developmentFileWatcher = new DevelopmentFileWatcher();

// Auto-start in development
if (process.env.NODE_ENV === 'development') {
  developmentFileWatcher.startWatching();
}

export default developmentFileWatcher;
