/**
 * @fileoverview HT-011.1.2: Dynamic Font Loading System
 * @module lib/design-tokens/font-loader
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-011.1.2 - Implement Custom Typography System
 * Focus: Dynamic font loading and management system
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (design system foundation)
 */

import { FontFamily, generateGoogleFontsUrl, generateCustomFontFaces } from './typography-generator';

export interface FontLoadOptions {
  preload?: boolean;
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  timeout?: number;
}

export interface FontLoadResult {
  success: boolean;
  fontFamily: FontFamily;
  loadTime?: number;
  error?: string;
}

export class FontLoader {
  private loadedFonts = new Set<string>();
  private loadingPromises = new Map<string, Promise<FontLoadResult>>();
  private fontFaceCache = new Map<string, FontFace>();

  /**
   * Load a single font family
   */
  async loadFont(fontFamily: FontFamily, options: FontLoadOptions = {}): Promise<FontLoadResult> {
    const startTime = Date.now();
    
    // Check if already loaded
    if (this.loadedFonts.has(fontFamily.name)) {
      return {
        success: true,
        fontFamily,
        loadTime: 0,
      };
    }
    
    // Check if already loading
    if (this.loadingPromises.has(fontFamily.name)) {
      return this.loadingPromises.get(fontFamily.name)!;
    }
    
    const loadPromise = this.performFontLoad(fontFamily, options, startTime);
    this.loadingPromises.set(fontFamily.name, loadPromise);
    
    try {
      const result = await loadPromise;
      if (result.success) {
        this.loadedFonts.add(fontFamily.name);
      }
      return result;
    } finally {
      this.loadingPromises.delete(fontFamily.name);
    }
  }
  
  /**
   * Load multiple font families
   */
  async loadFonts(fontFamilies: FontFamily[], options: FontLoadOptions = {}): Promise<FontLoadResult[]> {
    const loadPromises = fontFamilies.map(font => this.loadFont(font, options));
    return Promise.all(loadPromises);
  }
  
  /**
   * Preload fonts for better performance
   */
  async preloadFonts(fontFamilies: FontFamily[]): Promise<void> {
    const googleFonts = fontFamilies.filter(font => font.source === 'google');
    const customFonts = fontFamilies.filter(font => font.source === 'custom');
    
    // Preload Google Fonts
    if (googleFonts.length > 0) {
      const url = generateGoogleFontsUrl(googleFonts);
      if (url) {
        await this.preloadGoogleFonts(url);
      }
    }
    
    // Preload custom fonts
    for (const font of customFonts) {
      if (font.url) {
        await this.preloadCustomFont(font);
      }
    }
  }
  
  /**
   * Check if a font is loaded
   */
  isFontLoaded(fontName: string): boolean {
    return this.loadedFonts.has(fontName);
  }
  
  /**
   * Get loaded font names
   */
  getLoadedFonts(): string[] {
    return Array.from(this.loadedFonts);
  }
  
  /**
   * Clear font cache
   */
  clearCache(): void {
    this.loadedFonts.clear();
    this.loadingPromises.clear();
    this.fontFaceCache.clear();
  }
  
  private async performFontLoad(
    fontFamily: FontFamily, 
    options: FontLoadOptions, 
    startTime: number
  ): Promise<FontLoadResult> {
    try {
      switch (fontFamily.source) {
        case 'google':
          await this.loadGoogleFont(fontFamily, options);
          break;
        case 'local':
          await this.loadLocalFont(fontFamily, options);
          break;
        case 'custom':
          await this.loadCustomFont(fontFamily, options);
          break;
        default:
          throw new Error(`Unsupported font source: ${fontFamily.source}`);
      }
      
      // Verify font is actually loaded
      await this.verifyFontLoad(fontFamily);
      
      return {
        success: true,
        fontFamily,
        loadTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        fontFamily,
        loadTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  private async loadGoogleFont(fontFamily: FontFamily, options: FontLoadOptions): Promise<void> {
    const url = generateGoogleFontsUrl([fontFamily]);
    if (!url) {
      throw new Error('Failed to generate Google Fonts URL');
    }
    
    // Create link element
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.crossOrigin = 'anonymous';
    
    if (options.display) {
      link.href += `&display=${options.display}`;
    }
    
    // Add to document
    document.head.appendChild(link);
    
    // Wait for load
    await new Promise<void>((resolve, reject) => {
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load Google Font: ${fontFamily.name}`));
      
      // Timeout
      if (options.timeout) {
        setTimeout(() => reject(new Error('Font load timeout')), options.timeout);
      }
    });
  }
  
  private async loadLocalFont(fontFamily: FontFamily, options: FontLoadOptions): Promise<void> {
    // Local fonts are assumed to be available
    // Just verify they're accessible
    await this.verifyFontLoad(fontFamily);
  }
  
  private async loadCustomFont(fontFamily: FontFamily, options: FontLoadOptions): Promise<void> {
    if (!fontFamily.url) {
      throw new Error('Custom font URL is required');
    }
    
    // Check if already cached
    if (this.fontFaceCache.has(fontFamily.name)) {
      return;
    }
    
    // Create FontFace
    const fontFace = new FontFace(
      fontFamily.displayName,
      `url(${fontFamily.url})`,
      {
        weight: fontFamily.weights.join(' '),
        style: fontFamily.styles.join(' '),
        display: options.display || 'swap',
      }
    );
    
    // Load font
    const loadedFont = await fontFace.load();
    
    // Add to document
    document.fonts.add(loadedFont);
    
    // Cache
    this.fontFaceCache.set(fontFamily.name, loadedFont);
  }
  
  private async preloadGoogleFonts(url: string): Promise<void> {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = url;
    link.crossOrigin = 'anonymous';
    
    document.head.appendChild(link);
    
    // Also load the actual stylesheet
    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = url;
    styleLink.crossOrigin = 'anonymous';
    
    document.head.appendChild(styleLink);
  }
  
  private async preloadCustomFont(fontFamily: FontFamily): Promise<void> {
    if (!fontFamily.url) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.href = fontFamily.url;
    link.crossOrigin = 'anonymous';
    
    // Add font type
    const extension = fontFamily.url.split('.').pop()?.toLowerCase();
    if (extension) {
      const typeMap: Record<string, string> = {
        'woff2': 'font/woff2',
        'woff': 'font/woff',
        'ttf': 'font/ttf',
        'otf': 'font/otf',
      };
      link.type = typeMap[extension] || 'font/woff2';
    }
    
    document.head.appendChild(link);
  }
  
  private async verifyFontLoad(fontFamily: FontFamily): Promise<void> {
    // Use FontFaceSet.check() to verify font is loaded
    const fontString = `${fontFamily.weights[0]} 16px ${fontFamily.displayName}`;
    
    if (document.fonts && document.fonts.check) {
      const isLoaded = document.fonts.check(fontString);
      if (!isLoaded) {
        // Wait a bit and try again
        await new Promise(resolve => setTimeout(resolve, 100));
        const isLoadedRetry = document.fonts.check(fontString);
        if (!isLoadedRetry) {
          throw new Error(`Font verification failed: ${fontFamily.name}`);
        }
      }
    }
  }
}

// Global font loader instance
export const fontLoader = new FontLoader();

/**
 * React hook for font loading
 */
export function useFontLoader() {
  return {
    loadFont: fontLoader.loadFont.bind(fontLoader),
    loadFonts: fontLoader.loadFonts.bind(fontLoader),
    preloadFonts: fontLoader.preloadFonts.bind(fontLoader),
    isFontLoaded: fontLoader.isFontLoaded.bind(fontLoader),
    getLoadedFonts: fontLoader.getLoadedFonts.bind(fontLoader),
    clearCache: fontLoader.clearCache.bind(fontLoader),
  };
}
