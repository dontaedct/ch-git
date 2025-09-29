/**
 * @fileoverview Advanced Keyboard Navigation System
 * @module lib/ui/keyboard-navigation
 * @version 1.0.0
 *
 * HT-034.7.4: Comprehensive keyboard navigation utilities for WCAG 2.1 compliance
 */

/**
 * Keyboard navigation manager for complex interfaces
 */
export class KeyboardNavigationManager {
  private focusableElements: HTMLElement[] = [];
  private currentIndex = -1;
  private container: HTMLElement;
  private options: NavigationOptions;
  private listeners: Map<string, (event: KeyboardEvent) => void> = new Map();

  constructor(container: HTMLElement, options: NavigationOptions = {}) {
    this.container = container;
    this.options = {
      wrap: true,
      includeHidden: false,
      focusOnMount: true,
      preserveTabOrder: true,
      skipDisabled: true,
      announceChanges: true,
      ...options
    };

    this.initialize();
  }

  private initialize() {
    this.updateFocusableElements();
    this.setupEventListeners();

    if (this.options.focusOnMount && this.focusableElements.length > 0) {
      this.focusElement(0);
    }
  }

  private updateFocusableElements() {
    const selector = this.options.includeHidden
      ? FOCUSABLE_SELECTOR
      : FOCUSABLE_SELECTOR + ':not([hidden]):not([aria-hidden="true"])';

    const elements = Array.from(this.container.querySelectorAll(selector)) as HTMLElement[];

    this.focusableElements = elements.filter(element => {
      if (this.options.skipDisabled && this.isDisabled(element)) {
        return false;
      }

      // Check if element is actually visible
      if (!this.options.includeHidden) {
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden') {
          return false;
        }
      }

      return this.isActuallyFocusable(element);
    });

    // Sort by tab order if preserveTabOrder is enabled
    if (this.options.preserveTabOrder) {
      this.focusableElements.sort(this.compareTabOrder);
    }
  }

  private isDisabled(element: HTMLElement): boolean {
    if (element.hasAttribute('disabled')) return true;
    if (element.getAttribute('aria-disabled') === 'true') return true;
    if (element.getAttribute('tabindex') === '-1' && !element.hasAttribute('role')) return true;
    return false;
  }

  private isActuallyFocusable(element: HTMLElement): boolean {
    try {
      element.focus();
      const isFocused = document.activeElement === element;
      if (isFocused && this.currentIndex === -1) {
        element.blur();
      }
      return isFocused;
    } catch {
      return false;
    }
  }

  private compareTabOrder(a: HTMLElement, b: HTMLElement): number {
    const aTabIndex = parseInt(a.getAttribute('tabindex') || '0');
    const bTabIndex = parseInt(b.getAttribute('tabindex') || '0');

    // Elements with positive tabindex come first, in numerical order
    if (aTabIndex > 0 && bTabIndex > 0) {
      return aTabIndex - bTabIndex;
    }
    if (aTabIndex > 0) return -1;
    if (bTabIndex > 0) return 1;

    // Then elements with tabindex="0" or no tabindex, in DOM order
    return 0;
  }

  private setupEventListeners() {
    const keydownHandler = (event: KeyboardEvent) => {
      this.handleKeyDown(event);
    };

    const focusinHandler = (event: FocusEvent) => {
      this.handleFocusIn(event);
    };

    this.container.addEventListener('keydown', keydownHandler);
    this.container.addEventListener('focusin', focusinHandler);

    this.listeners.set('keydown', keydownHandler);
    this.listeners.set('focusin', focusinHandler);
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (!this.shouldHandleEvent(event)) return;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        this.moveNext();
        break;

      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        this.movePrevious();
        break;

      case 'Home':
        event.preventDefault();
        this.moveToFirst();
        break;

      case 'End':
        event.preventDefault();
        this.moveToLast();
        break;

      case 'PageDown':
        event.preventDefault();
        this.moveByPage(5);
        break;

      case 'PageUp':
        event.preventDefault();
        this.moveByPage(-5);
        break;

      case 'Tab':
        this.handleTabNavigation(event);
        break;

      case 'Escape':
        this.handleEscape(event);
        break;

      case 'Enter':
      case ' ':
        this.handleActivation(event);
        break;
    }
  }

  private handleFocusIn(event: FocusEvent) {
    const target = event.target as HTMLElement;
    const index = this.focusableElements.indexOf(target);

    if (index !== -1) {
      this.currentIndex = index;

      if (this.options.announceChanges) {
        this.announceCurrentElement();
      }
    }
  }

  private shouldHandleEvent(event: KeyboardEvent): boolean {
    // Don't handle if modifier keys are pressed (except Shift for Tab)
    if (event.ctrlKey || event.altKey || event.metaKey) {
      return false;
    }

    // Don't handle if target is not within our container
    if (!this.container.contains(event.target as Node)) {
      return false;
    }

    // Don't handle if target is an input with text selection
    const target = event.target as HTMLElement;
    if (this.isTextInput(target) && this.hasTextSelection(target)) {
      return event.key === 'Escape' || event.key === 'Tab';
    }

    return true;
  }

  private isTextInput(element: HTMLElement): boolean {
    if (element.tagName === 'TEXTAREA') return true;
    if (element.tagName === 'INPUT') {
      const type = (element as HTMLInputElement).type;
      return ['text', 'password', 'email', 'search', 'url', 'tel'].includes(type);
    }
    return element.contentEditable === 'true';
  }

  private hasTextSelection(element: HTMLElement): boolean {
    if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
      const input = element as HTMLInputElement;
      return input.selectionStart !== input.selectionEnd;
    }

    const selection = window.getSelection();
    return selection !== null && !selection.isCollapsed;
  }

  private handleTabNavigation(event: KeyboardEvent) {
    // Let Tab work normally unless we're trapping focus
    if (this.options.trapFocus) {
      event.preventDefault();
      if (event.shiftKey) {
        this.movePrevious();
      } else {
        this.moveNext();
      }
    }
  }

  private handleEscape(event: KeyboardEvent) {
    if (this.options.onEscape) {
      event.preventDefault();
      this.options.onEscape();
    }
  }

  private handleActivation(event: KeyboardEvent) {
    const currentElement = this.getCurrentElement();
    if (!currentElement) return;

    // Don't handle activation for elements that handle it natively
    if (this.handlesActivationNatively(currentElement)) return;

    event.preventDefault();

    if (this.options.onActivate) {
      this.options.onActivate(currentElement, event);
    } else {
      // Default activation behavior
      currentElement.click();
    }
  }

  private handlesActivationNatively(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role');

    return (
      tagName === 'button' ||
      tagName === 'a' ||
      tagName === 'input' ||
      tagName === 'select' ||
      tagName === 'textarea' ||
      role === 'button' ||
      role === 'link'
    );
  }

  public moveNext(): boolean {
    if (this.focusableElements.length === 0) return false;

    let nextIndex = this.currentIndex + 1;

    if (nextIndex >= this.focusableElements.length) {
      if (this.options.wrap) {
        nextIndex = 0;
      } else {
        return false;
      }
    }

    return this.focusElement(nextIndex);
  }

  public movePrevious(): boolean {
    if (this.focusableElements.length === 0) return false;

    let prevIndex = this.currentIndex - 1;

    if (prevIndex < 0) {
      if (this.options.wrap) {
        prevIndex = this.focusableElements.length - 1;
      } else {
        return false;
      }
    }

    return this.focusElement(prevIndex);
  }

  public moveToFirst(): boolean {
    return this.focusElement(0);
  }

  public moveToLast(): boolean {
    return this.focusElement(this.focusableElements.length - 1);
  }

  public moveByPage(step: number): boolean {
    if (this.focusableElements.length === 0) return false;

    let newIndex = this.currentIndex + step;
    newIndex = Math.max(0, Math.min(newIndex, this.focusableElements.length - 1));

    return this.focusElement(newIndex);
  }

  public focusElement(index: number): boolean {
    if (index < 0 || index >= this.focusableElements.length) {
      return false;
    }

    const element = this.focusableElements[index];

    try {
      element.focus();
      this.currentIndex = index;

      if (this.options.announceChanges) {
        this.announceCurrentElement();
      }

      return true;
    } catch {
      return false;
    }
  }

  public getCurrentElement(): HTMLElement | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.focusableElements.length) {
      return this.focusableElements[this.currentIndex];
    }
    return null;
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public getElementCount(): number {
    return this.focusableElements.length;
  }

  public refresh(): void {
    this.updateFocusableElements();
  }

  private announceCurrentElement(): void {
    const element = this.getCurrentElement();
    if (!element) return;

    const text = this.getElementAnnouncement(element);
    if (text) {
      announceToScreenReader(text);
    }
  }

  private getElementAnnouncement(element: HTMLElement): string {
    // Priority order for element text
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    const ariaLabelledby = element.getAttribute('aria-labelledby');
    if (ariaLabelledby) {
      const labelElement = document.getElementById(ariaLabelledby);
      if (labelElement) return labelElement.textContent || '';
    }

    const textContent = element.textContent?.trim();
    if (textContent) return textContent;

    const title = element.getAttribute('title');
    if (title) return title;

    const alt = element.getAttribute('alt');
    if (alt) return alt;

    // Fallback to element role and position
    const role = element.getAttribute('role') || element.tagName.toLowerCase();
    const position = `${this.currentIndex + 1} of ${this.focusableElements.length}`;

    return `${role} ${position}`;
  }

  public destroy(): void {
    // Remove event listeners
    this.listeners.forEach((handler, eventType) => {
      this.container.removeEventListener(eventType, handler);
    });

    this.listeners.clear();
    this.focusableElements = [];
    this.currentIndex = -1;
  }
}

/**
 * Navigation options interface
 */
interface NavigationOptions {
  wrap?: boolean;
  includeHidden?: boolean;
  focusOnMount?: boolean;
  preserveTabOrder?: boolean;
  skipDisabled?: boolean;
  announceChanges?: boolean;
  trapFocus?: boolean;
  onEscape?: () => void;
  onActivate?: (element: HTMLElement, event: KeyboardEvent) => void;
}

/**
 * Focusable elements selector
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
  'details summary',
  'iframe',
  'embed',
  'object',
  'audio[controls]',
  'video[controls]',
  '[role="button"]:not([aria-disabled="true"])',
  '[role="link"]:not([aria-disabled="true"])',
  '[role="menuitem"]:not([aria-disabled="true"])',
  '[role="option"]:not([aria-disabled="true"])',
  '[role="tab"]:not([aria-disabled="true"])',
  '[role="checkbox"]:not([aria-disabled="true"])',
  '[role="radio"]:not([aria-disabled="true"])'
].join(', ');

/**
 * Screen reader announcement utility
 */
function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    if (document.body.contains(announcement)) {
      document.body.removeChild(announcement);
    }
  }, 1000);
}

/**
 * Focus trap utility for modals and dialogs
 */
export function createFocusTrap(element: HTMLElement, options: Partial<NavigationOptions> = {}): KeyboardNavigationManager {
  return new KeyboardNavigationManager(element, {
    ...options,
    trapFocus: true,
    wrap: true,
    focusOnMount: true
  });
}

/**
 * Skip link implementation
 */
export function createSkipLink(targetId: string, text: string = 'Skip to main content'): HTMLAnchorElement {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-2 focus:py-1 focus:bg-background focus:text-foreground focus:border focus:rounded';

  skipLink.addEventListener('click', (event) => {
    event.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  return skipLink;
}

/**
 * Roving tabindex implementation for toolbar-like components
 */
export class RovingTabindexManager {
  private items: HTMLElement[] = [];
  private activeIndex = 0;
  private container: HTMLElement;

  constructor(container: HTMLElement, items: HTMLElement[]) {
    this.container = container;
    this.items = items;
    this.initialize();
  }

  private initialize(): void {
    this.updateTabindices();
    this.setupEventListeners();
  }

  private updateTabindices(): void {
    this.items.forEach((item, index) => {
      item.tabIndex = index === this.activeIndex ? 0 : -1;
    });
  }

  private setupEventListeners(): void {
    this.container.addEventListener('keydown', (event) => {
      this.handleKeyDown(event);
    });

    this.items.forEach((item, index) => {
      item.addEventListener('focus', () => {
        this.setActiveIndex(index);
      });
    });
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.items.includes(event.target as HTMLElement)) return;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        this.moveToNext();
        break;

      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        this.moveToPrevious();
        break;

      case 'Home':
        event.preventDefault();
        this.moveToFirst();
        break;

      case 'End':
        event.preventDefault();
        this.moveToLast();
        break;
    }
  }

  public setActiveIndex(index: number): void {
    if (index >= 0 && index < this.items.length) {
      this.activeIndex = index;
      this.updateTabindices();
    }
  }

  public moveToNext(): void {
    const nextIndex = (this.activeIndex + 1) % this.items.length;
    this.setActiveIndex(nextIndex);
    this.items[nextIndex].focus();
  }

  public moveToPrevious(): void {
    const prevIndex = this.activeIndex === 0 ? this.items.length - 1 : this.activeIndex - 1;
    this.setActiveIndex(prevIndex);
    this.items[prevIndex].focus();
  }

  public moveToFirst(): void {
    this.setActiveIndex(0);
    this.items[0].focus();
  }

  public moveToLast(): void {
    const lastIndex = this.items.length - 1;
    this.setActiveIndex(lastIndex);
    this.items[lastIndex].focus();
  }

  public updateItems(newItems: HTMLElement[]): void {
    this.items = newItems;
    this.activeIndex = Math.min(this.activeIndex, this.items.length - 1);
    this.updateTabindices();
  }
}

/**
 * Keyboard shortcut manager
 */
export class KeyboardShortcutManager {
  private shortcuts: Map<string, () => void> = new Map();
  private element: HTMLElement;

  constructor(element: HTMLElement = document.body) {
    this.element = element;
    this.setupEventListener();
  }

  private setupEventListener(): void {
    this.element.addEventListener('keydown', (event) => {
      const shortcut = this.getShortcutKey(event);
      const handler = this.shortcuts.get(shortcut);

      if (handler) {
        event.preventDefault();
        handler();
      }
    });
  }

  private getShortcutKey(event: KeyboardEvent): string {
    const parts: string[] = [];

    if (event.ctrlKey) parts.push('ctrl');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');
    if (event.metaKey) parts.push('meta');

    parts.push(event.key.toLowerCase());

    return parts.join('+');
  }

  public addShortcut(keys: string, handler: () => void): void {
    this.shortcuts.set(keys.toLowerCase(), handler);
  }

  public removeShortcut(keys: string): void {
    this.shortcuts.delete(keys.toLowerCase());
  }

  public clear(): void {
    this.shortcuts.clear();
  }
}

export default {
  KeyboardNavigationManager,
  createFocusTrap,
  createSkipLink,
  RovingTabindexManager,
  KeyboardShortcutManager,
  announceToScreenReader
};