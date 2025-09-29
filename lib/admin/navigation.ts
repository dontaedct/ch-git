/**
 * @fileoverview Unified Navigation and Routing System - HT-032.1.1
 * @module lib/admin/navigation
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Unified navigation and routing system that provides consistent navigation
 * experience across the modular admin interface. Supports dynamic menu
 * generation based on installed templates and user permissions.
 */

import { LucideIcon } from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  href?: string;
  onClick?: () => void;
  children?: NavigationItem[];
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  permissions?: string[];
  templateId?: string; // For template-specific navigation items
  enabled: boolean;
  order: number;
  section: 'core' | 'template' | 'integration' | 'user';
}

export interface NavigationSection {
  id: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  items: NavigationItem[];
  order: number;
  collapsible: boolean;
  defaultExpanded: boolean;
}

export interface NavigationState {
  activeItem: string | null;
  expandedSections: string[];
  searchTerm: string;
  filteredItems: NavigationItem[];
}

export interface NavigationConfig {
  showIcons: boolean;
  showDescriptions: boolean;
  showBadges: boolean;
  collapsibleSections: boolean;
  searchEnabled: boolean;
  breadcrumbsEnabled: boolean;
  maxDepth: number;
}

/**
 * Navigation Manager Class
 * Manages the unified navigation system for the modular admin interface
 */
export class NavigationManager {
  private sections: Map<string, NavigationSection> = new Map();
  private state: NavigationState = {
    activeItem: null,
    expandedSections: [],
    searchTerm: '',
    filteredItems: []
  };
  private config: NavigationConfig = {
    showIcons: true,
    showDescriptions: true,
    showBadges: true,
    collapsibleSections: true,
    searchEnabled: true,
    breadcrumbsEnabled: true,
    maxDepth: 3
  };
  private listeners: Array<(state: NavigationState) => void> = [];

  constructor(initialConfig?: Partial<NavigationConfig>) {
    if (initialConfig) {
      this.config = { ...this.config, ...initialConfig };
    }
    
    // Initialize with core navigation sections
    this.initializeCoreNavigation();
  }

  /**
   * Initialize core navigation sections
   */
  private initializeCoreNavigation(): void {
    // Core system navigation
    this.addSection({
      id: 'dashboard',
      label: 'Dashboard',
      description: 'Overview and quick actions',
      items: [
        {
          id: 'dashboard-home',
          label: 'Overview',
          description: 'System overview and statistics',
          href: '/admin',
          enabled: true,
          order: 1,
          section: 'core'
        },
        {
          id: 'dashboard-activity',
          label: 'Recent Activity',
          description: 'View recent system activity',
          href: '/admin/activity',
          enabled: true,
          order: 2,
          section: 'core'
        }
      ],
      order: 1,
      collapsible: false,
      defaultExpanded: true
    });

    // Settings navigation
    this.addSection({
      id: 'settings',
      label: 'Settings',
      description: 'System configuration and preferences',
      items: [
        {
          id: 'settings-general',
          label: 'General',
          description: 'General system settings',
          href: '/admin/settings',
          enabled: true,
          order: 1,
          section: 'core'
        },
        {
          id: 'settings-branding',
          label: 'Branding',
          description: 'Brand customization and white-labeling',
          href: '/admin/branding',
          enabled: true,
          order: 2,
          section: 'core'
        },
        {
          id: 'settings-security',
          label: 'Security',
          description: 'Security and access control',
          href: '/admin/security',
          enabled: true,
          order: 3,
          section: 'core',
          permissions: ['admin']
        }
      ],
      order: 2,
      collapsible: true,
      defaultExpanded: false
    });

    // User management navigation
    this.addSection({
      id: 'users',
      label: 'Users & Permissions',
      description: 'User management and access control',
      items: [
        {
          id: 'users-list',
          label: 'All Users',
          description: 'View and manage all users',
          href: '/admin/users',
          enabled: true,
          order: 1,
          section: 'core',
          permissions: ['admin', 'user_management']
        },
        {
          id: 'users-roles',
          label: 'Roles & Permissions',
          description: 'Manage user roles and permissions',
          href: '/admin/users/roles',
          enabled: true,
          order: 2,
          section: 'core',
          permissions: ['admin']
        },
        {
          id: 'users-invitations',
          label: 'Invitations',
          description: 'Manage user invitations',
          href: '/admin/users/invitations',
          enabled: true,
          order: 3,
          section: 'core',
          permissions: ['admin', 'user_management']
        }
      ],
      order: 3,
      collapsible: true,
      defaultExpanded: false
    });

    // Templates navigation
    this.addSection({
      id: 'templates',
      label: 'Templates',
      description: 'Template management and configuration',
      items: [
        {
          id: 'templates-library',
          label: 'Template Library',
          description: 'Browse and install templates',
          href: '/admin/templates',
          enabled: true,
          order: 1,
          section: 'core'
        },
        {
          id: 'templates-installed',
          label: 'Installed Templates',
          description: 'Manage installed templates',
          href: '/admin/templates/installed',
          enabled: true,
          order: 2,
          section: 'core'
        },
        {
          id: 'templates-marketplace',
          label: 'Marketplace',
          description: 'Discover new templates',
          href: '/admin/templates/marketplace',
          enabled: true,
          order: 3,
          section: 'core'
        }
      ],
      order: 4,
      collapsible: true,
      defaultExpanded: false
    });

    // Analytics navigation
    this.addSection({
      id: 'analytics',
      label: 'Analytics',
      description: 'Platform analytics and insights',
      items: [
        {
          id: 'analytics-overview',
          label: 'Overview',
          description: 'Platform-wide analytics overview',
          href: '/admin/analytics',
          enabled: true,
          order: 1,
          section: 'core'
        },
        {
          id: 'analytics-performance',
          label: 'Performance',
          description: 'System performance metrics',
          href: '/admin/analytics/performance',
          enabled: true,
          order: 2,
          section: 'core'
        },
        {
          id: 'analytics-reports',
          label: 'Reports',
          description: 'Generate and view reports',
          href: '/admin/analytics/reports',
          enabled: true,
          order: 3,
          section: 'core'
        }
      ],
      order: 5,
      collapsible: true,
      defaultExpanded: false
    });
  }

  /**
   * Add a navigation section
   */
  addSection(section: NavigationSection): void {
    this.sections.set(section.id, section);
    this.updateFilteredItems();
    this.notifyStateChange();
  }

  /**
   * Remove a navigation section
   */
  removeSection(sectionId: string): void {
    this.sections.delete(sectionId);
    this.updateFilteredItems();
    this.notifyStateChange();
  }

  /**
   * Add a navigation item to a section
   */
  addItem(sectionId: string, item: NavigationItem): void {
    const section = this.sections.get(sectionId);
    if (section) {
      section.items.push(item);
      section.items.sort((a, b) => a.order - b.order);
      this.updateFilteredItems();
      this.notifyStateChange();
    }
  }

  /**
   * Remove a navigation item from a section
   */
  removeItem(sectionId: string, itemId: string): void {
    const section = this.sections.get(sectionId);
    if (section) {
      section.items = section.items.filter(item => item.id !== itemId);
      this.updateFilteredItems();
      this.notifyStateChange();
    }
  }

  /**
   * Update a navigation item
   */
  updateItem(sectionId: string, itemId: string, updates: Partial<NavigationItem>): void {
    const section = this.sections.get(sectionId);
    if (section) {
      const itemIndex = section.items.findIndex(item => item.id === itemId);
      if (itemIndex !== -1) {
        section.items[itemIndex] = { ...section.items[itemIndex], ...updates };
        section.items.sort((a, b) => a.order - b.order);
        this.updateFilteredItems();
        this.notifyStateChange();
      }
    }
  }

  /**
   * Register template-specific navigation items
   */
  registerTemplateNavigation(templateId: string, items: NavigationItem[]): void {
    const templateSection: NavigationSection = {
      id: `template-${templateId}`,
      label: `${templateId} Settings`,
      description: `Settings for ${templateId} template`,
      items: items.map(item => ({ ...item, templateId, section: 'template' })),
      order: 100, // Templates appear after core sections
      collapsible: true,
      defaultExpanded: false
    };

    this.addSection(templateSection);
  }

  /**
   * Unregister template-specific navigation items
   */
  unregisterTemplateNavigation(templateId: string): void {
    this.removeSection(`template-${templateId}`);
  }

  /**
   * Set active navigation item
   */
  setActiveItem(itemId: string): void {
    this.state.activeItem = itemId;
    this.notifyStateChange();
  }

  /**
   * Toggle section expansion
   */
  toggleSection(sectionId: string): void {
    const index = this.state.expandedSections.indexOf(sectionId);
    if (index === -1) {
      this.state.expandedSections.push(sectionId);
    } else {
      this.state.expandedSections.splice(index, 1);
    }
    this.notifyStateChange();
  }

  /**
   * Set search term and update filtered items
   */
  setSearchTerm(term: string): void {
    this.state.searchTerm = term;
    this.updateFilteredItems();
    this.notifyStateChange();
  }

  /**
   * Update filtered items based on search term
   */
  private updateFilteredItems(): void {
    const allItems: NavigationItem[] = [];
    
    this.sections.forEach(section => {
      allItems.push(...section.items);
    });

    if (this.state.searchTerm.trim() === '') {
      this.state.filteredItems = allItems;
    } else {
      const searchTerm = this.state.searchTerm.toLowerCase();
      this.state.filteredItems = allItems.filter(item => 
        item.label.toLowerCase().includes(searchTerm) ||
        (item.description && item.description.toLowerCase().includes(searchTerm))
      );
    }
  }

  /**
   * Get all navigation sections
   */
  getSections(): NavigationSection[] {
    return Array.from(this.sections.values()).sort((a, b) => a.order - b.order);
  }

  /**
   * Get a specific navigation section
   */
  getSection(sectionId: string): NavigationSection | undefined {
    return this.sections.get(sectionId);
  }

  /**
   * Get navigation items for a section
   */
  getSectionItems(sectionId: string): NavigationItem[] {
    const section = this.sections.get(sectionId);
    return section ? section.items : [];
  }

  /**
   * Get all navigation items (flattened)
   */
  getAllItems(): NavigationItem[] {
    const allItems: NavigationItem[] = [];
    this.sections.forEach(section => {
      allItems.push(...section.items);
    });
    return allItems.sort((a, b) => a.order - b.order);
  }

  /**
   * Get current navigation state
   */
  getState(): NavigationState {
    return { ...this.state };
  }

  /**
   * Get navigation configuration
   */
  getConfig(): NavigationConfig {
    return { ...this.config };
  }

  /**
   * Update navigation configuration
   */
  updateConfig(updates: Partial<NavigationConfig>): void {
    this.config = { ...this.config, ...updates };
    this.notifyStateChange();
  }

  /**
   * Get breadcrumb trail for current active item
   */
  getBreadcrumbs(): Array<{ label: string; href?: string }> {
    if (!this.state.activeItem) return [];

    const breadcrumbs: Array<{ label: string; href?: string }> = [];
    
    // Find the active item and build breadcrumb trail
    for (const section of this.sections.values()) {
      const item = this.findItemInSection(section, this.state.activeItem);
      if (item) {
        breadcrumbs.push({ label: section.label });
        
        // Add parent items if nested
        const parents = this.getItemParents(section, this.state.activeItem);
        breadcrumbs.push(...parents.map(parent => ({ 
          label: parent.label, 
          href: parent.href 
        })));
        
        // Add current item
        breadcrumbs.push({ label: item.label, href: item.href });
        break;
      }
    }

    return breadcrumbs;
  }

  /**
   * Find an item within a section (including nested items)
   */
  private findItemInSection(section: NavigationSection, itemId: string): NavigationItem | null {
    for (const item of section.items) {
      if (item.id === itemId) {
        return item;
      }
      if (item.children) {
        const found = this.findItemInChildren(item.children, itemId);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * Find an item within children array
   */
  private findItemInChildren(children: NavigationItem[], itemId: string): NavigationItem | null {
    for (const child of children) {
      if (child.id === itemId) {
        return child;
      }
      if (child.children) {
        const found = this.findItemInChildren(child.children, itemId);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * Get parent items for a given item
   */
  private getItemParents(section: NavigationSection, itemId: string): NavigationItem[] {
    const parents: NavigationItem[] = [];
    
    const findParents = (items: NavigationItem[], targetId: string, currentParents: NavigationItem[]): boolean => {
      for (const item of items) {
        if (item.id === targetId) {
          parents.push(...currentParents);
          return true;
        }
        if (item.children) {
          if (findParents(item.children, targetId, [...currentParents, item])) {
            return true;
          }
        }
      }
      return false;
    };

    findParents(section.items, itemId, []);
    return parents;
  }

  /**
   * Filter items by user permissions
   */
  filterByPermissions(userPermissions: string[]): void {
    this.sections.forEach(section => {
      section.items = section.items.filter(item => 
        !item.permissions || 
        item.permissions.some(permission => userPermissions.includes(permission))
      );
    });
    
    this.updateFilteredItems();
    this.notifyStateChange();
  }

  /**
   * Subscribe to navigation state changes
   */
  subscribe(listener: (state: NavigationState) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyStateChange(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (error) {
        console.error('Error in navigation state listener:', error);
      }
    });
  }

  /**
   * Export navigation configuration
   */
  exportConfig(): string {
    const exportData = {
      sections: Array.from(this.sections.entries()),
      config: this.config
    };
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import navigation configuration
   */
  importConfig(json: string): void {
    try {
      const importData = JSON.parse(json);
      
      // Clear existing sections
      this.sections.clear();
      
      // Import sections
      if (importData.sections) {
        importData.sections.forEach(([id, section]: [string, NavigationSection]) => {
          this.sections.set(id, section);
        });
      }
      
      // Import config
      if (importData.config) {
        this.config = { ...this.config, ...importData.config };
      }
      
      this.updateFilteredItems();
      this.notifyStateChange();
    } catch (error) {
      console.error('Error importing navigation config:', error);
      throw new Error('Invalid navigation configuration format');
    }
  }
}

// Global navigation manager instance
let globalNavigationManager: NavigationManager | null = null;

/**
 * Get the global navigation manager instance
 */
export function getNavigationManager(config?: Partial<NavigationConfig>): NavigationManager {
  if (!globalNavigationManager) {
    globalNavigationManager = new NavigationManager(config);
  }
  return globalNavigationManager;
}

/**
 * Initialize navigation manager with custom configuration
 */
export function initializeNavigation(config?: Partial<NavigationConfig>): NavigationManager {
  globalNavigationManager = new NavigationManager(config);
  return globalNavigationManager;
}

// Utility functions
export function createNavigationItem(
  id: string,
  label: string,
  options: Partial<NavigationItem> = {}
): NavigationItem {
  return {
    id,
    label,
    enabled: true,
    order: 0,
    section: 'core',
    ...options
  };
}

export function createNavigationSection(
  id: string,
  label: string,
  items: NavigationItem[],
  options: Partial<NavigationSection> = {}
): NavigationSection {
  return {
    id,
    label,
    items,
    order: 0,
    collapsible: true,
    defaultExpanded: false,
    ...options
  };
}
