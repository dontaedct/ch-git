/**
 * @fileoverview HT-022.2.3: Screen Reader Compatibility System
 * @module components/ui/atomic/accessibility
 * @author Agency Component System
 * @version 1.0.0
 *
 * SCREEN READER SUPPORT: ARIA attributes and screen reader optimization
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useAccessibility, useAnnouncer } from './accessibility-provider';

// Screen reader detection
export function useScreenReaderDetection() {
  const [isScreenReaderActive, setIsScreenReaderActive] = useState(false);

  useEffect(() => {
    // Simple screen reader detection
    const detectScreenReader = () => {
      // Check for common screen reader indicators
      const hasAriaLabel = document.querySelector('[aria-label]');
      const hasAriaLive = document.querySelector('[aria-live]');
      const hasRole = document.querySelector('[role]');
      const hasScreenReaderText = document.querySelector('.sr-only');

      // Check for high-contrast mode (often used with screen readers)
      const highContrast = window.matchMedia('(prefers-contrast: high)').matches;

      // Check for reduced motion (often used with screen readers)
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const indicators = [hasAriaLabel, hasAriaLive, hasRole, hasScreenReaderText, highContrast, reducedMotion];
      const indicatorCount = indicators.filter(Boolean).length;

      setIsScreenReaderActive(indicatorCount >= 2);
    };

    detectScreenReader();

    // Re-check when DOM changes
    const observer = new MutationObserver(detectScreenReader);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return isScreenReaderActive;
}

// Enhanced ARIA helpers
export const ARIA = {
  // Landmark helpers
  landmark: (role: string, label?: string) => ({
    role,
    ...(label && { 'aria-label': label })
  }),

  // Form helpers
  required: (required: boolean = true) => ({
    'aria-required': required.toString(),
    required
  }),

  invalid: (invalid: boolean = false, errorId?: string) => ({
    'aria-invalid': invalid.toString(),
    ...(invalid && errorId && { 'aria-describedby': errorId })
  }),

  // Navigation helpers
  current: (current: boolean = true, type: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false' = 'page') => ({
    'aria-current': current ? type : 'false'
  }),

  // Expandable content
  expandable: (expanded: boolean = false, controlsId?: string) => ({
    'aria-expanded': expanded.toString(),
    ...(controlsId && { 'aria-controls': controlsId })
  }),

  // Selection helpers
  selected: (selected: boolean = false) => ({
    'aria-selected': selected.toString()
  }),

  // Loading states
  busy: (busy: boolean = false) => ({
    'aria-busy': busy.toString()
  }),

  // Live regions
  liveRegion: (politeness: 'polite' | 'assertive' = 'polite', atomic: boolean = true) => ({
    'aria-live': politeness,
    'aria-atomic': atomic
  }),

  // Hidden content
  hidden: (hidden: boolean = true) => ({
    'aria-hidden': hidden.toString()
  }),

  // Labels and descriptions
  labelledBy: (id: string) => ({
    'aria-labelledby': id
  }),

  describedBy: (id: string) => ({
    'aria-describedby': id
  }),

  label: (label: string) => ({
    'aria-label': label
  }),

  // Press states
  pressed: (pressed: boolean = false) => ({
    'aria-pressed': pressed.toString()
  }),

  // Modal dialogs
  modal: (modal: boolean = true) => ({
    'aria-modal': modal.toString(),
    role: 'dialog'
  }),

  // Progress indicators
  progress: (value: number, max: number = 100, label?: string) => ({
    role: 'progressbar',
    'aria-valuenow': value,
    'aria-valuemax': max,
    'aria-valuemin': 0,
    ...(label && { 'aria-label': label })
  })
};

// Screen reader announcement component
interface AnnouncementProps {
  message: string;
  priority?: 'polite' | 'assertive';
  delay?: number;
}

export function Announcement({ message, priority = 'polite', delay = 0 }: AnnouncementProps) {
  const announce = useAnnouncer();

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        announce(message, priority);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [message, priority, delay, announce]);

  return null;
}

// Status announcer hook
export function useStatusAnnouncer() {
  const announce = useAnnouncer();

  return {
    announceSuccess: (message: string) => announce(`Success: ${message}`, 'polite'),
    announceError: (message: string) => announce(`Error: ${message}`, 'assertive'),
    announceWarning: (message: string) => announce(`Warning: ${message}`, 'assertive'),
    announceInfo: (message: string) => announce(`Information: ${message}`, 'polite'),
    announceProgress: (message: string) => announce(`Progress: ${message}`, 'polite')
  };
}

// Loading announcer component
export function LoadingAnnouncer({ isLoading, loadingMessage = 'Loading...', completedMessage = 'Loading completed' }: {
  isLoading: boolean;
  loadingMessage?: string;
  completedMessage?: string;
}) {
  const announce = useAnnouncer();

  useEffect(() => {
    if (isLoading) {
      announce(loadingMessage, 'polite');
    } else {
      announce(completedMessage, 'polite');
    }
  }, [isLoading, loadingMessage, completedMessage, announce]);

  return (
    <div {...ARIA.liveRegion('polite')} className="sr-only">
      {isLoading ? loadingMessage : completedMessage}
    </div>
  );
}

// Form validation announcer
export function FormValidationAnnouncer({ errors, touched }: {
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}) {
  const announce = useAnnouncer();
  const [previousErrors, setPreviousErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const newErrors = Object.keys(errors).filter(
      key => errors[key] && touched[key] && errors[key] !== previousErrors[key]
    );

    if (newErrors.length > 0) {
      const errorMessages = newErrors.map(key => `${key}: ${errors[key]}`).join(', ');
      announce(`Form validation errors: ${errorMessages}`, 'assertive');
    }

    setPreviousErrors({ ...errors });
  }, [errors, touched, announce, previousErrors]);

  return null;
}

// Navigation announcer
export function NavigationAnnouncer({ currentPage, totalPages }: {
  currentPage: string;
  totalPages?: number;
}) {
  const announce = useAnnouncer();

  useEffect(() => {
    const message = totalPages
      ? `Navigated to ${currentPage}, page ${currentPage} of ${totalPages}`
      : `Navigated to ${currentPage}`;

    announce(message, 'polite');
  }, [currentPage, totalPages, announce]);

  return null;
}

// Component for screen reader only content
export function ScreenReaderOnly({ children, tag = 'span' }: {
  children: React.ReactNode;
  tag?: keyof JSX.IntrinsicElements;
}) {
  const Tag = tag as any;

  return (
    <Tag className="sr-only">
      {children}
    </Tag>
  );
}

// Component for visually hidden labels
export function VisuallyHiddenLabel({ htmlFor, children }: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="sr-only">
      {children}
    </label>
  );
}

// Enhanced description component
export function Description({ id, children }: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="text-sm text-muted-foreground mt-1">
      {children}
    </div>
  );
}

// Error message component
export function ErrorMessage({ id, children }: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} role="alert" className="text-sm text-destructive mt-1 flex items-center gap-1">
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      {children}
    </div>
  );
}

// Success message component
export function SuccessMessage({ id, children }: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} role="status" className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      {children}
    </div>
  );
}

// Screen reader optimized table component
export function AccessibleTable({
  caption,
  headers,
  rows,
  className
}: {
  caption: string;
  headers: string[];
  rows: string[][];
  className?: string;
}) {
  return (
    <table className={className} role="table">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr>
          {headers.map((header, index) => (
            <th key={index} scope="col" className="text-left font-medium p-2 border-b">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className="p-2 border-b">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}