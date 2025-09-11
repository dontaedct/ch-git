/**
 * @fileoverview Dynamic System Strings Registry
 * @module lib/branding/system-strings
 * @author OSS Hero System
 * @version 1.0.0
 */

import { BrandNameConfig } from './logo-manager';

export interface DynamicSystemStrings {
  // Email and communication
  emailFrom: string;
  welcomeMessage: string;
  transactionalFooter: string;
  
  // Page titles and metadata
  pageTitle: string;
  pageDescription: string;
  
  // System names (non-brand-specific)
  aiSystem: string;
  guardianSystem: string;
  designSystem: string;
}

/**
 * Generate dynamic system strings based on brand configuration
 */
export function generateDynamicSystemStrings(brandNames: BrandNameConfig): DynamicSystemStrings {
  return {
    // Email and communication
    emailFrom: `${brandNames.appName} <no-reply@example.com>`,
    welcomeMessage: `Welcome to ${brandNames.appName}`,
    transactionalFooter: `This is a transactional message from ${brandNames.appName}.`,
    
    // Page titles and metadata
    pageTitle: `${brandNames.appName} Template`,
    pageDescription: `A modern micro web application template for ${brandNames.organizationName}`,
    
    // System names (non-brand-specific)
    aiSystem: 'OSS Hero',
    guardianSystem: 'Guardian',
    designSystem: 'Design Guardian',
  };
}

/**
 * Dynamic system strings manager
 */
export class DynamicSystemStringsManager {
  private brandNames: BrandNameConfig;
  private strings: DynamicSystemStrings;
  
  constructor(brandNames: BrandNameConfig) {
    this.brandNames = brandNames;
    this.strings = generateDynamicSystemStrings(brandNames);
  }
  
  /**
   * Update brand names and regenerate strings
   */
  updateBrandNames(brandNames: BrandNameConfig): void {
    this.brandNames = brandNames;
    this.strings = generateDynamicSystemStrings(brandNames);
  }
  
  /**
   * Get a specific system string
   */
  getString<K extends keyof DynamicSystemStrings>(key: K): DynamicSystemStrings[K] {
    return this.strings[key];
  }
  
  /**
   * Get all system strings
   */
  getAllStrings(): DynamicSystemStrings {
    return { ...this.strings };
  }
  
  /**
   * Process template string with brand variables
   */
  processTemplate(template: string, additionalVariables: Record<string, string> = {}): string {
    let processedTemplate = template
      // Brand variables
      .replace(/\{brandName\}/g, this.brandNames.appName)
      .replace(/\{organizationName\}/g, this.brandNames.organizationName)
      .replace(/\{fullBrand\}/g, this.brandNames.fullBrand)
      .replace(/\{shortBrand\}/g, this.brandNames.shortBrand)
      .replace(/\{navBrand\}/g, this.brandNames.navBrand);
    
    // Additional variables
    Object.entries(additionalVariables).forEach(([key, value]) => {
      processedTemplate = processedTemplate.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    });
    
    return processedTemplate;
  }
}

/**
 * Global instance for easy access
 */
let globalStringsManager: DynamicSystemStringsManager | null = null;

/**
 * Initialize the global strings manager
 */
export function initializeSystemStrings(brandNames: BrandNameConfig): void {
  globalStringsManager = new DynamicSystemStringsManager(brandNames);
}

/**
 * Get the global strings manager
 */
export function getSystemStringsManager(): DynamicSystemStringsManager {
  if (!globalStringsManager) {
    throw new Error('System strings manager not initialized. Call initializeSystemStrings() first.');
  }
  return globalStringsManager;
}

/**
 * Update global brand names
 */
export function updateGlobalBrandNames(brandNames: BrandNameConfig): void {
  if (globalStringsManager) {
    globalStringsManager.updateBrandNames(brandNames);
  }
}

/**
 * Get a system string from the global manager
 */
export function getSystemString<K extends keyof DynamicSystemStrings>(key: K): DynamicSystemStrings[K] {
  return getSystemStringsManager().getString(key);
}

/**
 * Process a template with brand variables
 */
export function processSystemTemplate(template: string, additionalVariables: Record<string, string> = {}): string {
  return getSystemStringsManager().processTemplate(template, additionalVariables);
}
