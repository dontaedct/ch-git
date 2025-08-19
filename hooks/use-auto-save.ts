import { useEffect, useRef, useCallback, useMemo } from 'react';
import { autoSaveManager, AutoSaveEntry } from '@lib/auto-save';

const autoSaveEnabled: boolean = true;
let hasUnsavedChanges: boolean = false;

interface UseAutoSaveOptions {
  id: string;
  type?: 'input' | 'textarea' | 'form' | 'contenteditable';
  debounceMs?: number;
  autoRestore?: boolean;
  onSave?: (content: string) => void;
  onRestore?: (content: string) => void;
}

export function useAutoSave({
  id,
  type = 'input',
  debounceMs = 2000, // Increased default debounce for better performance
  autoRestore = true,
  onSave,
  onRestore,
}: UseAutoSaveOptions) {
  const elementRef = useRef<HTMLElement | null>(null);
  const lastSavedContent = useRef<string>('');
  const isRestoring = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize the element ID to prevent unnecessary re-renders
  const elementId = useMemo(() => `${id}-${type}`, [id, type]);

  // Find and save the element reference
  const setElementRef = useCallback((element: HTMLElement | null) => {
    elementRef.current = element;
    
    if (element && autoRestore) {
      // Attempt to restore content on mount with a longer delay for better performance
      setTimeout(() => {
        attemptRestore();
      }, 200);
    }
  }, [autoRestore]);

  // Debounced save function to prevent excessive saves
  const debouncedSave = useCallback((content: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveContent(content);
    }, debounceMs);
  }, [debounceMs]);

  // Save content to auto-save system
  const saveContent = useCallback((content: string) => {
    if (!elementRef.current || isRestoring.current) return;
    
    // Skip save if content hasn't changed
    if (content === lastSavedContent.current) return;
    
    const entry: AutoSaveEntry = {
      id: elementId,
      content,
      timestamp: Date.now(),
      filePath: typeof window !== 'undefined' ? window.location.pathname : '',
      metadata: {
        type: (type === 'textarea' ? 'input' : type) as 'input' | 'form' | 'contenteditable' | undefined,
        id,
        elementType: elementRef.current.tagName.toLowerCase(),
        className: elementRef.current.className,
      },
    };

    autoSaveManager.saveEntry(entry);
    lastSavedContent.current = content;
    
    if (onSave) {
      onSave(content);
    }
  }, [elementId, type, onSave]);

  // Attempt to restore content from auto-save
  const attemptRestore = useCallback(async () => {
    if (!elementRef.current || !autoRestore) return;

    try {
      const entries = autoSaveManager.getEntriesForPath(typeof window !== 'undefined' ? window.location.pathname : '');
      const relevantEntry = entries.find(entry => 
        entry.metadata?.id === id && 
        entry.metadata?.type === type
      );

      if (relevantEntry && relevantEntry.content !== lastSavedContent.current) {
        isRestoring.current = true;
        
        // Restore based on element type
        if (elementRef.current instanceof HTMLInputElement || 
            elementRef.current instanceof HTMLTextAreaElement) {
          elementRef.current.value = relevantEntry.content;
          elementRef.current.dispatchEvent(new Event('input', { bubbles: true }));
        } else if (elementRef.current.isContentEditable) {
          elementRef.current.innerHTML = relevantEntry.content;
          elementRef.current.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // Clear the restored entry
        autoSaveManager.clearEntry(relevantEntry.id);
        
        if (onRestore) {
          onRestore(relevantEntry.content);
        }
        
        console.log(`🔄 Restored content for ${id}`);
      }
    } catch (error) {
      console.warn('Failed to restore content:', error);
    } finally {
      isRestoring.current = false;
    }
  }, [id, type, autoRestore, onRestore]);

  // Manual restore trigger
  const restoreContent = useCallback(() => {
    attemptRestore();
  }, [attemptRestore]);

  // Clear auto-save data for this element
  const clearAutoSave = useCallback(() => {
    const entries = autoSaveManager.getEntriesForPath(window.location.pathname);
    entries.forEach(entry => {
      if (entry.metadata?.id === id && entry.metadata?.type === type) {
        autoSaveManager.clearEntry(entry.id);
      }
    });
  }, [id, type]);

  // Optimized event handler with debouncing
  const handleInput = useCallback(() => {
    if (!elementRef.current) return;
    
    let content = '';
    
    if (elementRef.current instanceof HTMLInputElement || elementRef.current instanceof HTMLTextAreaElement) {
      content = elementRef.current.value;
    } else if (elementRef.current.isContentEditable) {
      content = elementRef.current.innerHTML;
    }

    // Use debounced save for better performance
    debouncedSave(content);
  }, [debouncedSave]);

  // Set up auto-save event listeners with optimized handling
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Use a single event handler for better performance
    element.addEventListener('input', handleInput, { passive: true });
    element.addEventListener('change', handleInput, { passive: true });
    
    // For contenteditable elements, also listen for paste and keydown
    if (element.isContentEditable) {
      element.addEventListener('paste', handleInput, { passive: true });
      element.addEventListener('keydown', handleInput, { passive: true });
    }

    


  return () => {
      element.removeEventListener('input', handleInput);
      element.removeEventListener('change', handleInput);
      if (element.isContentEditable) {
        element.removeEventListener('paste', handleInput);
        element.removeEventListener('keydown', handleInput);
      }
    };
  }, [handleInput]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Clear any pending save timeouts
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Optionally clear auto-save data when component unmounts
      // Uncomment the next line if you want this behavior
      // clearAutoSave();
    };
  }, [clearAutoSave]);

  // Memoized return object to prevent unnecessary re-renders
  return useMemo(() => ({
    setElementRef,
    saveContent,
    restoreContent,
    clearAutoSave,
    hasUnsavedChanges: () => {
      const entries = autoSaveManager.getEntriesForPath(typeof window !== 'undefined' ? window.location.pathname : '');
      return entries.some(entry => 
        entry.metadata?.id === id && 
        entry.metadata?.type === type
      );
    },
  }), [setElementRef, saveContent, restoreContent, clearAutoSave, id, type]);
}

// Specialized hooks for common use cases
export function useAutoSaveInput(id: string, options?: Partial<UseAutoSaveOptions>) {
  return useAutoSave({ id, type: 'input', ...options });
}

export function useAutoSaveTextarea(id: string, options?: Partial<UseAutoSaveOptions>) {
  return useAutoSave({ id, type: 'textarea', ...options });
}

export function useAutoSaveForm(id: string, options?: Partial<UseAutoSaveOptions>) {
  return useAutoSave({ id, type: 'form', ...options });
}

export function useAutoSaveContentEditable(id: string, options?: Partial<UseAutoSaveOptions>) {
  return useAutoSave({ id, type: 'contenteditable', ...options });
}
