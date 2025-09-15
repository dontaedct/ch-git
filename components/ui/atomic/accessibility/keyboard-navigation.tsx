/**
 * @fileoverview HT-022.2.3: Enhanced Keyboard Navigation System
 * @module components/ui/atomic/accessibility
 * @author Agency Component System
 * @version 1.0.0
 *
 * KEYBOARD NAVIGATION: Comprehensive keyboard support and focus management
 */

'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useAccessibility } from './accessibility-provider';

// Focus management utilities
export class FocusManager {
  private static instance: FocusManager;
  private focusStack: Element[] = [];
  private trapStack: Element[] = [];

  static getInstance(): FocusManager {
    if (!FocusManager.instance) {
      FocusManager.instance = new FocusManager();
    }
    return FocusManager.instance;
  }

  pushFocus(element: Element) {
    if (document.activeElement) {
      this.focusStack.push(document.activeElement);
    }
    (element as HTMLElement).focus();
  }

  popFocus() {
    const previousElement = this.focusStack.pop();
    if (previousElement) {
      (previousElement as HTMLElement).focus();
    }
  }

  trapFocus(container: Element) {
    this.trapStack.push(container);
    this.applyFocusTrap(container);
  }

  releaseFocusTrap() {
    this.trapStack.pop();
    const currentTrap = this.trapStack[this.trapStack.length - 1];
    if (currentTrap) {
      this.applyFocusTrap(currentTrap);
    } else {
      this.removeFocusTrap();
    }
  }

  private applyFocusTrap(container: Element) {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }

      if (event.key === 'Escape') {
        this.releaseFocusTrap();
        this.popFocus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    firstElement.focus();

    // Store cleanup function
    (container as any)._focusTrapCleanup = () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }

  private removeFocusTrap() {
    // Remove all trap cleanups
    this.trapStack.forEach(container => {
      if ((container as any)._focusTrapCleanup) {
        (container as any)._focusTrapCleanup();
        delete (container as any)._focusTrapCleanup;
      }
    });
  }

  private getFocusableElements(container: Element): Element[] {
    const selector = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(selector)).filter(
      element => {
        const style = getComputedStyle(element as HTMLElement);
        return style.display !== 'none' && style.visibility !== 'hidden';
      }
    );
  }

  getNextFocusableElement(current: Element, container?: Element): Element | null {
    const root = container || document.body;
    const focusableElements = this.getFocusableElements(root);
    const currentIndex = focusableElements.indexOf(current);

    if (currentIndex === -1) return null;

    const nextIndex = (currentIndex + 1) % focusableElements.length;
    return focusableElements[nextIndex];
  }

  getPreviousFocusableElement(current: Element, container?: Element): Element | null {
    const root = container || document.body;
    const focusableElements = this.getFocusableElements(root);
    const currentIndex = focusableElements.indexOf(current);

    if (currentIndex === -1) return null;

    const prevIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
    return focusableElements[prevIndex];
  }
}

// Hook for focus trap
export function useFocusTrap(enabled: boolean = true) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const focusManager = FocusManager.getInstance();
    const container = containerRef.current;

    focusManager.trapFocus(container);

    return () => {
      focusManager.releaseFocusTrap();
    };
  }, [enabled]);

  return containerRef;
}

// Hook for keyboard shortcuts
export function useKeyboardShortcuts(
  shortcuts: Record<string, () => void>,
  enabled: boolean = true
) {
  const { settings } = useAccessibility();

  useEffect(() => {
    if (!enabled || !settings.keyboardNavigation) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const modifiers = {
        ctrl: event.ctrlKey,
        alt: event.altKey,
        shift: event.shiftKey,
        meta: event.metaKey
      };

      // Build shortcut string
      let shortcutString = '';
      if (modifiers.ctrl) shortcutString += 'ctrl+';
      if (modifiers.alt) shortcutString += 'alt+';
      if (modifiers.shift) shortcutString += 'shift+';
      if (modifiers.meta) shortcutString += 'meta+';
      shortcutString += key;

      const handler = shortcuts[shortcutString];
      if (handler) {
        event.preventDefault();
        handler();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled, settings.keyboardNavigation]);
}

// Roving tabindex hook for complex widgets
export function useRovingTabIndex(
  enabled: boolean = true,
  orientation: 'horizontal' | 'vertical' | 'both' = 'horizontal'
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { settings } = useAccessibility();

  useEffect(() => {
    if (!enabled || !settings.keyboardNavigation || !containerRef.current) return;

    const container = containerRef.current;
    const focusManager = FocusManager.getInstance();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!document.activeElement || !container.contains(document.activeElement)) return;

      let handled = false;

      switch (event.key) {
        case 'ArrowRight':
          if (orientation === 'horizontal' || orientation === 'both') {
            const next = focusManager.getNextFocusableElement(document.activeElement, container);
            if (next) {
              (next as HTMLElement).focus();
              handled = true;
            }
          }
          break;

        case 'ArrowLeft':
          if (orientation === 'horizontal' || orientation === 'both') {
            const prev = focusManager.getPreviousFocusableElement(document.activeElement, container);
            if (prev) {
              (prev as HTMLElement).focus();
              handled = true;
            }
          }
          break;

        case 'ArrowDown':
          if (orientation === 'vertical' || orientation === 'both') {
            const next = focusManager.getNextFocusableElement(document.activeElement, container);
            if (next) {
              (next as HTMLElement).focus();
              handled = true;
            }
          }
          break;

        case 'ArrowUp':
          if (orientation === 'vertical' || orientation === 'both') {
            const prev = focusManager.getPreviousFocusableElement(document.activeElement, container);
            if (prev) {
              (prev as HTMLElement).focus();
              handled = true;
            }
          }
          break;

        case 'Home':
          const focusableElements = focusManager['getFocusableElements'](container);
          if (focusableElements.length > 0) {
            (focusableElements[0] as HTMLElement).focus();
            handled = true;
          }
          break;

        case 'End':
          const focusableElementsEnd = focusManager['getFocusableElements'](container);
          if (focusableElementsEnd.length > 0) {
            (focusableElementsEnd[focusableElementsEnd.length - 1] as HTMLElement).focus();
            handled = true;
          }
          break;
      }

      if (handled) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [enabled, orientation, settings.keyboardNavigation]);

  return containerRef;
}

// Hook for auto-focus management
export function useAutoFocus(enabled: boolean = true, delay: number = 100) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!enabled || !elementRef.current) return;

    const timer = setTimeout(() => {
      elementRef.current?.focus();
    }, delay);

    return () => clearTimeout(timer);
  }, [enabled, delay]);

  return elementRef;
}

// Component for keyboard shortcut hints
interface KeyboardHintsProps {
  shortcuts: Array<{
    keys: string;
    description: string;
  }>;
  className?: string;
}

export function KeyboardHints({ shortcuts, className }: KeyboardHintsProps) {
  const { settings } = useAccessibility();

  if (!settings.keyboardNavigation) return null;

  return (
    <div className={`text-xs text-muted-foreground space-y-1 ${className || ''}`}>
      <p className="font-medium">Keyboard Shortcuts:</p>
      {shortcuts.map(({ keys, description }) => (
        <div key={keys} className="flex justify-between">
          <span className="font-mono bg-muted px-1 rounded">{keys}</span>
          <span>{description}</span>
        </div>
      ))}
    </div>
  );
}

// ARIA live region component
export function LiveRegion({
  children,
  politeness = 'polite',
  atomic = true
}: {
  children: React.ReactNode;
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
}) {
  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      className="sr-only"
    >
      {children}
    </div>
  );
}