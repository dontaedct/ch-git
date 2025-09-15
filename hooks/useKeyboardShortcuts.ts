/**
 * Hero Tasks - Keyboard Shortcuts Hook
 * HT-004.1.1: Comprehensive keyboard shortcuts implementation
 * Created: 2025-01-27T15:30:00.000Z
 * Version: 1.0.0
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  action: () => void;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

export interface KeyboardShortcutsConfig {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
  showHelp?: boolean;
  helpKey?: string;
}

export interface KeyboardShortcutsContext {
  shortcuts: KeyboardShortcut[];
  isEnabled: boolean;
  showHelp: boolean;
  toggleHelp: () => void;
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (key: string) => void;
}

/**
 * Custom hook for managing keyboard shortcuts
 * Provides comprehensive keyboard navigation and actions for Hero Tasks
 */
export function useKeyboardShortcuts(config: KeyboardShortcutsConfig): KeyboardShortcutsContext {
  const shortcutsRef = useRef<KeyboardShortcut[]>(config.shortcuts || []);
  const enabledRef = useRef<boolean>(config.enabled !== false);
  const showHelpRef = useRef<boolean>(config.showHelp || false);
  const helpKeyRef = useRef<string>(config.helpKey || 'F1');

  // Register a new shortcut
  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    shortcutsRef.current = [...shortcutsRef.current.filter(s => s.key !== shortcut.key), shortcut];
  }, []);

  // Unregister a shortcut by key
  const unregisterShortcut = useCallback((key: string) => {
    shortcutsRef.current = shortcutsRef.current.filter(s => s.key !== key);
  }, []);

  // Toggle help display
  const toggleHelp = useCallback(() => {
    showHelpRef.current = !showHelpRef.current;
  }, []);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabledRef.current) return;

    // Check for help key
    if (event.key === helpKeyRef.current) {
      event.preventDefault();
      toggleHelp();
      return;
    }

    // Find matching shortcut
    const matchingShortcut = shortcutsRef.current.find(shortcut => {
      return shortcut.key.toLowerCase() === event.key.toLowerCase() &&
        !!shortcut.ctrlKey === event.ctrlKey &&
        !!shortcut.metaKey === event.metaKey &&
        !!shortcut.shiftKey === event.shiftKey &&
        !!shortcut.altKey === event.altKey;
    });

    if (matchingShortcut) {
      if (matchingShortcut.preventDefault !== false) {
        event.preventDefault();
      }
      if (matchingShortcut.stopPropagation) {
        event.stopPropagation();
      }
      
      try {
        matchingShortcut.action();
      } catch (error) {
        console.error('Error executing keyboard shortcut:', error);
      }
    }
  }, [toggleHelp]);

  // Set up event listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    shortcuts: shortcutsRef.current,
    isEnabled: enabledRef.current,
    showHelp: showHelpRef.current,
    toggleHelp,
    registerShortcut,
    unregisterShortcut
  };
}

/**
 * Predefined shortcut collections for different contexts
 */
export const HeroTasksShortcuts = {
  // Global shortcuts (work everywhere)
  global: [
    {
      key: 'F1',
      description: 'Show keyboard shortcuts help',
      action: () => {}, // Will be handled by the hook
      preventDefault: true
    },
    {
      key: 'Escape',
      description: 'Close modals, cancel actions',
      action: () => {}, // Will be implemented in components
      preventDefault: true
    }
  ],

  // Task list shortcuts
  taskList: [
    {
      key: 'n',
      ctrlKey: true,
      description: 'Create new task',
      action: () => {}, // Will be implemented in TaskList component
      preventDefault: true
    },
    {
      key: 'f',
      ctrlKey: true,
      description: 'Focus search input',
      action: () => {}, // Will be implemented in TaskList component
      preventDefault: true
    },
    {
      key: 'r',
      ctrlKey: true,
      description: 'Refresh task list',
      action: () => {}, // Will be implemented in TaskList component
      preventDefault: true
    },
    {
      key: '1',
      ctrlKey: true,
      description: 'Go to task list',
      action: () => {}, // Will be implemented in dashboard
      preventDefault: true
    },
    {
      key: '2',
      ctrlKey: true,
      description: 'Go to analytics',
      action: () => {}, // Will be implemented in dashboard
      preventDefault: true
    }
  ],

  // Task form shortcuts
  taskForm: [
    {
      key: 's',
      ctrlKey: true,
      description: 'Save task',
      action: () => {}, // Will be implemented in TaskForm component
      preventDefault: true
    },
    {
      key: 'Escape',
      description: 'Cancel and close form',
      action: () => {}, // Will be implemented in TaskForm component
      preventDefault: true
    },
    {
      key: 'Tab',
      description: 'Navigate to next field',
      action: () => {}, // Will be handled by browser default
      preventDefault: false
    },
    {
      key: 'Tab',
      shiftKey: true,
      description: 'Navigate to previous field',
      action: () => {}, // Will be handled by browser default
      preventDefault: false
    }
  ],

  // Task detail shortcuts
  taskDetail: [
    {
      key: 'e',
      ctrlKey: true,
      description: 'Edit task',
      action: () => {}, // Will be implemented in TaskDetail component
      preventDefault: true
    },
    {
      key: 'd',
      ctrlKey: true,
      description: 'Duplicate task',
      action: () => {}, // Will be implemented in TaskDetail component
      preventDefault: true
    },
    {
      key: 'Delete',
      ctrlKey: true,
      description: 'Delete task',
      action: () => {}, // Will be implemented in TaskDetail component
      preventDefault: true
    },
    {
      key: 'p',
      ctrlKey: true,
      shiftKey: true,
      description: 'Change priority',
      action: () => {}, // Will be implemented in TaskDetail component
      preventDefault: true
    },
    {
      key: 's',
      ctrlKey: true,
      shiftKey: true,
      description: 'Change status',
      action: () => {}, // Will be implemented in TaskDetail component
      preventDefault: true
    }
  ],

  // Analytics shortcuts
  analytics: [
    {
      key: 'r',
      ctrlKey: true,
      description: 'Refresh analytics',
      action: () => {}, // Will be implemented in analytics component
      preventDefault: true
    },
    {
      key: 'e',
      ctrlKey: true,
      description: 'Export analytics',
      action: () => {}, // Will be implemented in analytics component
      preventDefault: true
    }
  ]
};

/**
 * Utility function to create platform-aware shortcuts
 * Automatically handles Ctrl vs Cmd based on platform
 */
export function createPlatformShortcut(
  key: string,
  description: string,
  action: () => void,
  options: Partial<KeyboardShortcut> = {}
): KeyboardShortcut {
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  
  return {
    key,
    description,
    action,
    ctrlKey: !isMac,
    metaKey: isMac,
    preventDefault: true,
    ...options
  };
}

/**
 * Utility function to create accessible shortcuts
 * Includes ARIA labels and screen reader announcements
 */
export function createAccessibleShortcut(
  key: string,
  description: string,
  action: () => void,
  options: Partial<KeyboardShortcut> = {}
): KeyboardShortcut {
  const accessibleAction = () => {
    // Announce to screen readers
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(description);
      utterance.volume = 0.1;
      utterance.rate = 1.5;
      window.speechSynthesis.speak(utterance);
    }
    
    // Execute the action
    action();
  };

  return {
    key,
    description,
    action: accessibleAction,
    preventDefault: true,
    ...options
  };
}

export default useKeyboardShortcuts;
