/**
 * @fileoverview HT-022.2.3: Basic Accessibility Provider
 * @module components/ui/atomic/accessibility
 * @author Agency Component System
 * @version 1.0.0
 *
 * ACCESSIBILITY SYSTEM: WCAG 2.1 AA compliance and keyboard navigation
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  focusVisible: boolean;
  screenReaderMode: boolean;
  keyboardNavigation: boolean;
}

interface AccessibilityContextValue {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => void;
  resetSettings: () => void;
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
}

const defaultSettings: AccessibilitySettings = {
  reducedMotion: false,
  highContrast: false,
  largeText: false,
  focusVisible: true,
  screenReaderMode: false,
  keyboardNavigation: true
};

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);

interface AccessibilityProviderProps {
  children: React.ReactNode;
  respectSystemPreferences?: boolean;
}

export function AccessibilityProvider({
  children,
  respectSystemPreferences = true
}: AccessibilityProviderProps) {
  const [settings, setSettings] = useLocalStorage<AccessibilitySettings>('agency-a11y-settings', defaultSettings);
  const [announcer, setAnnouncer] = useState<HTMLDivElement | null>(null);

  // Detect system preferences
  useEffect(() => {
    if (!respectSystemPreferences) return;

    const mediaQueries = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: high)'),
      // Note: prefers-color-scheme is handled separately
    };

    const updateFromSystem = () => {
      setSettings(prev => ({
        ...prev,
        reducedMotion: mediaQueries.reducedMotion.matches || prev.reducedMotion,
        highContrast: mediaQueries.highContrast.matches || prev.highContrast
      }));
    };

    // Initial check
    updateFromSystem();

    // Listen for changes
    Object.values(mediaQueries).forEach(mq => {
      mq.addEventListener('change', updateFromSystem);
    });

    return () => {
      Object.values(mediaQueries).forEach(mq => {
        mq.removeEventListener('change', updateFromSystem);
      });
    };
  }, [respectSystemPreferences, setSettings]);

  // Apply accessibility settings to DOM
  useEffect(() => {
    const root = document.documentElement;

    // Apply data attributes for CSS targeting
    root.setAttribute('data-reduced-motion', settings.reducedMotion.toString());
    root.setAttribute('data-high-contrast', settings.highContrast.toString());
    root.setAttribute('data-large-text', settings.largeText.toString());
    root.setAttribute('data-focus-visible', settings.focusVisible.toString());
    root.setAttribute('data-screen-reader', settings.screenReaderMode.toString());
    root.setAttribute('data-keyboard-nav', settings.keyboardNavigation.toString());

    // Apply CSS custom properties
    root.style.setProperty('--motion-scale', settings.reducedMotion ? '0' : '1');
    root.style.setProperty('--focus-outline-width', settings.focusVisible ? '2px' : '1px');
    root.style.setProperty('--text-scale', settings.largeText ? '1.125' : '1');

  }, [settings]);

  // Create screen reader announcer
  useEffect(() => {
    const div = document.createElement('div');
    div.setAttribute('aria-live', 'polite');
    div.setAttribute('aria-atomic', 'true');
    div.style.position = 'absolute';
    div.style.left = '-10000px';
    div.style.top = 'auto';
    div.style.width = '1px';
    div.style.height = '1px';
    div.style.overflow = 'hidden';
    document.body.appendChild(div);
    setAnnouncer(div);

    return () => {
      if (div.parentNode) {
        div.parentNode.removeChild(div);
      }
    };
  }, []);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcer) return;

    // Clear previous message
    announcer.textContent = '';

    // Set priority
    announcer.setAttribute('aria-live', priority);

    // Small delay to ensure the clear registers
    setTimeout(() => {
      announcer.textContent = message;
    }, 100);
  };

  const value: AccessibilityContextValue = {
    settings,
    updateSetting,
    resetSettings,
    announceToScreenReader
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

// Accessibility utility hooks
export function useAnnouncer() {
  const { announceToScreenReader } = useAccessibility();
  return announceToScreenReader;
}

export function useKeyboardNavigation() {
  const { settings } = useAccessibility();

  useEffect(() => {
    if (!settings.keyboardNavigation) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Tab trap for modals (basic implementation)
      if (event.key === 'Tab') {
        const focusableElements = document.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }

      // Escape key handling
      if (event.key === 'Escape') {
        const activeModal = document.querySelector('[role="dialog"]');
        if (activeModal) {
          const closeButton = activeModal.querySelector('[data-close-modal]') as HTMLElement;
          closeButton?.click();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [settings.keyboardNavigation]);

  return settings.keyboardNavigation;
}

// Skip link component
export function SkipLink({ href = "#main-content", children = "Skip to main content" }) {
  return (
    <a
      href={href}
      className="absolute left-[-10000px] top-auto w-[1px] h-[1px] overflow-hidden focus:static focus:w-auto focus:h-auto focus:overflow-visible focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded focus:z-50"
    >
      {children}
    </a>
  );
}